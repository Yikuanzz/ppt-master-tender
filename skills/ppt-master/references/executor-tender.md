# Executor Tender — Formal Bid Document Style

> Common guidelines: executor-base.md. Technical constraints: shared-standards.md.

---

## Role Definition

A formal, government/enterprise-grade SVG design executor for **tender and bid documents**. Suitable for government procurement bids, enterprise RFP responses, public infrastructure project proposals, and municipal service tenders. Emphasizes institutional authority, data credibility, and compliance-ready professionalism. Every slide must reinforce trust, demonstrate capability, and satisfy evaluator scoring criteria.

---

## Tender-specific Visual Techniques

### 1. Palette and Color System

Tender documents require a conservative, institutional palette. Default scheme (override with project design spec if provided):

```
Primary:    #1A3D6B  (government navy — authority, trust)
Accent:     #C41E3A  (institutional red — emphasis, key data)
Neutral:    #F5F7FA  (light background)
Text Dark:  #1C2B3A  (headings, labels)
Text Mid:   #4A5568  (body text)
Text Light: #718096  (captions, footnotes)
Border:     #D1D9E0  (table lines, dividers)
```

**Usage rules**:
- `#1A3D6B` for all slide headers, section titles, key borders
- `#C41E3A` for call-out numbers, differentiator markers, critical deadlines
- Never use gradients on text; reserve for header background bands only
- No playful accent colors (orange, yellow, purple) unless in project design spec

### 2. Typography Hierarchy

| Level | Usage | Size | Weight | Color |
|-------|-------|------|--------|-------|
| Slide title | Main heading | 28–32px | Bold | #1A3D6B |
| Section label | Sub-heading | 18–22px | SemiBold | #1A3D6B |
| Body text | Paragraph, bullet | 14–16px | Regular | #1C2B3A |
| Data label | Chart values, table cells | 12–14px | Regular/Bold | #1C2B3A |
| Caption/Source | Footnotes, attributions | 10–11px | Regular | #718096 |
| Footer | Page number, company, confidential | 10px | Regular | #718096 |

### 3. Data Credibility Markers

Every slide that presents numeric claims MUST include a source attribution:

```svg
<!-- Source attribution — bottom left of data area -->
<text x="45" y="695" font-family="Arial" font-size="10" fill="#718096">
  数据来源：[机构名称] [年份]报告
</text>
```

- Place attribution at y=695 (above footer at y=710)
- Format: `数据来源：[source] [year]` or `Source: [source] [year]` (match document language)
- If data is proprietary/internal: `数据来源：企业内部统计数据`
- Never leave data-bearing slides without source attribution — instant FAIL in PPT review

### 4. Scoring Criterion Response Markers

When a slide content directly responds to an evaluator scoring criterion, add a subtle marker:

```svg
<!-- Scoring response tag — top-right corner of content area -->
<rect x="1150" y="58" width="90" height="20" rx="2" fill="#1A3D6B" fill-opacity="0.08"/>
<text x="1195" y="72" font-family="Arial" font-size="10" fill="#1A3D6B"
      text-anchor="middle">评分项 3.2</text>
```

Use sparingly — only when the copywriting draft explicitly maps a slide to an evaluator criterion.

---

## Tender-specific Layout Patterns

### Pattern 1: Cover Slide (封面页)

```
┌─────────────────────────────────────────────────────────┐
│  [Full-width header band: #1A3D6B, height 200]          │
│  [Company logo — white version, top-left, 160x50]       │
│  [Bid reference number — top-right, 12px, white]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Project title — 36-42px bold, #1A3D6B, centered]     │
│  [Subtitle / Tender topic — 20px, #4A5568, centered]   │
│                                                         │
│  [Red accent divider line: #C41E3A, 3px, 50% width]    │
│                                                         │
│  [Submitter name — 16px, centered]                     │
│  [Submission date — 14px, #718096, centered]           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Footer band: #1A3D6B, height 40]                     │
│  CONFIDENTIAL | [Company] | Page 1 of N  (white, 10px) │
└─────────────────────────────────────────────────────────┘
```

SVG coordinate map (1280×720):
- Header band: `x=0 y=0 width=1280 height=200`
- Project title: centered at `y=320`, font-size 38
- Red divider: `x=320 y=380 width=640 height=3 fill="#C41E3A"`
- Footer band: `x=0 y=680 width=1280 height=40`

### Pattern 2: Credentials / Case Evidence Page (业绩页)

Use a 2-column grid with case cards. Each card shows: project name, client, contract value, and a 1-line outcome statement.

```
┌─────────────────────────────────────────────────────────┐
│  [Section header band with slide title]                 │
├──────────────────────┬──────────────────────────────────┤
│  CASE 1              │  CASE 2                          │
│  ─────────────       │  ─────────────                   │
│  Client name         │  Client name                     │
│  Project type        │  Project type                    │
│  ¥XX,XXX万           │  ¥XX,XXX万                       │
│  "Outcome in 1 line" │  "Outcome in 1 line"             │
├──────────────────────┼──────────────────────────────────┤
│  CASE 3              │  CASE 4                          │
│  ...                 │  ...                             │
└──────────────────────┴──────────────────────────────────┘
```

- Card dimensions: 560×150, gap 20px, left column x=45, right column x=675
- Contract value in `#C41E3A`, bold, 20px — visual anchor
- Card border: 1px `#D1D9E0`, radius 4

### Pattern 3: Timeline / Project Plan (时间轴页)

Horizontal Gantt-style bar chart with phase labels above and milestone markers below.

```
Phase 1      Phase 2       Phase 3       Phase 4
准备期        实施期         验收期         保障期
|────────|   |──────────|  |──────|     |────|
Jan       Mar            Jul       Sep   Oct  Dec
        ◆                       ◆
      启动会议               中期验收
```

SVG specification:
- Timeline baseline: `y=420`, full width from x=100 to x=1180
- Phase bars: height 30px, navy fill at 80% opacity, spaced by duration proportion
- Milestone diamonds: `◆` symbol at computed x, y=460, `fill="#C41E3A"`
- Month labels: `y=480`, 11px, `#718096`

### Pattern 4: Team Composition (团队页)

Role-card grid: each person card has photo placeholder, name, title, and 2 qualification badges.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  [Photo] │  │  [Photo] │  │  [Photo] │  │  [Photo] │
│  姓名    │  │  姓名    │  │  姓名    │  │  姓名    │
│  职位    │  │  职位    │  │  职位    │  │  职位    │
│ [证书1]  │  │ [证书1]  │  │ [证书1]  │  │ [证书1]  │
│ [证书2]  │  │ [证书2]  │  │ [证书2]  │  │ [证书2]  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

- 4-up layout: card width 255, gap 20, first card x=45
- Photo placeholder: 80×80 circle, `fill="#D1D9E0"`, centered in card
- Qualification badge: pill shape, `fill="#1A3D6B"` at 10% opacity, 10px navy text
- If >4 team members: use 3×2 grid (3 cards per row, card width 370)

### Pattern 5: Budget Breakdown (报价页)

Waterfall chart + summary table side by side.

```
┌────────────────────────┬─────────────────────────────┐
│   [Waterfall chart]    │   [Summary table]            │
│                        │   项目     金额     占比     │
│   ████ 人力成本         │   ─────────────────────     │
│       ███ 设备采购      │   人力     ¥XXX万   45%      │
│           ██ 运营维护   │   设备     ¥XXX万   30%      │
│              ██ 税费    │   运营     ¥XXX万   15%      │
│                        │   税费     ¥XXX万   10%      │
│   Total: ¥XXX万        │   ─────────────────────     │
│                        │   合计     ¥XXX万   100%     │
└────────────────────────┴─────────────────────────────┘
```

- Left waterfall: x=45 to x=620, bottom baseline y=580
- Waterfall bars: primary navy, accent-colored cumulative total bar
- Right table: x=660 to x=1230, header row navy + white text
- Total amount: `#C41E3A`, bold 22px — primary visual anchor

### Pattern 6: Technical Approach / Methodology (技术方案页)

Diamond flowchart with 4–6 process steps and supporting evidence sidebar.

```
┌─────────────────────────────────────────┬───────────┐
│   [Diamond flow: Step 1 → 2 → 3 → 4]   │ 核心优势  │
│                                         │ ─────────│
│   ◇ 需求分析  →  ◇ 方案设计            │ • 优势A  │
│       ↓                ↓               │ • 优势B  │
│   ◇ 实施部署  →  ◇ 验收交付            │ • 优势C  │
│                                         │           │
└─────────────────────────────────────────┴───────────┘
```

- Flow area: x=45 to x=920, full height content zone
- Step diamonds: 120×70 each, `fill="#1A3D6B"` at 10%, border `#1A3D6B`
- Connector arrows: 2px navy stroke, arrowhead using `<marker>` in `<defs>`
- Sidebar panel: x=940 to x=1235, `fill="#F5F7FA"`, border `#D1D9E0`

---

## Mandatory Footer Convention

**Every slide** must include the standard footer band. No exceptions.

```svg
<!-- Standard tender footer -->
<rect x="0" y="700" width="1280" height="20" fill="#1A3D6B"/>
<text x="45" y="714" font-family="Arial" font-size="10" fill="white">
  [公司名称] | CONFIDENTIAL
</text>
<text x="640" y="714" font-family="Arial" font-size="10" fill="white"
      text-anchor="middle">
  [项目名称]
</text>
<text x="1235" y="714" font-family="Arial" font-size="10" fill="white"
      text-anchor="end">
  Page X of Y
</text>
```

- Footer band: `y=700 height=20` (leaves content zone y=80 to y=690)
- Replace `[公司名称]`, `[项目名称]`, `X`, `Y` with actual values from project metadata
- The Strategist confirms these values during confirmation item (b) (project metadata)

---

## Tender Speaker Notes Convention

Speaker notes for tender slides use domain-specific markers to distinguish types of annotations:

| Marker | Purpose | Example |
|--------|---------|---------|
| `[Evidence]` | Points to verifiable proof | `[Evidence] 业绩数据来自合同编号 2024-GZ-0312` |
| `[Differentiator]` | Competitive advantage claim | `[Differentiator] 本方案比竞品交付周期短30天` |
| `[Criterion]` | Maps to evaluator scoring item | `[Criterion] 对应评分表第4项"服务能力"` |
| `[Risk]` | Flags presenter talking point | `[Risk] 如评审问及价格，强调全生命周期成本优势` |
| `[Prohibited]` | Content that must NOT be said | `[Prohibited] 不得承诺超出合同范围的服务` |

Use at least one `[Evidence]` note on every data-bearing slide, and at least one `[Criterion]` note on slides that directly respond to an evaluator scoring dimension.

---

## Tender Self-check Supplement

In addition to the standard executor-base self-check, verify the following before marking each slide complete:

- [ ] Footer band present with company name + CONFIDENTIAL + page number
- [ ] All numeric claims have source attribution at y=695 (or within data area)
- [ ] No casual/playful elements (gradients, cartoon icons, bright accent colors outside spec)
- [ ] Text within content zone y=80 to y=690 (no overlap with header or footer)
- [ ] At least one data visualization per content slide (no pure text-wall slides)
- [ ] Speaker notes include at least one `[Evidence]` or `[Criterion]` marker
- [ ] Company name / project name placeholders replaced with actual values
- [ ] SVG uses no banned features (mask, style, foreignObject, class, animate, script)
