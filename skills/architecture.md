## Hexagonal Architecture (Ports & Adapters)
El dominio es SAGRADO. No se mancha con frameworks ni con bases de datos.

### Reglas de Dependencia
- Domain NUNCA importa nada de adapters o infrastructure.
- Domain define Ports (Protocols/Interfaces).
- Adapters implementan los Ports.
- Application layer es el director de orquesta (Use Cases).

### Estructura Mandatoria
project/
├── domain/         # Entities, Value Objects, Domain Services, Ports
├── application/    # Use Cases (Orquestación)
├── adapters/       # Repositories (SQL, NoSQL), API (FastAPI), CLI
└── infrastructure/ # DI, Config, Logging