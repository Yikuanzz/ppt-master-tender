---
description: Tender research — aggregate multi-source intelligence into a structured research report before copywriting
---

# Tender Research Workflow

## Trigger Condition

Activated after `tender-intake.md` completes and `tender-brief.md` exists. Input to `tender-copywriting.md`.

## Deliverables

| Output | Location | Description |
|--------|----------|-------------|
| `research-report.md` | `projects/<project>/sources/` | Structured research summary across all 3 channels |

---

## Process Overview

```
tender-brief.md (from intake)
        │
        ▼
[CHANNEL A] web-search  ──┐
[CHANNEL B] web-trend   ──┼──→ [AGGREGATE] → research-report.md
[CHANNEL C] offline     ──┘
        │
        ▼
→ 进入 tender-copywriting.md
```

All three channels run in parallel. Aggregate results after all channels complete.

---

## Input: Read tender-brief.md

Before running any research, read `projects/<project>/sources/tender-brief.md` and extract:

- `tender_topic` — primary search subject
- `target_city` — geographic scope for local data
- `competitors` — named competitors to research
- `industry` — industry vertical for market data
- `data_source_preference` — weight certain sources higher
- `scoring_rubric` — if present, identify which criteria need data support

---

## Channel A: web-search (Real-time Internet)

Use the built-in `WebSearch` tool. Run **5–8 targeted queries** covering:

### A1: Policy & Regulatory Context

```
Query template: "{target_city} {industry} 政策 {current_year}"
Example: "广州 智慧交通 政策 2026"
```

Capture: recent government directives, funding programs, regulatory changes that support the tender topic.

### A2: Market Scale & Growth Data

```
Query template: "{industry} 市场规模 {current_year} 报告"
Example: "智慧交通系统 市场规模 2026 报告"
```

Capture: market size figures, CAGR, authoritative sources (IDC, 艾瑞, 赛迪, 国家统计局).

### A3: Competitor Intelligence

For each named competitor in `tender-brief.md`:

```
Query template: "{competitor_name} {tender_topic} 案例 OR 中标"
Example: "华为 智慧交通 中标"
```

If competitors are unknown: query `"{industry} {target_city} 系统集成商 TOP10"`.

Capture: recent wins, publicized projects, key differentiators, weaknesses noted in news.

### A4: Technology Trends

```
Query template: "{tender_topic} 最新技术趋势 {current_year}"
Example: "城市轨道交通智能运维 最新技术趋势 2026"
```

Capture: emerging technologies, industry-leading implementations, innovation angles.

### A5: Scoring Criterion Evidence (if rubric present)

For each scoring criterion in `tender-brief.scoring_rubric`:

```
Query template: "{criterion_topic} 案例 数据 {target_city}"
```

Capture: concrete data points, case studies, metrics that directly address evaluator criteria.

---

## Channel B: web-trend (Platform Trending Content)

Captures real-time public sentiment, hot topics, and framing language from social platforms. Useful for understanding how the tender topic is discussed in current discourse.

### Primary Method: Site-filtered WebSearch

```
Query template: "{tender_topic} site:weibo.com"
Query template: "{industry} 热点 site:mp.weixin.qq.com"
```

### Fallback Queries (if site-filter returns limited results):

```
"{tender_topic} 微博 热搜 {current_year}"
"{tender_topic} 公众号 最新"
"{industry} 行业动态 {current_year}"
```

### What to Capture

- Trending angles or framings of the topic (how is it being discussed publicly?)
- Recent incidents or news items that create urgency or opportunity
- Language patterns that resonate — useful for copywriting tone calibration
- Any negative news about competitors

**Usage note**: Platform trending content supplements authoritative data — do NOT cite social media posts as primary data sources in the tender copy. Use trends to inform framing and narrative angle only.

---

## Channel C: Offline Files (User-provided Documents)

Process any files already converted by `tender-intake.md` (Step 2). Read converted Markdown files from `projects/<project>/sources/`.

### C1: Tender Document Deep-read

Re-read the converted tender document (if available) specifically for:

- Implicit evaluation preferences (language clues about what the client values)
- Technical requirements that must be addressed in the approach section
- Scope boundaries that constrain what can be promised
- Reference to incumbent vendors or previous projects

### C2: Company Capability Materials

If the user provided company brochures, capability statements, or past proposal documents:

- Extract quantified achievements (contract values, project counts, client names)
- Identify certifications, qualifications, and awards
- Note any existing case studies relevant to this tender

### C3: Prior Research or Market Reports

If the user provided third-party research reports (PDF):

- Extract key statistics with source attribution
- Note publication date (flag data older than 3 years as potentially stale)

---

## Aggregation: Write research-report.md

After all three channels complete, synthesize into a structured report:

```markdown
# Research Report: {project_name}

**Generated**: {timestamp}
**Tender Topic**: {tender_topic}
**Target City**: {target_city}

---

## 1. Policy & Regulatory Environment

{2–4 bullet points with specific policy names, dates, and implications for the tender}

**Key data points**:
- [Stat] [Source] [Year]
- [Stat] [Source] [Year]

---

## 2. Market Context

{Market size, growth rate, key players — with source attribution}

**Key data points**:
- 市场规模：[figure] — 来源：[source] [year]
- 年均增速：[figure] — 来源：[source] [year]

---

## 3. Competitor Analysis

| Competitor | Recent Wins | Key Strengths | Apparent Weaknesses |
|------------|-------------|---------------|---------------------|
| [Name] | [Project] | [Strength] | [Weakness] |
| [Name] | ... | ... | ... |

---

## 4. Technology Trends

{2–3 bullet points on relevant technology developments}

---

## 5. Trending Framing & Narrative Angles

{Insights from web-trend channel — framing suggestions, not direct citations}

---

## 6. Company Capability Summary

{Extracted from offline files — quantified achievements, relevant certifications}

---

## 7. Scoring Criterion Evidence Map

{Only present if scoring_rubric is non-null}

| Criterion | Supporting Data | Source |
|-----------|----------------|--------|
| [Criterion name] | [Data point] | [Source] |
| ... | ... | ... |

---

## 8. Research Gaps & Caveats

{List any areas where data was unavailable or unreliable}
- [Gap 1]
- [Gap 2]
```

Save to: `projects/<project>/sources/research-report.md`

---

## Handoff to Copywriting

On successful completion, output:

```
[RESEARCH COMPLETE] research-report.md 已生成。
覆盖渠道：web-search ({n} queries) | web-trend ({n} queries) | 线下文件 ({n} files)
数据缺口：{list gaps or "无"}
进入下一阶段：tender-copywriting.md
```

Then proceed to `tender-copywriting.md`, passing both `tender-brief.md` and `research-report.md` as inputs.
