---
name: refactory-patterns
description: Guía de principios para transformar código complejo en estructuras simples, desacopladas y altamente testeables.
---

## 1. Filosofía de Estructura: "Pensar en Puertos"

Para evitar que el proyecto se convierta en un monolito de espagueti, todo agente debe seguir el principio de **Límites de Contexto**.

* **El Núcleo (Dominio):** No conoce bases de datos, no conoce APIs externas, solo conoce reglas de negocio.
* **La Infraestructura:** Implementa los detalles (SQL, Redis, HTTP).
* **El Contrato (Puerto):** La única forma en que ambos se comunican.

---

## 2. Patrones de Refactorización Lógica

### 2.1 Aplanamiento de Flujo (Guard Clauses)
**Objetivo:** Reducir la carga cognitiva eliminando el anidamiento. El "Camino Feliz" siempre debe estar en el nivel de indentación 0.

| Técnica | Acción |
| :--- | :--- |
| **Fail Fast** | Si los requisitos no se cumplen, retornar inmediatamente. |
| **Return Early** | No usar variables `result` que se modifican y se retornan al final. |

> **Pseudocódigo Agóstico:**
> ```text
> // ANTES: Pirámide de la perdición
> function process(input) {
>     if (input.isValid) {
>         if (input.hasPermission) {
>             return execute(input)
>         }
>     }
>     return error
> }
>
> // DESPUÉS: Flujo lineal
> function process(input) {
>     if (!input.isValid) return error
>     if (!input.hasPermission) return error
>     
>     return execute(input)
> }
> ```

---

## 3. Patrones de Abstracción Eficiente

### 3.1 Inversión de Dependencias (IoC)
Ningún componente de alto nivel debe depender de uno de bajo nivel. Ambos deben depender de una **Abstracción (Protocolo/Interfaz)**.

* **Regla de Oro:** Si usas `new` o instancias una clase concreta dentro de un servicio, estás creando un acoplamiento rígido.
* **Acción:** Inyecta la dependencia a través del constructor.

### 3.2 Repository Pattern & Protocols
Define el comportamiento esperado sin casarte con la tecnología.

> **Definición de Contrato:**
> ```text
> Protocol DataRepository:
>     method get_by_id(id)
>     method save(entity)
> ```
> El servicio usa `DataRepository`. Que sea `Postgres` o `InMemory` es un detalle que el servicio ignora.

---

## 4. Refactorización de Datos: Value Objects

Evita la **"Obsesión por Primitivos"**. Si un dato tiene reglas (ej: un Email, una Moneda, un CBU), no es un `string` o un `float`.

* **Refactor:** Crea un objeto pequeño que se valide a sí mismo al nacer.
* **Resultado:** Si el objeto existe, es válido. No necesitas `ifs` de validación en toda tu lógica de negocio.

---

## 5. Métricas de "Hecho" (Definition of Done)

Un agente de OpenCode solo considerará terminada una refactorización si cumple esta tabla:

| Métrica | Estándar |
| :--- | :--- |
| **Indentación** | Máximo 2 niveles de profundidad. |
| **Responsabilidad** | Una función hace una sola cosa (SRP). |
| **Tamaño** | Funciones < 20 líneas, Clases < 200 líneas. |
| **Acoplamiento** | Las dependencias se inyectan, no se crean. |

---

## 6. La Regla AHA (Avoid Hasty Abstractions)

**¡Cuidado con el exceso de ingeniería!**
1.  **Primera vez:** Se escribe código rápido.
2.  **Segunda vez (Duplicación):** Se tolera la duplicación (es más barata que una mala abstracción).
3.  **Tercera vez:** Se aplica esta Skill para abstraer y refactorizar.

