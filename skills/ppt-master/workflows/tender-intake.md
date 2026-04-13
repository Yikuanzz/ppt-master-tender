---
description: Tender intake — collect 8 key project parameters via structured interview before research begins
---

# Tender Intake Workflow

## Trigger Condition

Activated when the user starts a new tender/bid project. Entry point for the `tender-pipeline.md` workflow. Run before `tender-research.md`.

## Deliverables

| Output | Location | Description |
|--------|----------|-------------|
| `tender-brief.md` | `projects/<project>/sources/` | Structured intake summary with all 8 parameters confirmed |
| Converted source files | `projects/<project>/sources/` | Tender documents converted to Markdown via `source_to_md` |

---

## Process Overview

```
用户提供招标文件/课题
        │
        ▼
[STEP 1] 接收原始输入
        │
        ▼
[STEP 2] 转换线下文件 (source_to_md)
        │
        ▼
[STEP 3–10] 逐项收集 8 个关键参数  ← BLOCKING per item
        │
        ▼
[STEP 11] 确认并写入 tender-brief.md
        │
        ▼
→ 进入 tender-research.md
```

---

## Step 1: Receive Raw Input

Accept any combination of the following from the user:

- Tender document files (PDF / DOCX / TXT)
- Tender topic description (free text)
- URL to online tender notice
- Partial pre-filled parameters

If no input is provided at all, ask:

> 请提供招标文件（PDF/DOCX/URL）或直接描述标书课题，以便开始信息收集。

---

## Step 2: Convert Offline Source Files

If the user provides file attachments or local file paths, run the appropriate converter **before** asking intake questions. This ensures later questions can reference actual tender document content.

```bash
# PDF
python3 skills/ppt-master/scripts/source_to_md/pdf_to_md.py <file>

# DOCX / other office formats
python3 skills/ppt-master/scripts/source_to_md/doc_to_md.py <file>

# PPT/PPTX (if existing deck provided as reference)
python3 skills/ppt-master/scripts/source_to_md/ppt_to_md.py <file>

# URL (tender notice page)
python3 skills/ppt-master/scripts/source_to_md/web_to_md.py <URL>
# or: node skills/ppt-master/scripts/source_to_md/web_to_md.cjs <URL>
```

Move converted `.md` files into `projects/<project>/sources/`.

If conversion fails, note the failure and continue with user-provided text descriptions for the affected file.

---

## Step 3–10: Collect 8 Key Parameters

Each parameter below is a **BLOCKING** question. Do not proceed to the next parameter until the current one is confirmed. Pre-fill from converted source documents where possible; ask the user only to confirm or correct.

---

### Parameter 1: 招标方 & 项目名称 (Client & Project Name)

**Pre-fill attempt**: Extract from tender document header, title page, or notice.

**Ask if not found**:
> 招标方名称和项目全称是什么？（例如：广州市交通局 · 2026年智慧交通系统建设项目）

**Output field**: `client_name`, `project_name`

---

### Parameter 2: 目标城市 / 地区 (Target City / Region)

**Pre-fill attempt**: Extract from tender document geographic scope section.

**Ask if not found or ambiguous**:
> 项目实施地点/目标城市是哪里？如涉及多地，请列出主要城市。

**Why it matters**: Drives regional data selection in `tender-research.md` (local policy, competitors, market figures).

**Output field**: `target_city`

---

### Parameter 3: 行业与课题 (Industry & Topic)

**Pre-fill attempt**: Extract from tender document scope-of-work section.

**Ask**:
> 本次标书的技术课题是什么？请用一句话描述核心交付内容。（例如：城市轨道交通智能运维平台软件开发与部署）

**Output field**: `industry`, `tender_topic`

---

### Parameter 4: 评分表 (Scoring Rubric)

**Pre-fill attempt**: Look for a "评分标准" or "评审办法" section in the tender document.

**Ask**:
> 招标文件中是否包含评分标准/评分表？如有，请确认已包含在上传文件中，或粘贴评分表内容。

**If yes**: Extract each criterion and its "优秀"档描述. Store as `scoring_rubric` list.
**If no**: Set `scoring_rubric = null`. The copywriting reviewer will use internal standards only.

**Output field**: `scoring_rubric`

---

### Parameter 5: 主要竞争对手 (Key Competitors)

**Ask**:
> 预计参与本次投标的主要竞争对手有哪些？（可列举公司名称，或描述竞品类型，如"本地系统集成商"）

**If user is unsure**: Set `competitors = "未知，依赖研究阶段发现"` and flag for web-search in `tender-research.md`.

**Output field**: `competitors`

---

### Parameter 6: 品牌调性 (Brand Tone)

**Ask** (offer concrete options):
> 本次标书的视觉和文案调性偏好是？
> A. 稳健落地型（强调经验、可靠性、风险可控）
> B. 激进创新型（强调技术领先、突破性方案）
> C. 品牌契合型（与招标方已有品牌/系统风格保持一致）
> D. 其他（请描述）

**Output field**: `brand_tone`

---

### Parameter 7: 数据来源偏好 (Data Source Preference)

**Ask**:
> 研究阶段优先使用哪类数据来源？（可多选）
> A. 政府/权威机构报告（如国家统计局、行业协会）
> B. 第三方市场研究（如艾瑞、赛迪、IDC）
> C. 公司自有历史数据与业绩案例
> D. 实时网络热点与政策动态

**Output field**: `data_source_preference`

---

### Parameter 8: 特殊约束 (Special Constraints)

**Ask**:
> 是否有需要特别注意的约束条件？例如：
> - 保密要求（某些数据不能出现在 PPT 中）
> - 页数限制（标书规定 PPT 不超过 X 页）
> - 必须包含的特定章节或格式要求
> - 提交截止日期

**If none**: Set `special_constraints = "无"`.

**Output field**: `special_constraints`

---

## Step 11: Write tender-brief.md

After all 8 parameters are confirmed, write the structured brief:

```markdown
# Tender Brief

## Project Metadata
- **Client**: {client_name}
- **Project Name**: {project_name}
- **Target City**: {target_city}
- **Industry**: {industry}
- **Tender Topic**: {tender_topic}
- **Brand Tone**: {brand_tone}
- **Data Source Preference**: {data_source_preference}
- **Special Constraints**: {special_constraints}
- **Generated**: {timestamp}

## Competitors
{competitors}

## Scoring Rubric
{scoring_rubric or "无评分表，使用内置标准"}
```

Save to: `projects/<project>/sources/tender-brief.md`

---

## Handoff to Research

On successful completion, output:

```
[INTAKE COMPLETE] tender-brief.md 已生成。
转换的源文件：{list of converted files}
进入下一阶段：tender-research.md
```

Then proceed to `tender-research.md`, passing the `tender-brief.md` path as input.
