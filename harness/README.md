# PPT Master Harness（Web 控制台工作区）

Harness 是本仓库内**控制面（Control Plane）**的领地：Web UI 与配套 API 位于 [`harness/app/`](app/README.md)，用于降低非技术用户使用 `skills/ppt-master` 工具链的心智负担。**编排幻灯片内容（Strategist / Executor）仍须在 Claude Code 中按 [ppt-master SKILL](../skills/ppt-master/SKILL.md) 执行**；Harness 不负责替代大模型 API。

## 目标用户

- 需要可视化完成：环境检查、建项目、上传素材、选模板、编辑 `design_spec.md` 草稿、一键执行 Step 7 导出与下载产物。
- 不希望在终端里手写 `python ...project_manager.py` 的用户。
- 技术用户：仍用 Claude Code 驱动 Step 1–6；回到 Harness 做确定性导出与预览。

## 与仓库其他部分的关系

| 路径 | 含义 |
|------|------|
| 仓库根（`REPO_ROOT`） | 克隆下来的 `pptmaster` 根目录；含 `skills/`、`examples/`、`projects/` 等 |
| `skills/ppt-master/` | SKILL、references、templates、**Python 脚本真源** |
| `projects/` | 默认由 `project_manager.py` 创建的用户项目目录（画布、sources、svg、exports） |
| [`harness/app/`](app/README.md) | **Vite + React** 前端与 **FastAPI** 后端 |
| `harness/docs/` | 架构、设计系统、用户动线、Claude 交接约定——**实现 UI 前必读** |

Harness **不**在目录内复制 SKILL；运行时通过配置解析 `REPO_ROOT`，调用 `skills/ppt-master/scripts/` 下已有脚本。

## 与 Claude Code 的协作约定

1. **同一套 `projects/`**：Web 与 Claude Code 必须指向**同一磁盘路径**下的项目目录（同机开发，或内网共享盘/NFS 挂载同一路径）。否则会出现「网页里建了项目，IDE 里看不到」或互相覆盖。
2. **职责划分**：
   - **Claude Code**：按 SKILL 完成 Step 1–6（含八大确认、逐页 SVG、`notes/total.md` 等）。
   - **Harness**：Step 7 三连：`total_md_split.py` → `finalize_svg.py` → `svg_to_pptx.py -s final`；以及前置的素材与项目管理。
3. **交接**：见 [docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md)。

## 启动（开发）

### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `REPO_ROOT` | 推荐 | 仓库根；未设置时，后端从 `harness/app/backend/main.py` 相对路径推断为「含 `harness/` 的 Git 根」 |
| `PPT_PROJECTS_ROOT` | 可选 | 项目根目录；默认 `{REPO_ROOT}/projects` |

Windows PowerShell 示例：

```powershell
$env:REPO_ROOT = "C:\path\to\pptmaster"
$env:PPT_PROJECTS_ROOT = "C:\path\to\pptmaster\projects"
```

### 后端 API

```powershell
cd harness\app\backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

健康检查：<http://127.0.0.1:8000/api/health>

### 前端

另开终端：

```powershell
cd harness\app\frontend
npm install
npm run dev
```

浏览器打开 Vite 提示的本地地址（默认 <http://127.0.0.1:5173>）。开发模式下 `/api` 由 Vite 代理到 `http://127.0.0.1:8000`。

### 生产构建（可选）

```powershell
cd harness\app\frontend
npm run build
```

将 `frontend/dist` 交由静态服务器托管，并把 `/api` 反向代理到 Uvicorn；或扩展 FastAPI 挂载 `dist`（需在实现部署流水线时自行接线）。

## 安全与密钥

- **图片生成**等能力依赖仓库根 `.env`（参见 [.env.example](../.env.example)）。不要在浏览器长期存储 API Key；由服务端或本机配置注入环境变量。
- 生产/内网部署时建议最小鉴权（HTTP Basic、单组织 Token 等），并对上传体积与路径做校验。当前 MVP 仅在同机开发场景下使用；API 对项目路径做「不越界」校验，子进程不使用 `shell=True`。

## 文档索引

| 文档 | 说明 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 模块边界、子进程白名单、路径与环境变量 |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | **Minimalist Monochrome**——UI 唯一视觉真源 |
| [docs/FRONTEND_AGENT_PROMPT.md](docs/FRONTEND_AGENT_PROMPT.md) | 前端实施时代理提示词与纪律 |
| [docs/USER_FLOWS.md](docs/USER_FLOWS.md) | 非技术用户动线与 MVP 功能对应 |
| [docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md) | 项目状态 → SKILL 步骤与可复制提示 |

## 视觉说明

Harness UI **不得**沿用仓库根目录 `index.html` 的紫/青渐变与圆角卡片风格。一律遵循 [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)。
