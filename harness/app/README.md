# `harness/app/` — Web 控制台实现

本目录为 **Harness 控制面**的可执行代码根：前端与后端并列，约定见 [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)「前端 / 后端目录（已定稿）」。

## 布局

| 子目录 | 栈 | 职责 |
|--------|-----|------|
| [`frontend/`](frontend/) | Vite、React、TypeScript、Tailwind | Minimalist Monochrome UI；调用 `/api/*` |
| [`backend/`](backend/) | FastAPI、Uvicorn | 解析 `REPO_ROOT` / `PPT_PROJECTS_ROOT`；白名单子进程；上传与文件下载 |

**禁止**在 `harness/app/` 内复制 `skills/ppt-master`；运行时通过环境变量指向仓库根，并调用 `skills/ppt-master/scripts/` 下既有脚本。

## 快速启动见仓库 [harness/README.md](../README.md)（依赖安装、`pnpm`/`npm dev`、Uvicorn、环境变量与安全说明）。

## 设计真源

实现或改 UI 时必读：[docs/DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md)、[docs/FRONTEND_AGENT_PROMPT.md](../docs/FRONTEND_AGENT_PROMPT.md)。
