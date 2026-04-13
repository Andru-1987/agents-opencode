---
name: lazy-deps
description: >
  On-demand / lazy dependency management for Python ML projects and containers.
  Use this skill whenever the user needs to install, import, or manage Python packages
  lazily — i.e., only when they are actually needed at runtime — especially in ML
  projects with heavy dependencies (PyTorch, transformers, torchvision, timm, etc.)
  or Docker/container environments where image size and cold start time matter.
  Trigger when the user mentions: lazy imports, on-demand install, conditional dependencies,
  optional packages, heavy ML containers, reducing image size, deferred imports,
  extras_require, or asks how to avoid pre-installing everything upfront.
  Also trigger when the user is structuring a new ML project or container and asks
  how to handle dependencies that are not always needed.
---

# Lazy / On-Demand Dependency Management

## When to use each approach

| Situation | Recommended approach |
|---|---|
| Package only needed in some code paths | `lazy_import()` utility |
| Container with multiple workloads (vision / nlp / etc.) | `extras_require` + build arg |
| Agentic or notebook environment, runtime unknown | `ensure_package()` with install fallback |
| Large monorepo, CI must stay fast | Optional groups in `pyproject.toml` |
| Single-file script, minimal setup | Inline `_require()` guard at top |

---

## Pattern 1: `lazy_import` — defer import until first use

Use when a module is only needed in a subset of code paths and you don't want to
fail at startup if it's missing.

```python
# utils/lazy_import.py
import importlib
import sys
from types import ModuleType

def lazy_import(package: str, import_name: str | None = None) -> ModuleType:
    """
    Import a module. If not installed, raise ImportError with a clear message.
    Does NOT auto-install — use ensure_package() for that.
    """
    name = import_name or package
    try:
        return importlib.import_module(name)
    except ImportError as e:
        raise ImportError(
            f"Optional dependency '{package}' is not installed. "
            f"Install it with: pip install {package}"
        ) from e
```

Usage:

```python
def run_ocr(image_path: str):
    easyocr = lazy_import("easyocr")
    reader = easyocr.Reader(["en", "es"])
    return reader.readtext(image_path)
```

---

## Pattern 2: `ensure_package` — install if missing (runtime)

Use in agentic pipelines, notebooks, or dev containers where pip is available
and it is acceptable to install at runtime. Avoid in production inference containers
with read-only filesystems.

```python
# utils/ensure_package.py
import importlib
import subprocess
import sys
import logging
from types import ModuleType

logger = logging.getLogger(__name__)

def ensure_package(
    package: str,
    import_name: str | None = None,
    version: str | None = None,
) -> ModuleType:
    """
    Import a package. If missing, install it via pip and re-import.

    Args:
        package:     pip install name (e.g. "scikit-learn")
        import_name: actual import name if different (e.g. "sklearn")
        version:     optional pin, e.g. ">=1.3,<2"

    Returns:
        The imported module.
    """
    name = import_name or package
    pip_spec = f"{package}{version}" if version else package

    try:
        return importlib.import_module(name)
    except ImportError:
        logger.info("Installing missing dependency: %s", pip_spec)
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", pip_spec, "--quiet"],
            stdout=subprocess.DEVNULL,
        )
        return importlib.import_module(name)
```

Usage:

```python
def embed_text(texts: list[str]) -> list[list[float]]:
    sentence_transformers = ensure_package(
        "sentence-transformers", import_name="sentence_transformers"
    )
    model = sentence_transformers.SentenceTransformer("all-MiniLM-L6-v2")
    return model.encode(texts).tolist()
```

---

## Pattern 3: `pyproject.toml` optional groups (container-friendly)

Best for containerized workloads where you build one image per task type.
Avoids any runtime pip calls.

```toml
# pyproject.toml
[project]
name = "myproject"
dependencies = [
    "torch>=2.2",
    "numpy",
    "pydantic>=2",
]

[project.optional-dependencies]
vision   = ["torchvision", "timm", "albumentations", "opencv-python-headless"]
nlp      = ["transformers", "tokenizers", "sentencepiece", "accelerate"]
tracking = ["mlflow", "wandb"]
dev      = ["pytest", "ruff", "mypy"]
```

Install in Dockerfile per task:

```dockerfile
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime AS base
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir -e ".[vision]"

# Or via build arg for a flexible single Dockerfile:
ARG TASK_GROUP=base
RUN pip install --no-cache-dir -e ".[$TASK_GROUP]"
```

Build:

```bash
docker build --build-arg TASK_GROUP=nlp -t myproject:nlp .
```

---

## Pattern 4: `lazy-loader` library (scikit-image style)

For public libraries or large packages where you want transparent deferred import
without modifying import syntax in calling code.

```bash
pip install lazy-loader
```

```python
# mypackage/__init__.py
import lazy_loader as lazy

__getattr__, __dir__, __all__ = lazy.attach(
    __name__,
    submodules=["vision", "nlp", "tracking"],
    submod_attrs={
        "vision": ["ViTEncoder", "run_ocr"],
        "nlp": ["embed_text", "summarize"],
    },
)
```

Submodules are only imported when first accessed. No code changes needed in callers.

---

## Decision guide for containers

```
Does the container have write access to site-packages at runtime?
  No  → Use pyproject optional groups + build args. Never call pip at runtime.
  Yes → Does the install need to happen mid-run (dynamic agent decides what to use)?
          Yes → ensure_package() with version pin
          No  → Prefer optional groups; use ensure_package() only in dev/notebook mode
```

---

## Important caveats

- `subprocess + pip` at runtime is slow (can add 30-120s for heavy packages).
- In containers with `--read-only` filesystem or non-root users, pip will fail silently
  or with permission errors. Always test with the same user as the container runs with.
- Never call `ensure_package` inside a hot loop or per-request handler.
  Call it once at the top of the function that needs it, guarded by a module-level cache:

```python
_transformers = None

def get_transformers():
    global _transformers
    if _transformers is None:
        _transformers = ensure_package("transformers")
    return _transformers
```

- For PyTorch specifically: `torch` itself should always be in the base layer.
  It is never a good candidate for lazy install (size, CUDA setup, ABI compatibility).

---

## Reference files

- `references/dockerfile-patterns.md` — Multi-stage Dockerfile examples for ML
- `references/pyproject-templates.md` — Ready-to-use pyproject.toml templates by stack