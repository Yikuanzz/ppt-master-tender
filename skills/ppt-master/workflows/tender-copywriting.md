---
description: Tender copywriting — generate ≥2 strategic positioning versions, user selection + btw refinement, AI review ≥90 to pass
---

# Tender Copywriting Workflow

## Trigger Condition

Activated after `tender-research.md` completes. Requires:
- `projects/<project>/sources/tender-brief.md`
- `projects/<project>/sources/research-report.md`

## Deliverables

| Output | Location | Description |
|--------|----------|-------------|
| `tender-copy-draft-A.md` | `projects/<project>/sources/` | Strategy version A copywriting draft |
| `tender-copy-draft-B.md` | `projects/<project>/sources/` | Strategy version B copywriting draft |
| `tender-copy-draft-C.md` *(optional)* | `projects/<project>/sources/` | Strategy version C (if warranted) |
| `tender-copy-final.md` | `projects/<project>/sources/` | User-confirmed final copywriting (HARD GATE for execution phase) |

---

## Process Overview

```
tender-brief.md + research-report.md
        │
        ▼
[STEP 1] 生成策略框架 (≥2 定位版本)
        │
        ▼
[STEP 2] 生成完整文案草稿 (每个版本独立文件)
        │
        ▼
[STEP 3] 用户选择版本
        │
        ▼
[STEP 4] btw 补充修改循环 (可选，用户驱动)
        │
        ▼
[STEP 5] AI 文案评审 (≥90 分通过，最多3轮迭代)
        │   ├── PASS → 写入 tender-copy-final.md → 进入执行阶段
        │   └── FAIL → 修改草稿 → 重新评审
        ▼
→ tender-copy-final.md 确认完成
```

---

## Step 1: Generate Strategy Frameworks

Read `tender-brief.md` and `research-report.md`. Generate **at least 2** distinct strategic positioning frameworks. Each framework must have a different primary value proposition — not just stylistic variation.

### Required Positioning Types

Always generate **Version A** and **Version B**. Add Version C when the research reveals a third compelling angle.

**Version A — 稳健落地型 (Reliable Delivery)**
- Core message: proven track record, risk-controlled implementation, on-time delivery
- Evidence anchors: past project credentials, team qualifications, methodology maturity
- Tone: conservative, authoritative, trust-building
- Best for: risk-averse evaluators; procurement committees prioritizing certainty

**Version B — 技术创新型 (Technology Leadership)**
- Core message: cutting-edge technology, innovation capability, future-proof solution
- Evidence anchors: R&D investment, patents/IP, emerging tech adoption, pilot projects
- Tone: forward-looking, confident, aspirational
- Best for: evaluators who weight technical advancement; clients seeking transformation

**Version C — 本地深耕型 (Local Specialization)** *(add if target_city data is strong)*
- Core message: deep local market knowledge, existing relationships, community understanding
- Evidence anchors: local project history, regional partnerships, city-specific data
- Tone: community-oriented, relationship-based, contextually aware
- Best for: municipal/government tenders where local presence matters

### Framework Output Format

For each version, output a one-page positioning brief **before** writing full copy:

```
## Version [A/B/C]: [版本名称]

**核心定位句**: [One sentence that defines the strategic position]
**主要差异点**:
1. [Differentiator 1 — tied to specific evidence from research-report.md]
2. [Differentiator 2]
3. [Differentiator 3]
**适用理由**: [Why this positioning fits this specific tender]
**主要风险**: [What this version de-emphasizes — evaluators who weight X may score lower]
```

Present all frameworks to the user before generating full copy. Allow the user to request a different positioning type if none of the above fit.

---

## Step 2: Generate Full Copywriting Drafts

For the confirmed strategy frameworks, generate complete copywriting drafts. Each draft covers the following standard tender sections:

### Required Sections

1. **封面信息** — Project title, submitter, date, bid reference
2. **执行摘要** — 2–3 paragraphs: understanding of client need, proposed solution, key differentiator
3. **项目理解与需求分析** — Demonstrate deep understanding of the tender requirements; reference specific clauses from tender document
4. **技术方案** — Methodology, architecture, key deliverables; at least 1 quantified outcome claim
5. **实施计划与时间轴** — Phased timeline with milestones and deliverable dates
6. **团队配置** — Key personnel with roles, qualifications, and relevant experience
7. **业绩与资质** — Past projects with client names, contract scope, and outcomes; certifications
8. **报价说明** — Pricing rationale (not necessarily specific figures); cost-value justification
9. **风险识别与应对** — At least 3 identified risks with mitigation strategies
10. **服务承诺与保障** — Post-delivery support, SLA commitments, escalation path

### Copywriting Standards

- Every quantified claim must reference its source: `（数据来源：[source]）`
- No fabricated statistics — only data from `research-report.md` or user-provided documents
- Match the formal register required for government/enterprise tender documents
- Use terminology consistent with the tender document (mirror the evaluator's language)
- Each section heading should map to a section in the tender's evaluation framework where possible

### Draft File Format

```markdown
# [项目名称] — 投标文件文案草稿 [A/B/C]

**策略定位**: [版本名称]
**版本**: Draft v1
**生成时间**: {timestamp}

---

## 1. 封面信息
...

## 2. 执行摘要
...

[all 10 sections]

---

*本草稿由 AI 生成，基于 research-report.md 中的研究数据。所有数据引用均标注来源。*
```

Save each draft to: `projects/<project>/sources/tender-copy-draft-[A/B/C].md`

---

## Step 3: User Version Selection

Present version summaries to the user:

```
已生成 {n} 个文案版本：

版本A — 稳健落地型: [核心定位句]
版本B — 技术创新型: [核心定位句]
[版本C — 本地深耕型: [核心定位句]]

请选择您希望推进的版本（A / B / C），或说明您希望融合哪些版本的元素。
```

**If user selects one version**: Proceed to Step 4 with that draft as the working document.

**If user requests a blend**: Generate a merged version combining specified elements from multiple drafts. Save as `tender-copy-draft-blend.md`. Proceed to Step 4.

---

## Step 4: btw Refinement Loop (User-driven)

After the user selects a version, they may request targeted refinements using the **"补充：XXX"** command pattern.

### Interaction Protocol

**Trigger**: User message containing `补充：` or `btw:` prefix.

**Behavior**:
- Parse the supplement instruction to identify the targeted section and the change requested
- Apply a **local patch** to the selected draft — modify only the identified section
- Do NOT regenerate the entire draft
- Show a diff-style summary: `[已修改] 第{section}节: {one-line description of change}`
- Preserve all other sections unchanged

### btw Instruction Examples

| User Input | Action |
|------------|--------|
| `补充：在团队配置部分加入张三，职位：项目总监，有城市轨道交通项目经验` | Add personnel entry to Section 6 only |
| `补充：执行摘要要更强调价格竞争优势` | Revise Section 2 tone/emphasis only |
| `补充：风险部分需要提到数据安全合规风险` | Add risk entry to Section 9 only |
| `补充：报价说明中加入全生命周期成本分析` | Extend Section 8 only |

### Multiple btw Rounds

Accept unlimited `补充：` instructions before the user triggers AI review. Each patch is applied cumulatively to the working draft. The user signals readiness for review by saying "开始评审" / "评审" / "submit for review" or similar.

---

## Step 5: AI Copywriting Review

### Reviewer Reference

Apply the scoring protocol from:
- `skills/ppt-master/references/reviewer-base.md` — shared scoring mechanics
- `skills/ppt-master/references/reviewer-tender-copy.md` — copywriting-specific dimensions and rubrics

### Review Input

```
Artifact: [contents of the working draft]
Client scoring rubric: [tender-brief.scoring_rubric — or null]
Project metadata: tender_topic={x}, target_city={x}, industry={x}, brand_tone={x}
```

### Pass/Fail Logic

**PASS** (total ≥ 90): Write the confirmed draft as `tender-copy-final.md`:

```bash
# Copy working draft to final
cp projects/<project>/sources/tender-copy-draft-[selected].md \
   projects/<project>/sources/tender-copy-final.md
```

Add a header to `tender-copy-final.md`:

```markdown
# [项目名称] — 投标文案（最终确认版）

**评审总分**: {score} / 100
**评审通过时间**: {timestamp}
**版本**: {version_label}

---
[draft content]
```

**FAIL** (total < 90):
1. Output the full scoring table and Improvement Priorities (per reviewer protocol)
2. Auto-apply improvements for items with clear fixes (missing source attributions, thin sections)
3. For strategic improvements (positioning changes, major content additions), present to user and request confirmation before applying
4. Increment iteration counter

### Iteration Cap

| Iteration | Action |
|-----------|--------|
| 1 | Review draft → output scoring + improvements → auto-apply fixes |
| 2 | Re-review improved draft → output scoring + improvements |
| 3 | Re-review → if still FAIL, present to user for manual decision |

**At iteration 3 FAIL**:

```
[3轮评审未达90分] 当前最高分：{score}

当前主要差距：
{top 3 improvement priorities from reviewer}

选项：
A. 继续由 AI 修改并再次评审（不计入迭代上限，由您手动控制）
B. 以当前版本进入执行阶段（接受低于90分的风险）
C. 重新生成文案版本（返回 Step 1）
```

---

## HARD GATE: tender-copy-final.md

The execution phase (`tender-pipeline.md` Step 4+) **cannot start** until `tender-copy-final.md` exists in `projects/<project>/sources/`.

`tender-pipeline.md` checks for this file before invoking the Strategist. If absent, it blocks with:

```
[GATE BLOCKED] tender-copy-final.md 不存在。
执行阶段需要文案阶段完成后才能启动。
请先完成 tender-copywriting.md 流程。
```

---

## Handoff to Execution Phase

On successful gate pass, output:

```
[COPY PHASE COMPLETE] tender-copy-final.md 已确认（评审分：{score}）。
进入执行阶段：Strategist → Executor → PPT评审
```

Then `tender-pipeline.md` proceeds to Step 4 (Strategist).
