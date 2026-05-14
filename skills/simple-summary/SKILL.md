---
name: summary-summary
description: Convert an extensive technical analysis.
---


# SIMPLE-SUMMARY SKILL

Purpose:
Convert an extensive technical analysis (ADR, architecture plan, risks, etc.) into a **short and readable Markdown summary**, preserving:
- Objective of the change
- Key decisions
- Main risks
- Next steps / DoD

Output format:
- Maximum one Markdown page (≈ 400–500 tokens).
- Only 2–4 main headings, with no deep sub‑lists.
- Short bullet points; complete but concise sentences.
- Where appropriate, replace long lists with **simple tables** (1–4 rows, 2–3 columns) to summarize options, trade‑offs, or next steps.

Instructions:

1. **Identify the core content**:
   - What problem is being solved.
   - What architectural decision is being made.
   - Which concrete risks are relevant.
   - What remains to be defined or implemented.

2. **Compress redundant sections**:
   - If there are multiple alternatives, summarize only the 2–3 most relevant ones.
   - Avoid very detailed operational explanations (for example, full commands, bash steps).
   - Use technical but accessible language, without excessive jargon.
   - When comparing options or trade‑offs, prefer a **short table** instead of long paragraphs.

3. **Suggested minimal structure** (Markdown + optional tables):

   ```markdown
   ## Objective
   - 2–4 sentences describing the problem and the goal of the change.

   ## Key decision
   - 1–3 bullet points with the chosen option and the rationale.
   - If helpful, add a small table to compare the main alternatives:
     | Option        | Pros                          | Cons                          |
     |---------------|-------------------------------|-------------------------------|
     | Option A      | Brief pros.                   | Brief cons.                   |
     | Option B      | Brief pros.                   | Brief cons.                   |

   ## Main risks
   - 2–4 risks, each as a simple sentence.
   - Optionally summarize high‑impact risks in a table:
     | Risk                          | Likelihood | Impact | Mitigation |
     |-------------------------------|-----------|--------|------------|
     | Brief risk description.       | Low/Med/High | Low/Med/High | One sentence. |

   ## Next steps / DoD
   - 3–7 concrete tasks as bullet points.
   - If there are multiple owners or phases, use a table:
     | Task                         | Owner    | Status |
     |------------------------------|----------|--------|
     | Brief task description.      | Person   | To Do  |
   ```

4. **Style constraints**:
   - Do not nest lists beyond level 1.
   - Avoid long parentheses or digressions.
   - Prefer **tables** over long lists when comparing options, risks, or action items.
   - Prioritize **actions** over justifications.

5. **When to use this skill**:
   - When the agent is generating an “Architecture report”, “Implementation plan”, or “ADR”.
   - Before returning the final result to the user, run the draft through this skill.
   - If the text exceeds ~300–400 words, this summary is mandatory.