# Claude Code 交接说明

Harness 用户完成素材与项目准备后，须在 **Claude Code** 中打开**同一仓库、同一 `projects/<项目>/` 路径**，并加载 **ppt-master** skill，按 [SKILL.md](../../skills/ppt-master/SKILL.md) 继续执行。

本文提供：**项目状态机**、**建议从哪一步继续**、**可复制给用户的消息模板**（可按语言改写）。

---

## 项目状态机

| 状态 | 条件（粗略） | 建议 Claude 从 SKILL 何处继续 |
|------|----------------|-------------------------------|
| **S0** | 仅有空项目或刚 `init`，`sources/` 未就绪 | Step 1–2：源处理与 `import-sources`（若 IDE 侧代劳，须与 Harness 路径一致） |
| **S1** | `sources/` 有材料，尚无模板决策 | Step 3：模板选择 |
| **S2** | 模板已定，无 `design_spec.md` 或未定稿 | Step 4：Strategist（八大确认 **阻塞**） |
| **S3** | `design_spec.md` 已定稿，需 AI 配图 | Step 5：Image_Generator（若适用） |
| **S4** | 需生成逐页 SVG 与 `notes/total.md` | Step 6：Executor |
| **S5** | `svg_output/` 与 `notes/total.md` 已齐 | **回 Harness** 执行 Step 7（或用户在终端手动三连） |

>精确门槛以 SKILL 各步 **GATE** 为准；上表仅为 Harness 产品内「进度提示」用。

---

## 路径约定（须复制到提示中）

将下列占位符替换为真实绝对路径或工作区相对路径（团队自行统一）：

- `REPO_ROOT`：本仓库根目录  
- `PROJECT_DIR`：`{REPO_ROOT}/projects/<项目文件夹名>`  

**Claude Code 与 Harness 必须使用同一 `PROJECT_DIR`。**

---

## 可复制提示模板（中文）

在下列消息中替换 `PROJECT_DIR` 后，粘贴到 Claude Code：

```text
我在本仓库使用 ppt-master 做幻灯片。请严格按仓库内 skills/ppt-master/SKILL.md 执行，不要跳过 BLOCKING 步骤。

项目目录（单一事实来源）：PROJECT_DIR

请根据当前目录状态，从 SKILL 中合适的 Step 开始：
- 若尚无 design_spec.md 或八大确认未完成，从 Step 4 Strategist 开始并等待我确认。
- 若 design_spec 已定稿且需要逐页 SVG，从 Step 6 Executor 开始，逐页连续生成到 svg_output/ 并写好 notes/total.md。
- 若 svg 与 total.md 已齐，提醒我回到 Harness（或本地）按 Step 7 顺序执行 total_md_split → finalize_svg → svg_to_pptx -s final，不要合并成一条 shell。

技能与参考均在：skills/ppt-master/
```

---

## 可复制提示模板（English）

```text
I'm using ppt-master in this repo. Follow skills/ppt-master/SKILL.md strictly; do not skip BLOCKING steps.

Project directory (SSOT): PROJECT_DIR

Pick up from the appropriate Step based on current files:
- If design_spec.md / Eight Confirmations are not done, start at Step 4 and wait for my confirmation.
- If the spec is finalized and slides are needed, start at Step 6 Executor; generate SVG pages sequentially into svg_output/ and write notes/total.md.
- If svg_output and notes/total.md are ready, tell me to run Harness Step 7 (or run locally) as three separate commands: total_md_split, finalize_svg, svg_to_pptx -s final.

All skill assets live under skills/ppt-master/
```

---

## CHECKLIST.md 是否写入项目

- **可选**。若产品希望在项目根生成 `CHECKLIST.md`，内容应与本状态机一致，并含当前 `PROJECT_DIR` 与 SKILL 链接。
- **注意**：勿与 `design_spec.md` 或 `notes/` 命名冲突；生成前询问用户或作为 Harness「导出交接包」选项。

---

## Step 7 提醒（给最终用户）

必须在 **三步全部成功** 后再取 PPTX：

1. `python skills/ppt-master/scripts/total_md_split.py PROJECT_DIR`  
2. `python skills/ppt-master/scripts/finalize_svg.py PROJECT_DIR`  
3. `python skills/ppt-master/scripts/svg_to_pptx.py PROJECT_DIR -s final`  

细节与禁忌见 SKILL Step 7（禁止跳过 `finalize`、禁止从 `svg_output` 直接导出等）。
