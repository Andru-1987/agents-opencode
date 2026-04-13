# pyproject.toml Templates by ML Stack

## Template: Vision (PyTorch + image processing)

```toml
[project]
name = "myproject"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "torch>=2.2",
    "numpy>=1.26",
    "pydantic>=2.0",
    "python-dotenv",
]

[project.optional-dependencies]
vision = [
    "torchvision>=0.17",
    "timm>=0.9",
    "albumentations>=1.4",
    "opencv-python-headless>=4.9",
    "Pillow>=10",
]
nlp = [
    "transformers>=4.40",
    "tokenizers>=0.19",
    "sentencepiece",
    "accelerate>=0.29",
    "datasets>=2.19",
]
tracking = [
    "mlflow>=2.12",
    "wandb>=0.16",
]
serving = [
    "fastapi>=0.111",
    "uvicorn[standard]>=0.29",
    "onnxruntime>=1.18",
]
dev = [
    "pytest>=8",
    "pytest-cov",
    "ruff>=0.4",
    "mypy>=1.10",
    "ipykernel",
]
```

---

## Template: NLP / LLM agent stack

```toml
[project]
name = "myagent"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "langchain-core>=0.2",
    "langgraph>=0.1",
    "pydantic>=2.0",
    "python-dotenv",
    "httpx",
]

[project.optional-dependencies]
google = [
    "langchain-google-vertexai>=1.0",
    "google-cloud-bigquery>=3.20",
    "google-cloud-aiplatform>=1.50",
]
openai = [
    "langchain-openai>=0.1",
    "openai>=1.25",
]
embeddings = [
    "sentence-transformers>=2.7",
    "faiss-cpu>=1.8",
]
tools-vision = [
    "Pillow>=10",
    "pytesseract",
    "easyocr",
]
tools-data = [
    "pandas>=2.2",
    "pyarrow>=16",
    "duckdb>=0.10",
]
dev = [
    "pytest>=8",
    "pytest-asyncio",
    "ruff>=0.4",
    "ipykernel",
]
```

---

## Template: Data pipeline / batch ML (Cloud Run Jobs / Vertex AI)

```toml
[project]
name = "mypipeline"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "torch>=2.2",
    "pydantic>=2.0",
    "loguru",
    "python-dotenv",
]

[project.optional-dependencies]
gcp = [
    "google-cloud-bigquery>=3.20",
    "google-cloud-bigquery-storage>=2.25",
    "google-cloud-storage>=2.16",
    "google-cloud-aiplatform>=1.50",
]
classifier = [
    "transformers>=4.40",
    "accelerate>=0.29",
    "datasets>=2.19",
]
image = [
    "torchvision>=0.17",
    "timm>=0.9",
    "albumentations>=1.4",
    "opencv-python-headless>=4.9",
]
eval = [
    "scikit-learn>=1.4",
    "seaborn>=0.13",
    "matplotlib>=3.8",
]
dev = [
    "pytest>=8",
    "ruff>=0.4",
    "ipykernel",
]
```

---

## Combining groups in pip

```bash
# Single group
pip install -e ".[vision]"

# Multiple groups
pip install -e ".[vision,tracking,dev]"

# All optional (quick dev setup)
pip install -e ".[vision,nlp,tracking,serving,dev]"
```

## Locking with uv (recommended for reproducibility)

```bash
# Generate lockfile for a specific group
uv pip compile pyproject.toml --extra vision -o requirements/vision.txt

# Install from lockfile (fast, deterministic)
uv pip sync requirements/vision.txt
```

This is the recommended approach for Vertex AI / Cloud Run Jobs where you want
deterministic builds and fast layer caching.