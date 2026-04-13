---
name: tdd-patterns
description: Patrones para validacion con pasos de pruebas
---

# Estándares de Test-Driven Development (TDD)

## 1. El Ciclo Red-Green-Refactor
- **Red**: Escribir un test que falle antes de cualquier implementación. El test define el "contrato" de la función.
- **Green**: Escribir el código mínimo necesario para que el test pase. No importa si es "sucio" en este punto.
- **Refactor**: Limpiar el código, eliminar duplicados y mejorar la legibilidad sin romper el test.

## 2. Estrategias de Testing
- **AAA Pattern**: Arrange (Preparar), Act (Actuar), Assert (Afirmar).
- **F.I.R.S.T**: Los tests deben ser Fast, Independent, Repeatable, Self-validating, y Timely.
- **Mocking**: Usar mocks para dependencias externas (DB, APIs) para mantener los tests de unidad aislados.

## 3. Cobertura Requerida
- Lógica de negocio: 100%
- Casos de borde (Edge cases): Mínimo 3 escenarios por función.
- Manejo de errores: Siempre testear que las excepciones se lancen correctamente.