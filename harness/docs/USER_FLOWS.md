# Harness 用户动线（MVP）

本文将 **规划中的 Web功能** 映射到非技术用户可理解的路径。实现 UI 时，每一节可对应一个页面或向导步骤；**截图与最终文案后补**。

约定：所有「生成幻灯片页面内容」的步骤均在 **Claude Code** 中完成；Harness 只做准备、配置与 **Step 7导出**。

---

## 动线 A：从零到可编辑 PPTX（完整）

| 步骤 | 用户动作 | Harness（规划） | Claude Code |
|------|----------|----------------|-------------|
| A1 | 打开 Harness | 环境面板：Python / Pandoc / Node / 路径可写 | — |
| A2 | 新建项目 | 填写名称、画布格式（如 ppt169）→ 调用 `project_manager init` | 可选：同时在 IDE 打开仓库 |
| A3 | 上传 PDF/DOCX/MD 等 | 上传 → 自动或手动选择转换脚本 → 归入 `sources/` | — |
| A4 | 选择布局模板 | 从 `layouts_index.json` 选模板 → 复制到项目 | — |
| A5 | （可选）编辑设计规范草稿 | Markdown 编辑 `design_spec.md` 初稿 + 风险提示 | **定稿与八大确认须在 Claude 完成** |
| A6 | 去 AI 侧继续 | 复制 [CLAUDE_HANDOFF.md](./CLAUDE_HANDOFF.md) 中的提示；确认项目路径一致 | 按 [SKILL.md](../../skills/ppt-master/SKILL.md) 从 Step 1 或当前状态继续至 Step 6 |
| A7 | 回到 Harness导出 | 一键顺序执行：`total_md_split` → `finalize_svg` → `svg_to_pptx -s final` | — |
| A8 | 下载与预览 | 下载 `exports/*.pptx`；预览 `svg_final/` | — |

**截图占位**：A1 环境面板、A3 上传区、A4 模板列表、A6 交接区、A7 日志流、A8 下载条。

---

## 动线 B：已有项目，仅导出

| 步骤 | 用户动作 | Harness |
|------|----------|---------|
| B1 | 选择已有项目目录 | 列表或路径确认（与 Claude 使用同一 `projects/`） |
| B2 | 校验 | `project_manager validate` |
| B3 | 导出 | Step 7 三连 + 日志 |
| B4 | 下载 | `exports/` |

---

## 动线 C：仅做环境与生图配置（可选）

| 步骤 | 用户动作 | Harness |
|------|----------|---------|
| C1 | 查看 `.env` 说明 | 链到仓库 [.env.example](../../.env.example)；编辑建议在后端安全实现 |
| C2 | 测试图片后端 |规划：封装 `image_gen.py` 单次调用（非 MVP必选） |

---

## 与架构文档的对应

- 子进程与白名单：[ARCHITECTURE.md](./ARCHITECTURE.md)
- 与 Claude 的分工：[CLAUDE_HANDOFF.md](./CLAUDE_HANDOFF.md)

---

## 文案原则

- 明确写出：**「幻灯片内容由 Claude Code 根据 ppt-master skill 生成」**，避免用户以为仅点网页即可得到全套 SVG。
- 导出前提示：**勿与 Claude 同时改写同一项目文件**。
