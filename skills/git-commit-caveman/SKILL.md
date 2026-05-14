---
name: git-commit-caveman
description: Generate Git commit messages in caveman style (ultra‑concise, 1–2 lines, all changes). For opencode agents with git access. Reads staged diff and outputs only the commit message. Use --commit flag to also execute the commit.
compatibility: opencode
tools:
  - git
  - bash
---

## Flag: --commit

If user requests `--commit` (or says "commit", "make commit", "do it"), also execute the commit after generating the message:

1. Generate the message as normal
2. Run: `git commit -m "<message>"`
3. Return: `✓ <hash> <message>`

## Goal

Generate commit messages that:

- Are **ultra‑concise** (caveman style).  
- Have **maximum 2 lines** total.  
- Capture **all key changes** in those 2 lines.  
- Follow Git best practices (imperative mood, type/scope when possible).

---

## Git access requirement

Before generating the message, **you MUST**:

1. Run `git diff --cached --stat && git diff --cached -U0` to obtain the staged changes.  
2. Analyze the summary and the zero-context diff to understand exactly what changed.  
3. **Do not** rely on user descriptions – use only the actual diff output.

If nothing is staged, reply with:  
`No staged changes. Use git add to stage files.`

---

## Rules

1. **Use imperative mood (present tense)**  
   - “Add”, “Fix”, “Remove”, “Refactor”, “Bump”, etc.  
   - NOT: “Added”, “Fixed”, “Removed”.  
   Example:  
   - Good: `fix(auth): prevent null crash in middleware`  
   - Bad: `fixed bug that caused null crash`

2. **Type and optional scope (1st line)**  
   Use common types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `ci`.  
   Optional scope: area/feature (e.g., `auth`, `db`, `ui`, `payment`).  
   Format:  
   - `type(scope): short description`  
   - Keep 1st line under ~50–72 characters.

3. **Strict 2‑lines maximum**  
   - Line 1: commit header (type/scope + short description).  
   - Line 2 (optional): extra detail if needed.  
   - No more than 2 lines.  
   - If changes are too big, **summarize them in 1–2 bullets‑style phrases in line 2**.

4. **Caveman style (no fluff)**  
   - No greetings, no “I”, no “we”, no “this PR”.  
   - Use short, active phrases.  
   - Example 1‑line:  
     - `fix(auth): prevent null crash in middleware`  
   - Example 2‑line:  
     - `refactor(payment): simplify payment logic`  
     - `split handler, remove dup checks, improve testability`

5. **Capture all main changes**  
   - If there are multiple changes, compress them into 1–2 lines.  
   - Prefer: list of key changes in line 2, separated by commas or short phrases.  
   - Never describe how the code works; only what changed and why.

6. **No extra text in answers**  
   - When the user asks for a commit message (or when invoked via opencode), the agent must return:  
     - Only the commit message (1–2 lines) based on the staged diff.  
     - No explanations like “Here’s a good message:” or “I suggest:”.

---

## When to use this skill

Use this skill when:

- You want **ultra‑short but maximal‑information** commit messages.  
- You are working inside **opencode** (agent has git execution capability).  
- The change is small or medium sized and you still want to cover all key points.

You can combine it with other skills, but this one focuses only on Git commit style using the actual staged diff.

---

## Execution: --commit flag

If the user explicitly requests to **commit** (not just generate a message), do:

1. **Verify staged changes** exist (`git diff --cached --stat`)
2. **Generate message** following all rules above
3. **Execute commit:**
   ```bash
   git commit -m "<generated message>"
   ```
4. **Return result:**
   - Success: `✓ <short-hash> <message>`
   - Failure: Report the git error

The commit must be executed in the same tool call — never use a separate pipeline or subshell.