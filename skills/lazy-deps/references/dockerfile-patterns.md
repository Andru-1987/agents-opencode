# Dockerfile Patterns for ML — Lazy / Optional Dependencies

## Pattern A: Multi-target image (one Dockerfile, multiple task images)

```dockerfile
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime AS base

WORKDIR /app
COPY pyproject.toml ./

# Core always-present deps
RUN pip install --no-cache-dir -e "." \
    && pip cache purge

# ── Vision target ─────────────────────────────────────────────
FROM base AS vision
RUN pip install --no-cache-dir -e ".[vision]" && pip cache purge

# ── NLP target ────────────────────────────────────────────────
FROM base AS nlp
RUN pip install --no-cache-dir -e ".[nlp]" && pip cache purge

# ── Full (all groups, for dev/testing) ───────────────────────
FROM base AS full
RUN pip install --no-cache-dir -e ".[vision,nlp,tracking,dev]" \
    && pip cache purge
```

Build commands:
```bash
docker build --target vision  -t myproject:vision  .
docker build --target nlp     -t myproject:nlp     .
docker build --target full    -t myproject:dev     .
```

---

## Pattern B: Single image, task group via build arg

```dockerfile
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime

ARG TASK_GROUP=base
WORKDIR /app
COPY pyproject.toml ./

RUN pip install --no-cache-dir -e ".[$TASK_GROUP]" \
    && pip cache purge

ENV TASK_GROUP=${TASK_GROUP}
```

```bash
docker build --build-arg TASK_GROUP=vision -t myproject:vision .
docker build --build-arg TASK_GROUP=nlp    -t myproject:nlp    .
```

Good for CI pipelines where the group is determined at build time from an env var.

---

## Pattern C: Runtime group install at container startup (dev/agent use)

When you don't control the build but can control the entrypoint.
Only use in development or agentic orchestration, not production inference.

```dockerfile
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime

WORKDIR /app
COPY . .

# Install base only at build time
RUN pip install --no-cache-dir -e "." && pip cache purge

# Entrypoint installs the right group before running the job
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
```

```bash
# scripts/entrypoint.sh
#!/bin/bash
set -euo pipefail

TASK_GROUP="${TASK_GROUP:-}"
if [ -n "$TASK_GROUP" ]; then
  echo "[entrypoint] Installing optional group: $TASK_GROUP"
  pip install --quiet -e ".[$TASK_GROUP]"
fi

exec "$@"
```

```bash
docker run -e TASK_GROUP=vision myproject python train.py
```

---

## Pattern D: LangGraph / agent container with dynamic tool loading

For agentic systems where the agent itself decides which tools (and their dependencies)
to activate at runtime.

```dockerfile
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir \
    langgraph langchain-core \
    -e ".[agent-base]" \
    && pip cache purge

# Agent calls ensure_package() for tool-specific deps as needed
CMD ["python", "-m", "myagent.main"]
```

The agent uses `ensure_package()` from the skill when a tool node needs a dep:

```python
# tools/vision_tool.py
from myproject.utils.ensure_package import ensure_package

def describe_image(image_path: str) -> str:
    transformers = ensure_package("transformers")
    torch = ensure_package("torch")  # already installed, fast no-op
    # ...
```

---

## Cache tips

- Always `pip cache purge` or `--no-cache-dir` after installs in Dockerfile layers.
- Pre-download HuggingFace models into the image if they are always needed:
  ```dockerfile
  RUN python -c "from transformers import AutoModel; AutoModel.from_pretrained('bert-base-uncased')"
  ```
  This burns the model into the layer so there's no network call at runtime.
- For Vertex AI / Cloud Run Jobs: prefer pre-baked images over runtime installs.
  Runtime installs in Cloud Run add cold start latency that scales with package size.