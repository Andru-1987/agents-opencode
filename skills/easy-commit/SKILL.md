---
name: easy-commit 
description: Orquestador que usa git-commit-caveman para hacer el commit real.
mode: skill
tools: bash
---

# Easy Commit Skill

This skill orchestrates git-commit-caveman to generate AND execute the commit.

## Usage

Simply invoke this skill. It will:

1. **Check staged changes** — abort if none
2. **Generate commit message** via git-commit-caveman logic
3. **Execute the commit** directly (not via pipeline)
4. **Report result** in format: `✓ <hash> <message>`

## How it works internally

The skill combines message generation + commit execution in one step:

1. Run `git diff --cached --stat` to verify staged changes
2. Run `git diff --cached -U0` to analyze changes
3. Generate message following caveman style rules
4. Execute: `git commit -m "<message>"`
5. Return result

This avoids the permission issue with pipelines that mix `opencode run` + `git commit`.