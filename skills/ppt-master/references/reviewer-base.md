# Reviewer Base — Shared Scoring Protocol

> This file defines the shared scoring mechanics for all tender reviewer roles. Specific reviewer files (`reviewer-tender-copy.md`, `reviewer-tender-ppt.md`) reference this protocol and define their own scoring dimensions.

---

## Role Contract

A reviewer is a **stateless, single-pass AI scoring agent**. It receives an artifact, applies a weighted rubric, and outputs a structured scoring table. It does NOT track iteration count — the calling workflow manages the retry loop.

## Input Contract

Each reviewer call receives:
1. The artifact to score (copywriting draft, SVG file list, or design spec)
2. Optional: client-provided scoring rubric (评分表) — if present, use it; if absent, skip the rubric-alignment dimension and redistribute its weight proportionally across remaining dimensions
3. Project metadata: tender topic, target city, industry, brand tone

## Output Schema

Every reviewer MUST output a scoring table in exactly this format:

```markdown
## Scoring Result

| Dimension | Weight | Raw Score (0-100) | Weighted Score | Comments |
|-----------|--------|-------------------|----------------|----------|
| [Dimension 1 name] | [W1]% | [S1] | [S1 × W1 / 100] | [one-line comment] |
| [Dimension 2 name] | [W2]% | [S2] | [S2 × W2 / 100] | [one-line comment] |
| [Dimension 3 name] | [W3]% | [S3] | [S3 × W3 / 100] | [one-line comment] |
| [Dimension 4 name] | [W4]% | [S4] | [S4 × W4 / 100] | [one-line comment] |
| [Dimension 5 name] | [W5]% | [S5] | [S5 × W5 / 100] | [one-line comment] |
| **TOTAL** | **100%** | — | **[Sum of weighted scores]** | **[PASS / FAIL]** |

**Result**: [PASS (≥90) / FAIL (<90)] — Total: [X.X] / 100
```

- Weights MUST sum to 100%
- Weighted Score = Raw Score × Weight / 100 (round to 1 decimal)
- Total = sum of all weighted scores
- **PASS** if Total ≥ 90; **FAIL** if Total < 90

## On FAIL: Improvement Output

When total < 90, append immediately after the scoring table:

```markdown
## Improvement Priorities (Top 5)

1. **[Dimension name]** (current: [score]) — [Specific actionable improvement, max 2 sentences]
2. **[Dimension name]** (current: [score]) — [Specific actionable improvement, max 2 sentences]
3. [...]
4. [...]
5. [...]
```

Prioritize improvements by: (weight × gap) descending, where gap = (100 - raw_score).

## Rubric-Absent Weight Redistribution

When no client scoring rubric is provided, the rubric-alignment dimension is removed and its weight is redistributed proportionally to the remaining dimensions. Each reviewer file documents its own redistribution formula.

## Scoring Calibration Guidelines

- Score 90-100: Meets or exceeds "优秀" (excellent) tier in all criteria
- Score 75-89: Meets "良好" (good) tier; specific gaps identified
- Score 60-74: Meets "合格" (passing) tier; significant improvements needed
- Score < 60: Below passing; major rework required

## Language Rule

Match the language of the input artifact. If the artifact is in Chinese, the scoring output (comments, improvement priorities) is in Chinese. The table structure remains as defined above.
