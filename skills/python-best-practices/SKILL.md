---
name: python-best-practices
description: >
  Python pragmático sin sobre-ingeniería. Aplicar cuando se escribe
  código Python nuevo, se refactoriza código existente, o se diseña
  la estructura de un módulo o proyecto Python.
---

# Python Best Practices — Sin sobre-ingeniería

## Filosofía central

- Legibilidad primero. El código se lee más veces de las que se escribe.
- YAGNI (You Aren't Gonna Need It): no abstraer hasta que haya al menos 2-3 casos reales.
- Flat is better than nested (Zen of Python). Menos capas, menos fricción.
- Explícito sobre implícito: nombres descriptivos, sin magia oculta.

---

## Estructura de proyecto

Para un script o proyecto simple:
```
project/
├── main.py
├── module.py
├── tests/
│   └── test_module.py
├── requirements.txt
└── README.md
```

Para un proyecto con múltiples módulos:
```
project/
├── src/
│   └── mypackage/
│       ├── __init__.py
│       ├── core.py
│       └── utils.py
├── tests/
├── pyproject.toml
└── README.md
```

No crear carpetas vacías, base classes sin motivo, ni `services/`, `repositories/`, `interfaces/` por defecto.

---

## Nombrado

- Variables y funciones: `snake_case`
- Clases: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Archivos: `snake_case.py`
- Nombres descriptivos y directos: `get_user_by_id()` no `fetch()` ni `process()`

---

## Funciones

```python
# Bien: una responsabilidad, nombre claro, tipado
def calculate_discount(price: float, percentage: float) -> float:
    return price * (1 - percentage / 100)

# Mal: nombre vago, sin tipos, hace demasiado
def process(data, flag=None):
    ...
```

- Maximo 20-30 lineas por funcion. Si crece, dividir.
- Preferir return temprano para evitar anidamiento profundo.
- Usar `*` para forzar keyword arguments cuando hay mas de 2-3 params:
  ```python
  def create_user(*, name: str, email: str, role: str = "viewer") -> User:
  ```

---

## Tipos e interfaces

- Usar type hints en toda funcion publica.
- Usar `dataclasses` para estructuras de datos simples:
  ```python
  from dataclasses import dataclass

  @dataclass
  class Article:
      id: str
      title: str
      content: str
      published: bool = False
  ```
- Usar `TypedDict` para diccionarios con forma conocida (ej: respuestas de APIs).
- Usar `Enum` para valores finitos y conocidos.
- No crear clases solo para agrupar funciones. Un modulo alcanza.

---

## Manejo de errores

```python
# Especifico y util
try:
    result = call_api(endpoint)
except httpx.TimeoutException as e:
    logger.warning("API timeout en %s: %s", endpoint, e)
    raise

# Generico y silencioso — evitar
try:
    result = call_api(endpoint)
except Exception:
    pass
```

- Nunca silenciar excepciones con `except: pass`.
- Usar excepciones custom solo si el caller necesita diferenciarlas.
- Preferir `raise` sobre retornar `None` para indicar fallo.

---

## Imports y dependencias

- Orden: stdlib, third-party, local (respetar isort).
- Evitar imports circulares: sintoma de diseño incorrecto.
- No usar `from module import *`.
- Preferir imports explicitos:
  ```python
  # Bien
  from pathlib import Path

  # Evitar cuando Path es mas claro
  import os
  os.path.join(...)
  ```

---

## Logging

Implementar el logger como singleton para garantizar una unica instancia de configuracion en toda la aplicacion. Esto evita handlers duplicados y configuraciones contradictorias entre modulos.

```python
# logger.py
import logging
import sys
from typing import Optional


class AppLogger:
    _instance: Optional["AppLogger"] = None
    _logger: Optional[logging.Logger] = None

    def __new__(cls) -> "AppLogger":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._setup()
        return cls._instance

    def _setup(self) -> None:
        self._logger = logging.getLogger("app")
        if not self._logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            formatter = logging.Formatter(
                "%(asctime)s %(levelname)s %(name)s %(message)s"
            )
            handler.setFormatter(formatter)
            self._logger.addHandler(handler)
            self._logger.setLevel(logging.INFO)

    @property
    def logger(self) -> logging.Logger:
        return self._logger


def get_logger() -> logging.Logger:
    return AppLogger().logger
```

Uso en cualquier modulo:
```python
from logger import get_logger

logger = get_logger()

# Con contexto, sin f-strings en el mensaje
logger.info("Procesando articulo id=%s", article_id)
logger.warning("Reintento %d para endpoint=%s", attempt, endpoint)
```

Reglas de uso:
- Llamar siempre a `get_logger()` en el nivel de modulo, no dentro de funciones.
- No instanciar `logging.getLogger()` directamente fuera de `logger.py`.
- No usar f-strings en los mensajes de log: se evaluan aunque el nivel no este activo.
- El nivel de log (`INFO`, `DEBUG`, etc.) se configura una sola vez en el singleton, idealmente desde una variable de entorno.

Configuracion del nivel desde entorno:
```python
import os

level = os.environ.get("LOG_LEVEL", "INFO").upper()
self._logger.setLevel(getattr(logging, level, logging.INFO))
```

---

## Testing

- Un archivo de test por modulo: `test_<module>.py`.
- Usar `pytest`. Sin frameworks extras salvo necesidad clara.
- Cada test: arrange, act, assert. Sin logica compleja adentro.
- Nombres descriptivos:
  ```python
  def test_calculate_discount_returns_zero_for_100_percent():
  ```
- Mockear solo lo externo (APIs, DB, filesystem). No mockear logica propia.

---

## Configuracion

- Variables de entorno via `python-dotenv` + `os.environ.get()`.
- Para proyectos mas estructurados, `pydantic-settings` con un `Settings` dataclass.
- No hardcodear secrets, URLs de produccion ni paths absolutos.

---

## Anti-patrones a evitar

| Anti-patron | Alternativa |
|---|---|
| Clases con solo `__init__` y un metodo | Funcion directa |
| `BaseService` / `BaseRepository` sin motivo | Copiar y simplificar hasta que haya necesidad real |
| Managers / Handlers / Processors genericos | Nombres que digan que hacen concretamente |
| `utils.py` con 500 lineas | Modulos separados por dominio |
| Comentarios que repiten el codigo | Codigo autoexplicativo + comentarios del por que |

---

## Herramientas recomendadas

- Formatter: `ruff format`
- Linter: `ruff check`
- Type checker: `mypy` o `pyright` en modo basico
- Tests: `pytest`
- Env management: `uv`