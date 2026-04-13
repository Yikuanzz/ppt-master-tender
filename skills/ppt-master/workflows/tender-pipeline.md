---
description: Tender pipeline — master orchestrator for the full tender PPT creation workflow (copywriting phase → execution phase)
---

# Tender Pipeline Workflow

## Trigger Condition

User invokes the tender workflow with one of:
- "做标书"  / "标书 PPT"  / "tender" / "bid document"
- Direct call from `SKILL.md` tender-pipeline entry

## Overview

```
用户输入（招标文件 + 技术课题）
         │
         ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 文案阶段 (COPY PHASE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
│  Step 1: 需求收集  →  tender-intake.md
│  Step 2: 多源研究  →  tender-research.md
│  Step 3: 文案生成 + 评审  →  tender-copywriting.md
│          └── 通过 (≥90分) → tender-copy-final.md
│
▼
████████████████████  HARD GATE  ████████████████████
   tender-copy-final.md 必须存在且评审通过
   执行阶段绝对不能在此文件生成前启动
█████████████████████████████████████████████████████
│
▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 执行阶段 (EXECUTION PHASE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
│  Step 4: Strategist 七项确认 (style pre-locked)
│  Step 5: [Image_Generator] 可选
│  Step 6: Executor (executor-tender 风格)
│  Step 7: PPT 评审 (≥90分通过，最多3轮)
│  Step 8: Post-processing → PPTX 导出
│
▼
最终输出：exports/<project>_<timestamp>.pptx
```

---

## Project Setup

Before starting, initialize the project:

```bash
python3 skills/ppt-master/scripts/project_manager.py init <project_name> --format ppt169
```

Use the project name derived from `tender_topic` (slugified). Example:
- Topic: "广州智慧交通系统建设" → project name: `guangzhou-smart-traffic-2026`

All source files and outputs will live under `projects/<project_name>/`.

---

## COPY PHASE

### Step 1: Tender Intake

Invoke `tender-intake.md`.

**Input**: User-provided tender documents, URLs, and/or free-text topic description.
**Output**: `projects/<project>/sources/tender-brief.md` + converted source files.
**Blocking**: Do not proceed to Step 2 until `tender-brief.md` exists and all 8 parameters are confirmed.

```
[STEP 1 COMPLETE] tender-brief.md ✓
```

---

### Step 2: Tender Research

Invoke `tender-research.md`.

**Input**: `projects/<project>/sources/tender-brief.md`
**Output**: `projects/<project>/sources/research-report.md`
**Blocking**: Do not proceed to Step 3 until `research-report.md` exists.

```
[STEP 2 COMPLETE] research-report.md ✓ ({n} data points, {n} sources)
```

---

### Step 3: Copywriting Generation & Review

Invoke `tender-copywriting.md`.

**Input**: `tender-brief.md` + `research-report.md`
**Output**: `tender-copy-final.md` (only on review PASS ≥90)
**Max iterations**: 3 review rounds before user fallback

**On PASS**:
```
[STEP 3 COMPLETE] tender-copy-final.md ✓ (评审分：{score}/100)
```

**On 3× FAIL**: Present to user per `tender-copywriting.md` fallback protocol. Do NOT proceed to execution phase until user explicitly confirms.

---

## HARD GATE CHECK

Before invoking any execution-phase step, verify:

```python
# Gate check (conceptual — AI verifies this condition before proceeding)
assert exists("projects/<project>/sources/tender-copy-final.md"), \
    "GATE BLOCKED: 文案阶段未完成，执行阶段无法启动"
```

If the file does not exist:

```
[GATE BLOCKED] tender-copy-final.md 不存在。
执行阶段需要文案阶段完成后才能启动。
请先完成文案阶段（Steps 1–3）。
```

---

## EXECUTION PHASE

### Step 4: Strategist — Seven-item Confirmation (Style Pre-locked)

Invoke the Strategist role from `skills/ppt-master/references/strategist.md`.

**Critical note**: Item **d** (Style Objective Confirmation) is **bypassed** in the tender pipeline. The style is pre-locked to `executor-tender.md`. The Strategist runs the other 7 confirmation items only:

| Item | Confirmation |
|------|-------------|
| a | Source document intake check |
| b | Project metadata (client name, project name for footer) |
| c | Key information, target audience, core message |
| ~~d~~ | ~~Style objective~~ — **PRE-LOCKED: executor-tender** |
| e | Color scheme (default: navy #1A3D6B + red #C41E3A — override if brand spec differs) |
| f | Page count recommendation |
| g | Special requirements (page limit from tender-brief.special_constraints) |
| h | Slide outline confirmation |

**Strategist input**: Pass `tender-copy-final.md` as the primary source document. The Strategist reads this file to generate the slide outline and design spec.

**Strategist output**: Saves `design_spec.md` and `slide_outline.md` to the project directory per standard Strategist behavior.

---

### Step 5: Image Generation (Optional)

If the slide outline includes slides requiring custom imagery (not covered by the icon library or chart templates), invoke `image_gen.py`:

```bash
python3 skills/ppt-master/scripts/image_gen.py "<prompt>" \
  --aspect_ratio 16:9 --image_size 1K \
  -o projects/<project>/images/
```

Trigger conditions:
- Cover slide requests a project-specific hero image
- Team page requires professional headshots (placeholder generation)
- Technical approach slide needs an architectural diagram illustration

This step is skipped if the slide outline can be satisfied with icon library + chart templates alone.

---

### Step 6: Executor — Tender Style SVG Generation

Apply `skills/ppt-master/references/executor-tender.md` as the active executor style.

**Per-slide process** (standard executor think→act→observe loop):

1. **THINK**: Read the slide spec from `slide_outline.md`; identify layout pattern from `executor-tender.md` (cover / credentials / timeline / team / budget / technical approach / or standard content pattern)
2. **ACT**: Generate SVG following executor-tender conventions:
   - Navy/red palette per executor-tender color system
   - Mandatory footer band at y=700
   - Source attribution for all data slides
   - No banned SVG features
3. **OBSERVE**: Run self-check from executor-tender:
   - [ ] Footer present
   - [ ] Data attribution present
   - [ ] No text overflow beyond y=690
   - [ ] No banned SVG features

Save each slide to `projects/<project>/svg_output/`.

Run SVG quality check after all slides are generated:

```bash
python3 skills/ppt-master/scripts/svg_quality_checker.py projects/<project>/
```

Fix any reported issues before proceeding to PPT review.

---

### Step 7: PPT Review

Apply the scoring protocol from:
- `skills/ppt-master/references/reviewer-base.md`
- `skills/ppt-master/references/reviewer-tender-ppt.md`

**Reviewer input**:
- All SVG files in `projects/<project>/svg_output/`
- `design_spec.md` for visual spec reference
- `tender-copy-final.md` for content accuracy cross-check

**Pass/Fail logic**:

**PASS** (total ≥ 90):
```
[PPT REVIEW PASSED] 评审分：{score}/100
进入后处理流程。
```

**FAIL** (total < 90):
- Output per-page issue list + Improvement Priorities
- Fix identified issues (Executor re-generates affected slides)
- Re-run quality checker
- Increment iteration counter

**Iteration cap**: Max 3 review rounds.

At iteration 3 FAIL, present to user:
```
[3轮PPT评审未达90分] 当前最高分：{score}

主要问题：
{top 3 issues from per-page list}

选项：
A. 继续修改（不计入迭代上限）
B. 以当前版本导出（接受低于90分的风险）
```

---

### Step 8: Post-processing & Export

**CRITICAL**: Run each command sequentially. Confirm no errors before running the next.

```bash
# Step 8a: Split total_md
python3 skills/ppt-master/scripts/total_md_split.py projects/<project>/
# ✅ Confirm no errors

# Step 8b: Finalize SVG
python3 skills/ppt-master/scripts/finalize_svg.py projects/<project>/
# ✅ Confirm no errors

# Step 8c: Convert to PPTX
python3 skills/ppt-master/scripts/svg_to_pptx.py projects/<project>/ -s final
# Output: exports/<project>_<timestamp>.pptx
```

**Never** run these three commands in a single code block or batch invocation.
**Never** use `cp` as a substitute for `finalize_svg.py`.
**Always** export from `svg_final/` (using `-s final`), never from `svg_output/`.

---

## Final Output

```
[TENDER PIPELINE COMPLETE]

文案阶段：✓ (评审分：{copy_score}/100)
PPT阶段：✓ (评审分：{ppt_score}/100)

输出文件：
  exports/<project>_<timestamp>.pptx   ← 主输出（DrawingML 原生形状，可二次编辑）
  exports/<project>_<timestamp>_svg.pptx ← SVG 嵌入版本

项目目录：projects/<project>/
```

---

## Error Recovery

| Error | Recovery |
|-------|----------|
| `tender-brief.md` missing | Re-run Step 1 (tender-intake) |
| `research-report.md` empty or too thin | Re-run Step 2 with additional search queries |
| Copy review stuck at FAIL after 3 rounds | Use `tender-copywriting.md` user fallback protocol |
| SVG quality checker reports errors | Fix in Executor before proceeding to review |
| PPT review stuck at FAIL after 3 rounds | Use PPT review user fallback protocol |
| PPTX export fails | Check `finalize_svg.py` output for SVG syntax errors; never skip `finalize_svg.py` |
