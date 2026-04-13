import { useCallback, useEffect, useMemo, useState } from 'react'

type EnvPayload = {
  repo_root: string
  repo_root_exists: boolean
  skill_scripts_exists: boolean
  projects_root: string
  projects_root_writable: boolean
  projects_root_writable_error: string | null
  python_executable: string
  python_version: string
  pandoc: string | null
  node: string | null
}

type ConfigPayload = {
  repo_root: string
  projects_root: string
  skill_scripts: string
}

type ProjectRow = { name: string; path: string }

type TemplatesPayload = {
  layouts?: Record<string, { label?: string; summary?: string }>
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })
  if (!r.ok) {
    let detail: unknown = await r.text()
    try {
      detail = JSON.parse(detail as string)
    } catch {
      /* keep text */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  if (r.status === 204) return undefined as T
  return r.json() as Promise<T>
}

function LogBlock({ text }: { text: string }) {
  if (!text) return null
  return (
    <pre className="font-mono text-xs whitespace-pre-wrap border border-border p-3 bg-muted max-h-64 overflow-auto mt-2">
      {text}
    </pre>
  )
}

export default function App() {
  const [env, setEnv] = useState<EnvPayload | null>(null)
  const [cfg, setCfg] = useState<ConfigPayload | null>(null)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [selected, setSelected] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [initName, setInitName] = useState('demo')
  const [initFormat, setInitFormat] = useState('ppt169')
  const [log, setLog] = useState('')

  const [urlsText, setUrlsText] = useState('')
  const [templates, setTemplates] = useState<TemplatesPayload | null>(null)
  const [layoutPick, setLayoutPick] = useState('exhibit')

  const [designSpec, setDesignSpec] = useState('')
  const [handoffZh, setHandoffZh] = useState('')
  const [handoffEn, setHandoffEn] = useState('')
  const [svgFiles, setSvgFiles] = useState<string[]>([])
  const [exportFiles, setExportFiles] = useState<string[]>([])

  const refreshProjects = useCallback(async () => {
    const data = await api<{ projects: ProjectRow[] }>('/api/projects')
    setProjects(data.projects)
  }, [])

  const loadBootstrap = useCallback(async () => {
    setError(null)
    try {
      const [e, c] = await Promise.all([
        api<EnvPayload>('/api/env'),
        api<ConfigPayload>('/api/config'),
      ])
      setEnv(e)
      setCfg(c)
      await refreshProjects()
      const t = await api<TemplatesPayload>('/api/templates')
      setTemplates(t)
      const keys = t.layouts ? Object.keys(t.layouts) : []
      if (keys.length) setLayoutPick(keys[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [refreshProjects])

  useEffect(() => {
    void loadBootstrap()
  }, [loadBootstrap])

  useEffect(() => {
    if (!selected) return
    void (async () => {
      try {
        const r = await fetch(`/api/projects/${encodeURIComponent(selected)}/design-spec`)
        setDesignSpec(await r.text())
      } catch {
        setDesignSpec('')
      }
    })()
  }, [selected])

  const layoutOptions = useMemo(() => {
    if (!templates?.layouts) return []
    return Object.entries(templates.layouts).map(([id, meta]) => ({
      id,
      label: meta.label ?? id,
    }))
  }, [templates])

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setLog('')
    setError(null)
    try {
      await fn()
    } catch (err) {
      setLog(err instanceof Error ? err.message : String(err))
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const copyText = async (s: string) => {
    await navigator.clipboard.writeText(s)
  }

  const loadHandoff = async () => {
    if (!selected) return
    const h = await api<{
      prompt_zh: string
      prompt_en: string }>(`/api/handoff?project=${encodeURIComponent(selected)}`)
    setHandoffZh(h.prompt_zh)
    setHandoffEn(h.prompt_en)
  }

  const loadAssetLists = async () => {
    if (!selected) return
    const [s, e] = await Promise.all([
      api<{ files: string[] }>(
        `/api/projects/${encodeURIComponent(selected)}/assets/list?kind=svg_final`,
      ),
      api<{ files: string[] }>(
        `/api/projects/${encodeURIComponent(selected)}/assets/list?kind=exports`,
      ),
    ])
    setSvgFiles(s.files)
    setExportFiles(e.files)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-8">
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          PPT Master Harness
        </h1>
        <p className="mt-3 text-mutedForeground max-w-3xl font-serif">
          控制面：环境、项目、素材与 Step 7 导出。幻灯片内容编排仍在 Claude Code（ppt-master SKILL）中完成。
        </p>
      </header>

      <main className="px-6 py-8 space-y-10 max-w-5xl">
        {error ? (
          <div className="border border-border bg-muted p-4 font-mono text-sm">{error}</div>
        ) : null}

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">环境</h2>
          <div className="grid gap-3 md:grid-cols-2 font-mono text-sm">
            <div>
              <span className="text-mutedForeground">Python</span>
              <div>{env?.python_version ?? '—'}</div>
              <div className="text-mutedForeground break-all">{env?.python_executable}</div>
            </div>
            <div>
              <span className="text-mutedForeground">Pandoc</span>
              <div>{env?.pandoc ?? '未找到'}</div>
              <span className="text-mutedForeground block mt-2">Node</span>
              <div>{env?.node ?? '未找到'}</div>
            </div>
            <div className="md:col-span-2">
              <span className="text-mutedForeground">仓库根 REPO_ROOT</span>
              <div className="break-all">{cfg?.repo_root}</div>
              <div className="mt-1">
                skill 脚本目录存在：{env?.skill_scripts_exists ? '是' : '否'} · 仓库根存在：
                {env?.repo_root_exists ? '是' : '否'}
              </div>
            </div>
            <div className="md:col-span-2">
              <span className="text-mutedForeground">PPT_PROJECTS_ROOT</span>
              <div className="break-all">{cfg?.projects_root}</div>
              <div className="mt-1">
                可写：{env?.projects_root_writable ? '是' : '否'}
                {env?.projects_root_writable_error
                  ? `（${env.projects_root_writable_error}）`
                  : ''}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="border border-border px-4 py-2 bg-foreground text-background hover:bg-muted hover:text-foreground transition-colors duration-75 disabled:opacity-50"
            disabled={busy}
            onClick={() => void loadBootstrap()}
          >
            重新检测
          </button>
        </section>

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">项目</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex flex-col gap-1 font-mono text-sm">
              当前项目
              <select
                className="border border-border bg-background px-3 py-2 min-w-[240px] font-serif"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">—</option>
                {projects.map((p) => (
                  <option key={p.path} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await refreshProjects()
                })
              }
            >
              刷新列表
            </button>
          </div>

          <div className="border border-borderLight p-4 space-y-3 bg-muted/30">
            <h3 className="font-display text-lg">新建 init</h3>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 font-mono text-sm">
                名称
                <input
                  className="border border-border px-3 py-2 bg-background font-serif"
                  value={initName}
                  onChange={(e) => setInitName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 font-mono text-sm">
                画布
                <input
                  className="border border-border px-3 py-2 bg-background font-serif"
                  value={initFormat}
                  onChange={(e) => setInitFormat(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="self-end border border-border px-4 py-2 bg-foreground text-background hover:bg-muted hover:text-foreground transition-colors duration-75 disabled:opacity-50"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const res = await api<{ log: string; project_path: string }>(
                      '/api/projects/init',
                      {
                        method: 'POST',
                        body: JSON.stringify({ name: initName, format: initFormat }),
                      },
                    )
                    setLog(res.log)
                    await refreshProjects()
                    const name = res.project_path.split(/[/\\]/).pop() ?? ''
                    if (name) setSelected(name)
                  })
                }
              >
                初始化
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={busy || !selected}
              onClick={() =>
                run(async () => {
                  const res = await api<{ log: string }>('/api/projects/validate', {
                    method: 'POST',
                    body: JSON.stringify({ project: selected }),
                  })
                  setLog(res.log)
                })
              }
            >
              validate
            </button>
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={busy || !selected}
              onClick={() =>
                run(async () => {
                  const res = await api<{ log: string }>('/api/projects/info', {
                    method: 'POST',
                    body: JSON.stringify({ project: selected }),
                  })
                  setLog(res.log)
                })
              }
            >
              info
            </button>
          </div>
          <LogBlock text={log} />
        </section>

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">素材</h2>
          <p className="text-sm text-mutedForeground">
            上传文件将写入临时路径并以 <span className="font-mono">--copy</span> 导入；勿与 Claude
            同时改写同一项目。
          </p>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              void run(async () => {
                const r = await fetch('/api/projects/import-sources', {
                  method: 'POST',
                  body: fd,
                })
                const text = await r.text()
                if (!r.ok) throw new Error(text)
                setLog(JSON.parse(text).log ?? text)
              })
            }}
          >
            <input type="hidden" name="project" value={selected} />
            <input
              type="file"
              name="files"
              multiple
              className="font-mono text-sm"
              disabled={!selected || busy}
            />
            <div>
              <button
                type="submit"
                className="border border-border px-4 py-2 disabled:opacity-50"
                disabled={!selected || busy}
              >
                上传并 import-sources
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <label className="block font-mono text-sm text-mutedForeground">
              每行一个 URL（import-sources）
            </label>
            <textarea
              className="w-full border border-border p-3 font-mono text-sm min-h-[88px] bg-background"
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              disabled={!selected || busy}
            />
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={!selected || busy}
              onClick={() =>
                run(async () => {
                  const lines = urlsText
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  const res = await api<{ log: string }>('/api/projects/import-urls', {
                    method: 'POST',
                    body: JSON.stringify({ project: selected, urls: lines }),
                  })
                  setLog(res.log)
                })
              }
            >
              导入 URL
            </button>
          </div>
        </section>

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">布局模板</h2>
          <p className="text-sm text-mutedForeground">
            自 layouts_index.json；复制 SVG 与 design_spec 至项目 templates/，图片至 images/（与 SKILL
            约定一致）。
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <select
              className="border border-border px-3 py-2 bg-background font-serif min-w-[240px]"
              value={layoutPick}
              onChange={(e) => setLayoutPick(e.target.value)}
            >
              {layoutOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={!selected || busy}
              onClick={() =>
                run(async () => {
                  const res = await api<{ copied: string[] }>('/api/templates/apply', {
                    method: 'POST',
                    body: JSON.stringify({ project: selected, layout_id: layoutPick }),
                  })
                  setLog(res.copied.join('\n'))
                })
              }
            >
              应用到项目
            </button>
          </div>
        </section>

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">design_spec.md（草稿）</h2>
          <p className="text-sm text-mutedForeground">
            定稿与八大确认须在 Claude 完成；此处仅编辑项目根 design_spec.md。
          </p>
          <textarea
            className="w-full border border-border p-3 font-mono text-sm min-h-[200px] bg-background"
            value={designSpec}
            onChange={(e) => setDesignSpec(e.target.value)}
            disabled={!selected || busy}
          />
          <button
            type="button"
            className="border border-border px-4 py-2 disabled:opacity-50"
            disabled={!selected || busy}
            onClick={() =>
              run(async () => {
                await api('/api/projects/design-spec', {
                  method: 'PUT',
                  body: JSON.stringify({ project: selected, content: designSpec }),
                })
                setLog('已保存 design_spec.md')
              })
            }
          >
            保存
          </button>
        </section>

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">Claude 交接</h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={!selected || busy}
              onClick={() =>
                run(async () => {
                  await loadHandoff()
                  setLog('已加载可复制提示')
                })
              }
            >
              加载提示
            </button>
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={!handoffZh}
              onClick={() => void copyText(handoffZh)}
            >
              复制中文
            </button>
            <button
              type="button"
              className="border border-border px-4 py-2 disabled:opacity-50"
              disabled={!handoffEn}
              onClick={() => void copyText(handoffEn)}
            >
              复制 English
            </button>
          </div>
          <LogBlock text={handoffZh} />
        </section>

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">Step 7 导出</h2>
          <p className="text-sm text-mutedForeground">
            顺序执行 total_md_split → finalize_svg → svg_to_pptx -s final；失败时查看日志与 SKILL Step 7。
          </p>
          <button
            type="button"
            className="border border-border px-4 py-2 bg-foreground text-background hover:bg-muted hover:text-foreground transition-colors duration-75 disabled:opacity-50"
            disabled={!selected || busy}
            onClick={() =>
              run(async () => {
                const res = await api<{ ok: boolean; steps?: { log: string }[] }>(
                  '/api/export/step7',
                  {
                    method: 'POST',
                    body: JSON.stringify({ project: selected }),
                  },
                )
                const text =
                  res.steps?.map((s, i) => `--- step ${i + 1} ---\n${s.log}`).join('\n\n') ?? ''
                setLog(text)
                if (!res.ok) throw new Error('Step 7 未完成，见日志')
                await loadAssetLists()
              })
            }
          >
            运行 Step 7 三连
          </button>
        </section>

        <section className="border border-border p-6 space-y-4">
          <h2 className="font-display text-2xl">预览与下载</h2>
          <button
            type="button"
            className="border border-border px-4 py-2 disabled:opacity-50"
            disabled={!selected || busy}
            onClick={() =>
              run(async () => {
                await loadAssetLists()
                setLog('已刷新文件列表')
              })
            }
          >
            刷新列表
          </button>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-mono text-sm text-mutedForeground mb-2">svg_final</h3>
              <ul className="space-y-2 font-mono text-xs break-all">
                {svgFiles.map((f) => (
                  <li key={f}>
                    <a
                      className="underline underline-offset-2"
                      href={`/api/projects/${encodeURIComponent(selected)}/assets/raw?relative=${encodeURIComponent(f)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {f}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-sm text-mutedForeground mb-2">exports</h3>
              <ul className="space-y-2 font-mono text-xs break-all">
                {exportFiles.map((f) => (
                  <li key={f}>
                    <a
                      className="underline underline-offset-2"
                      href={`/api/projects/${encodeURIComponent(selected)}/assets/raw?relative=${encodeURIComponent(f)}`}
                      download
                    >
                      {f}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-sm text-mutedForeground font-serif">
        与 Claude Code 共用同一 projects 路径；详见仓库 harness/docs。
      </footer>
    </div>
  )
}
