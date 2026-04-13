---
name: system-design
description: Define los estándares de diseño, patrones de comunicación y criterios de escalabilidad.
---

## 1. Principios Fundamentales (The Core)

El Arquitecto debe validar cada propuesta contra estos cuatro pilares:

* S.O.L.I.D: Especial énfasis en SRP (Responsabilidad Única) e ISP (Segregación de Interfaces) para mantener componentes pequeños.
* K.I.S.S (Keep It Simple, Stupid): La solución más simple suele ser la correcta. Evitar la sobre-ingeniería en fases iniciales.
* Separación de Preocupaciones (SoC): Dividir el sistema en capas (Presentación, Aplicación, Dominio e Infraestructura).
* Y.A.G.N.I (You Ain't Gonna Need It): No implementar funcionalidad basada en "posibles" necesidades futuras.

---

## 2. Estilos Arquitectónicos

El agente debe seleccionar el estilo que mejor se adapte al problema planteado:

### 2.1 Arquitectura Hexagonal (Ports & Adapters)
Ideal para desacoplar la lógica de negocio de agentes externos (DBs, APIs, UIs).
* Domain: Lógica pura, entidades y servicios de dominio.
* Ports: Interfaces que definen qué necesita el dominio.
* Adapters: Implementaciones concretas de los puertos.

### 2.2 Event-Driven Architecture (EDA)
Recomendado para sistemas altamente escalables y desacoplados.
* Productores: Emiten eventos de dominio cuando ocurre un cambio de estado.
* Consumidores: Reaccionan a eventos de forma asíncrona.
* Broker: Orquestador de mensajes (ej. RabbitMQ, Kafka o Event Bus interno).

### 2.3 Micro-frontends / Micro-services
Dividir por Bounded Contexts (Contextos Delimitados) siguiendo los principios de Domain-Driven Design (DDD).

---

## 3. Estrategias de Comunicación

| Tipo | Uso Recomendado | Protocolo Sugerido |
| :--- | :--- | :--- |
| Sincrónica | Operaciones de lectura o acciones que requieren respuesta inmediata. | REST, gRPC, GraphQL |
| Asincrónica | Procesos pesados, notificaciones o efectos secundarios. | Webhooks, Pub/Sub, Queues |
| Internal | Comunicación entre módulos del mismo proceso. | In-memory Events, Method calls |

---

## 4. Consistencia y Persistencia de Datos

1.  Database per Service: Evitar bases de datos compartidas entre diferentes contextos delimitados.
2.  Consistencia Eventual: En sistemas distribuidos, aceptar que los datos pueden tardar un tiempo en sincronizarse.
3.  Capa de Abstracción: Siempre usar el Repository Pattern para que el motor de base de datos sea un detalle de implementación.

---

## 5. Atributos de Calidad (The "-ilities")

* Escalabilidad: ¿Puede el sistema manejar un incremento de carga? (Horizontal vs Vertical).
* Resiliencia: Implementación de *Circuit Breakers*, *Retries* y *Graceful Degradation*.
* Observabilidad: El sistema debe emitir Logs, Métricas y Traces estructurados.
* Seguridad: Aplicar el principio de "Menor Privilegio" y validación de esquemas en la entrada.

---

## 6. Registro de Decisiones (ADR)

Para cada decisión arquitectónica importante (ej: cambiar de REST a WebSockets), el Arquitecto debe generar un ADR (Architecture Decision Record) con este formato:

```markdown
# ADR-[ID]: [Título de la decisión]

- Status: [Proposed | Accepted | Superseded]
- Contexto: [Descripción del problema y por qué se toma la decisión]
- Decisión: [La solución elegida]
- Consecuencias: [Impactos positivos y negativos (Trade-offs)]
```

---

## 7. Checklist para el Arquitecto

Antes de entregar una especificación funcional (@arquitecto), verifica:
- [ ] ¿He definido claramente los límites de cada componente?
- [ ] ¿He identificado las dependencias externas y sus puertos?
- [ ] ¿He considerado el manejo de errores y estados de fallo?
- [ ] ¿La solución es lo suficientemente simple para ser implementada en menos de una iteración?

---