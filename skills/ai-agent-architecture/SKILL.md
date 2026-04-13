---
name: ai-agent-architecture
description: >
  Apply the AI Operating System structure when designing, scaffolding, or documenting
  any AI agent system. Use this skill whenever the user asks to build an agent, design
  an agent system, scaffold an AI assistant, define agent roles, create prompt templates,
  design memory strategies, wire tools, define workflows, or add guardrails to an AI
  system. Also trigger when the user mentions "multi-agent", "agent pipeline", "system
  prompt structure", "agent memory", "agent tools", or "agent validation". This skill
  is fully language-agnostic and applies to any framework or runtime.
---

# AI Agent Architecture (AI Operating System)

## Core Concept

An AI agent system has six distinct concerns. Each concern maps to a folder.
Never mix concerns across folders. Each folder is independently replaceable.

```
ai_os/
├── agents/
├── prompts/
├── memory/
├── tools/
├── workflows/
└── guardrails/
```

---

## The Six Concerns

### 1. `agents/` — Agents & Roles
Defines who each agent is: its role, personality, capabilities, and constraints.
One file per agent. Written in natural language (Markdown).

Each agent file answers:
- What is this agent's single responsibility?
- What can it do? What is it explicitly NOT allowed to do?
- What tools can it invoke?
- What other agents can it delegate to?

```
agents/
  researcher.md    <- gathers information, never writes final output
  executor.md      <- performs actions, never makes decisions autonomously
  supervisor.md    <- orchestrates other agents, never executes directly
```

### 2. `prompts/` — Prompt Templates
Reusable, parameterized prompt templates and output evaluation criteria.
Separating prompts from agent definitions allows iteration without touching agent logic.

```
prompts/
  task_prompt.md       <- template for assigning a task to an agent
  eval_criteria.md     <- criteria for evaluating an agent's output quality
```

A prompt template uses placeholders: `{{task}}`, `{{context}}`, `{{constraints}}`.
Eval criteria define what "good output" looks like for a given task type.

### 3. `memory/` — Memory Storage
Two distinct memory layers. Never conflate them.

```
memory/
  vector_store/      <- long-term semantic memory (persisted, searchable by similarity)
  context_window/    <- short-term session memory (ephemeral, ordered, token-limited)
```

- **vector_store**: stores embeddings of past interactions, documents, knowledge.
  Use for retrieval-augmented generation (RAG). Persists across sessions.
- **context_window**: the active conversation or task state passed to the model.
  Managed per-session. Cleared or summarized when token limits are approached.

### 4. `tools/` — API & Tools
Executable code the agent can invoke. Each tool is a single-responsibility function.
Tools are called by agents; agents never contain tool implementation.

```
tools/
  api_calls.py       <- wrappers for external HTTP APIs
  web_scraper.py     <- fetches and parses web content
```

Rules:
- Each tool has a clear name, input schema, and output schema.
- Tools are stateless where possible.
- Tools never call other agents directly.

### 5. `workflows/` — Task Workflows
Orchestration logic: sequences of steps, branching, delegation between agents.
Workflows are the "how" — they connect agents, tools, and memory into a process.

```
workflows/
  job_process.md     <- step-by-step process for a specific job type
  qa_pipeline.md     <- quality assurance flow for validating outputs
```

A workflow defines:
- Entry condition (what triggers this workflow)
- Ordered steps (which agent, which tool, which prompt)
- Exit condition (what constitutes completion)
- Failure path (what happens on error or low-confidence output)

### 6. `guardrails/` — Validation Rules
Safety and quality checks applied to inputs and outputs.
Guardrails run independently of agents — they are not inside agent logic.

```
guardrails/
  validation_rules.md   <- what constitutes valid input/output for each agent
  safety_checks.md      <- content policy, PII detection, hallucination flags
```

Guardrails answer:
- Is this input safe to process?
- Is this output safe to deliver?
- Does the output meet minimum quality thresholds?
- Should this be escalated to a human?

---

## Decision Rules for the Agent

### Scaffolding a new agent system

1. Start with `agents/` — define roles first, before writing any code.
2. Write `prompts/` — define task templates and eval criteria.
3. Define `guardrails/` — safety rules before tools are wired.
4. Add `tools/` — only the tools the defined agents actually need.
5. Define `workflows/` — orchestration comes last, after parts are stable.
6. Set up `memory/` — add vector store only if retrieval is needed; context window is always needed.

### Adding a new agent

1. Create a new file in `agents/`.
2. Define its role, permissions, tools, and delegation rules.
3. Add or reuse prompt templates in `prompts/`.
4. Register the agent in any relevant `workflows/`.
5. Verify `guardrails/` cover this agent's input/output types.

### Adding a new tool

1. Create a single-responsibility file in `tools/`.
2. Define input schema, output schema, and error cases.
3. Reference the tool in the relevant agent file under "available tools".
4. Do NOT put orchestration logic inside the tool.

### Changing agent behavior

- Change **what the agent is**: edit `agents/<agent>.md`.
- Change **how the agent is prompted**: edit `prompts/`.
- Change **what the agent can do**: edit `tools/` and update `agents/<agent>.md`.
- Change **the sequence of operations**: edit `workflows/`.
- Change **what is allowed or blocked**: edit `guardrails/`.

---

## Anti-Patterns to Avoid

- **Logic in prompts**: prompt templates are templates, not programs. Branching logic belongs in workflows.
- **Agents calling tools directly in code**: agents declare tool access; workflows invoke tools on behalf of agents.
- **Single memory layer**: conflating long-term and short-term memory leads to bloated context windows and poor retrieval.
- **Guardrails inside agent definitions**: safety checks must be independent so they can be updated without touching agent logic.
- **One monolithic workflow**: break large workflows into composable sub-workflows.
- **Unnamed roles**: every agent must have an explicit, bounded role. "General assistant" is not a role.

---

## Checklist Before Generating an Agent System

- [ ] Every agent has a single, named responsibility.
- [ ] Prompts are parameterized templates, not hardcoded strings.
- [ ] Memory strategy is defined: which data is long-term, which is session-scoped.
- [ ] Every tool has a clear input/output contract.
- [ ] At least one workflow defines the end-to-end process.
- [ ] Guardrails cover both input validation and output safety.
- [ ] No concern bleeds into another folder.