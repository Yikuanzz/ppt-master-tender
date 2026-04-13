"""Harness API: whitelist subprocesses and path-safe project operations."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel, Field

# backend/main.py -> app -> harness -> repo
_BACKEND_DIR = Path(__file__).resolve().parent
_APP_DIR = _BACKEND_DIR.parent
_HARNESS_DIR = _APP_DIR.parent
_DEFAULT_REPO_ROOT = _HARNESS_DIR.parent


def _repo_root() -> Path:
    raw = os.environ.get("REPO_ROOT", "").strip()
    if raw:
        return Path(raw).resolve()
    return _DEFAULT_REPO_ROOT.resolve()


def _projects_root() -> Path:
    raw = os.environ.get("PPT_PROJECTS_ROOT", "").strip()
    if raw:
        return Path(raw).resolve()
    return (_repo_root() / "projects").resolve()


def skill_scripts() -> Path:
    p = _repo_root() / "skills" / "ppt-master" / "scripts"
    return p.resolve()


def skill_dir() -> Path:
    return _repo_root() / "skills" / "ppt-master"


def layouts_index_path() -> Path:
    return (
        skill_dir() / "templates" / "layouts" / "layouts_index.json"
    ).resolve()


def is_within_path(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except ValueError:
        return False


def resolve_project(project_ref: str) -> Path:
    projects_root = _projects_root()
    ref = (project_ref or "").strip()
    if not ref:
        raise HTTPException(status_code=400, detail="project is required")
    p = Path(ref)
    if p.is_absolute():
        resolved = p.resolve()
    else:
        resolved = (projects_root / ref).resolve()
    if not is_within_path(resolved, projects_root):
        raise HTTPException(status_code=400, detail="project path escapes projects root")
    return resolved


def run_cmd(
    argv: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
) -> tuple[int, str, str]:
    r = subprocess.run(
        argv,
        cwd=str(cwd) if cwd else str(_repo_root()),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env={**os.environ, **(env or {})},
        shell=False,
    )
    return r.returncode, r.stdout or "", r.stderr or ""


app = FastAPI(title="PPT Master Harness API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/config")
def api_config() -> dict[str, str]:
    rr = _repo_root()
    pr = _projects_root()
    return {
        "repo_root": str(rr),
        "projects_root": str(pr),
        "skill_scripts": str(skill_scripts()),
    }


@app.get("/api/env")
def api_env() -> dict[str, Any]:
    rr = _repo_root()
    pr = _projects_root()
    scripts = skill_scripts()
    pandoc = shutil.which("pandoc")
    node = shutil.which("node")
    writable = False
    writable_error: str | None = None
    try:
        pr.mkdir(parents=True, exist_ok=True)
        probe = pr / ".harness_write_probe"
        probe.write_text("", encoding="utf-8")
        probe.unlink(missing_ok=True)
        writable = True
    except OSError as e:
        writable_error = str(e)

    return {
        "repo_root": str(rr),
        "repo_root_exists": rr.is_dir(),
        "skill_scripts_exists": scripts.is_dir(),
        "projects_root": str(pr),
        "projects_root_writable": writable,
        "projects_root_writable_error": writable_error,
        "python_executable": sys.executable,
        "python_version": sys.version.split()[0],
        "pandoc": pandoc,
        "node": node,
    }


class InitBody(BaseModel):
    name: str = Field(..., min_length=1)
    format: str = "ppt169"


@app.post("/api/projects/init")
def project_init(body: InitBody) -> dict[str, Any]:
    pm = skill_scripts() / "project_manager.py"
    if not pm.is_file():
        raise HTTPException(status_code=500, detail="project_manager.py not found")
    pr = _projects_root()
    pr.mkdir(parents=True, exist_ok=True)
    argv = [
        sys.executable,
        str(pm),
        "init",
        body.name,
        "--format",
        body.format,
        "--dir",
        str(pr),
    ]
    code, out, err = run_cmd(argv)
    text = (out + "\n" + err).strip()
    if code != 0:
        raise HTTPException(
            status_code=400,
            detail={"exit_code": code, "log": text[-8000:]},
        )
    m = re.search(r"\[OK\] Project initialized:\s*(.+)", text)
    path = m.group(1).strip() if m else ""
    return {"ok": True, "project_path": path, "log": text}


@app.get("/api/projects")
def list_projects() -> dict[str, Any]:
    pr = _projects_root()
    if not pr.is_dir():
        return {"projects": []}
    names = sorted(
        p.name for p in pr.iterdir() if p.is_dir() and not p.name.startswith(".")
    )
    return {
        "projects": [{"name": n, "path": str(pr / n)} for n in names],
    }


class ProjectRef(BaseModel):
    project: str


@app.post("/api/projects/validate")
def project_validate(body: ProjectRef) -> dict[str, Any]:
    proj = resolve_project(body.project)
    if not proj.is_dir():
        raise HTTPException(status_code=404, detail="project directory not found")
    pm = skill_scripts() / "project_manager.py"
    code, out, err = run_cmd([sys.executable, str(pm), "validate", str(proj)])
    text = (out + "\n" + err).strip()
    return {
        "ok": code == 0,
        "exit_code": code,
        "log": text[-16000:],
    }


@app.post("/api/projects/info")
def project_info(body: ProjectRef) -> dict[str, Any]:
    proj = resolve_project(body.project)
    pm = skill_scripts() / "project_manager.py"
    code, out, err = run_cmd([sys.executable, str(pm), "info", str(proj)])
    text = (out + "\n" + err).strip()
    if code != 0:
        raise HTTPException(
            status_code=400,
            detail={"exit_code": code, "log": text[-8000:]},
        )
    return {"log": text}


@app.post("/api/projects/import-sources")
async def import_sources(
    project: str = Form(...),
    files: list[UploadFile] | None = File(None),
) -> dict[str, Any]:
    proj = resolve_project(project)
    if not proj.is_dir():
        raise HTTPException(status_code=404, detail="project not found")
    pm = skill_scripts() / "project_manager.py"
    upload_list = files or []
    tmp_paths: list[str] = []
    try:
        for uf in upload_list:
            if not uf.filename:
                continue
            safe_name = Path(uf.filename).name
            fd, tpath = tempfile.mkstemp(
                prefix="harness_upload_",
                suffix=Path(safe_name).suffix,
            )
            os.close(fd)
            data = await uf.read()
            Path(tpath).write_bytes(data)
            tmp_paths.append(tpath)
        if not tmp_paths:
            raise HTTPException(status_code=400, detail="no files uploaded")
        argv = [
            sys.executable,
            str(pm),
            "import-sources",
            str(proj),
            *tmp_paths,
            "--copy",
        ]
        code, out, err = run_cmd(argv)
        text = (out + "\n" + err).strip()
        if code != 0:
            raise HTTPException(
                status_code=400,
                detail={"exit_code": code, "log": text[-16000:]},
            )
        return {"ok": True, "log": text}
    finally:
        for t in tmp_paths:
            Path(t).unlink(missing_ok=True)


class ImportUrlsBody(BaseModel):
    project: str
    urls: list[str] = Field(default_factory=list)


@app.post("/api/projects/import-urls")
def import_urls(body: ImportUrlsBody) -> dict[str, Any]:
    if not body.urls:
        raise HTTPException(status_code=400, detail="urls required")
    proj = resolve_project(body.project)
    pm = skill_scripts() / "project_manager.py"
    argv = [
        sys.executable,
        str(pm),
        "import-sources",
        str(proj),
        *body.urls,
        "--copy",
    ]
    code, out, err = run_cmd(argv)
    text = (out + "\n" + err).strip()
    if code != 0:
        raise HTTPException(
            status_code=400,
            detail={"exit_code": code, "log": text[-16000:]},
        )
    return {"ok": True, "log": text}


class ConvertBody(BaseModel):
    project: str
    filename: str


@app.post("/api/sources/convert-one")
def convert_one(body: ConvertBody) -> dict[str, Any]:
    """Re-run conversion for a single file already under sources/ (by filename)."""
    proj = resolve_project(body.project)
    scripts = skill_scripts()
    src_dir = proj / "sources"
    fname = Path(body.filename).name
    src_file = (src_dir / fname).resolve()
    if not is_within_path(src_file, src_dir) or not src_file.is_file():
        raise HTTPException(status_code=400, detail="invalid source file")
    suffix = src_file.suffix.lower()
    out_md = src_file.with_suffix(".md")
    if suffix == ".pdf":
        script = scripts / "source_to_md" / "pdf_to_md.py"
        argv = [sys.executable, str(script), str(src_file), "-o", str(out_md)]
    elif suffix in {".pptx", ".pptm", ".ppsx", ".ppsm", ".potx", ".potm"}:
        script = scripts / "source_to_md" / "ppt_to_md.py"
        argv = [sys.executable, str(script), str(src_file), "-o", str(out_md)]
    elif suffix in {
        ".docx",
        ".doc",
        ".odt",
        ".rtf",
        ".epub",
        ".html",
        ".htm",
        ".tex",
        ".latex",
        ".rst",
        ".org",
        ".ipynb",
        ".typ",
    }:
        script = scripts / "source_to_md" / "doc_to_md.py"
        argv = [sys.executable, str(script), str(src_file), "-o", str(out_md)]
    else:
        raise HTTPException(
            status_code=400,
            detail="unsupported type for convert-one; use import or web flow",
        )
    code, out, err = run_cmd(argv)
    text = (out + "\n" + err).strip()
    if code != 0:
        raise HTTPException(
            status_code=400,
            detail={"exit_code": code, "log": text[-8000:]},
        )
    return {"ok": True, "markdown": str(out_md), "log": text}


@app.get("/api/templates")
def get_templates() -> dict[str, Any]:
    p = layouts_index_path()
    if not p.is_file():
        raise HTTPException(status_code=500, detail="layouts_index.json missing")
    data = json.loads(p.read_text(encoding="utf-8"))
    return data


class ApplyTemplateBody(BaseModel):
    project: str
    layout_id: str = Field(..., min_length=1)


@app.post("/api/templates/apply")
def apply_template(body: ApplyTemplateBody) -> dict[str, Any]:
    if "/" in body.layout_id or "\\" in body.layout_id or ".." in body.layout_id:
        raise HTTPException(status_code=400, detail="invalid layout_id")
    proj = resolve_project(body.project)
    layout_dir = (skill_dir() / "templates" / "layouts" / body.layout_id).resolve()
    if not layout_dir.is_dir() or not is_within_path(
        layout_dir,
        (skill_dir() / "templates" / "layouts").resolve(),
    ):
        raise HTTPException(status_code=404, detail="unknown layout_id")
    dest_templates = proj / "templates"
    dest_images = proj / "images"
    dest_templates.mkdir(parents=True, exist_ok=True)
    dest_images.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []
    for svg in layout_dir.glob("*.svg"):
        target = dest_templates / svg.name
        shutil.copy2(svg, target)
        copied.append(str(target))
    spec = layout_dir / "design_spec.md"
    if spec.is_file():
        shutil.copy2(spec, dest_templates / "design_spec.md")
        copied.append(str(dest_templates / "design_spec.md"))
    for pat in ("*.png", "*.jpg", "*.jpeg"):
        for img in layout_dir.glob(pat):
            shutil.copy2(img, dest_images / img.name)
            copied.append(str(dest_images / img.name))
    return {"ok": True, "copied": copied}


@app.get("/api/projects/{project}/design-spec", response_class=PlainTextResponse)
def get_design_spec(project: str) -> PlainTextResponse:
    proj = resolve_project(project)
    spec = proj / "design_spec.md"
    if not spec.is_file():
        return PlainTextResponse("", status_code=200)
    return PlainTextResponse(spec.read_text(encoding="utf-8", errors="replace"))


class DesignSpecBody(BaseModel):
    project: str
    content: str


@app.put("/api/projects/design-spec")
def put_design_spec(body: DesignSpecBody) -> dict[str, bool]:
    proj = resolve_project(body.project)
    spec = proj / "design_spec.md"
    spec.write_text(body.content, encoding="utf-8")
    return {"ok": True}


PROMPT_ZH = """我在本仓库使用 ppt-master 做幻灯片。请严格按仓库内 skills/ppt-master/SKILL.md 执行，不要跳过 BLOCKING 步骤。

项目目录（单一事实来源）：PROJECT_DIR

请根据当前目录状态，从 SKILL 中合适的 Step 开始：
- 若尚无 design_spec.md 或八大确认未完成，从 Step 4 Strategist 开始并等待我确认。
- 若 design_spec 已定稿且需要逐页 SVG，从 Step 6 Executor 开始，逐页连续生成到 svg_output/ 并写好 notes/total.md。
- 若 svg 与 total.md 已齐，提醒我回到 Harness（或本地）按 Step 7 顺序执行 total_md_split → finalize_svg → svg_to_pptx -s final，不要合并成一条 shell。

技能与参考均在：skills/ppt-master/
"""

PROMPT_EN = """I'm using ppt-master in this repo. Follow skills/ppt-master/SKILL.md strictly; do not skip BLOCKING steps.

Project directory (SSOT): PROJECT_DIR

Pick up from the appropriate Step based on current files:
- If design_spec.md / Eight Confirmations are not done, start at Step 4 and wait for my confirmation.
- If the spec is finalized and slides are needed, start at Step 6 Executor; generate SVG pages sequentially into svg_output/ and write notes/total.md.
- If svg_output and notes/total.md are ready, tell me to run Harness Step 7 (or run locally) as three separate commands: total_md_split, finalize_svg, svg_to_pptx -s final.

All skill assets live under skills/ppt-master/
"""


@app.get("/api/handoff")
def handoff(project: str) -> dict[str, Any]:
    proj = resolve_project(project)
    pd = str(proj)
    return {
        "project_dir": pd,
        "prompt_zh": PROMPT_ZH.replace("PROJECT_DIR", pd),
        "prompt_en": PROMPT_EN.replace("PROJECT_DIR", pd),
        "warnings": [
            "Claude Code 与 Harness 必须使用同一项目目录。",
            "定稿与八大确认须在 Claude 侧完成；Harness 仅提供草稿编辑。",
        ],
    }


class Step7Body(BaseModel):
    project: str


@app.post("/api/export/step7")
def export_step7(body: Step7Body) -> dict[str, Any]:
    proj = resolve_project(body.project)
    if not proj.is_dir():
        raise HTTPException(status_code=404, detail="project not found")
    scripts = skill_scripts()
    steps = [
        [sys.executable, str(scripts / "total_md_split.py"), str(proj)],
        [sys.executable, str(scripts / "finalize_svg.py"), str(proj)],
        [
            sys.executable,
            str(scripts / "svg_to_pptx.py"),
            str(proj),
            "-s",
            "final",
        ],
    ]
    logs: list[dict[str, Any]] = []
    for i, argv in enumerate(steps, start=1):
        code, out, err = run_cmd(argv)
        chunk = (out + "\n" + err).strip()
        logs.append(
            {
                "step": i,
                "command": " ".join(argv[2:]) if len(argv) > 2 else " ".join(argv),
                "exit_code": code,
                "log": chunk[-12000:],
            }
        )
        if code != 0:
            return {
                "ok": False,
                "failed_at": i,
                "steps": logs,
                "skill_doc": "skills/ppt-master/SKILL.md Step 7",
            }
    return {"ok": True, "steps": logs}


def _safe_asset_path(proj: Path, relative: str) -> Path:
    rel = relative.replace("\\", "/").lstrip("/")
    if ".." in rel.split("/"):
        raise HTTPException(status_code=400, detail="invalid path")
    full = (proj / rel).resolve()
    allowed_roots = [
        (proj / "svg_final").resolve(),
        (proj / "exports").resolve(),
        (proj / "sources").resolve(),
    ]
    for root in allowed_roots:
        if is_within_path(full, root) and full.is_file():
            return full
    raise HTTPException(status_code=404, detail="file not found or not allowed")


@app.get("/api/projects/{project}/assets/list")
def list_assets(project: str, kind: str) -> dict[str, Any]:
    proj = resolve_project(project)
    if kind == "svg_final":
        d = proj / "svg_final"
    elif kind == "exports":
        d = proj / "exports"
    else:
        raise HTTPException(status_code=400, detail="kind must be svg_final or exports")
    if not d.is_dir():
        return {"files": []}
    files = sorted(
        str(p.relative_to(proj)).replace("\\", "/")
        for p in d.iterdir()
        if p.is_file()
    )
    return {"files": files}


@app.get("/api/projects/{project}/assets/raw")
def raw_asset(project: str, relative: str):
    proj = resolve_project(project)
    full = _safe_asset_path(proj, relative)
    mt = "application/octet-stream"
    if full.suffix.lower() == ".svg":
        mt = "image/svg+xml"
    elif full.suffix.lower() == ".pptx":
        mt = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    return FileResponse(full, media_type=mt, filename=full.name)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
