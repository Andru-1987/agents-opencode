---
name: clean-code
description: >
  Reglas para codigo escalable y limpio.
---

## Standards & Quality
Si no hay tipos, no hay confianza. Si hay anidamiento, hay deuda técnica.

### Type Hints (MANDATORY)
- Todas las funciones deben tener tipos en parámetros y retorno.
- Usar `Protocol` para definir interfaces de puertos.

### Never Nester Principle
- Máximo 2 niveles de indentación.
- Invertir `if` para usar Guard Clauses y retornos tempranos.
- El "Happy Path" siempre debe estar en el nivel más bajo de indentación.

### SOLID & KISS
- Una clase = Una responsabilidad. No me hagas una "God Class" tipo Monica Geller controlando todo el departamento.
- YAGNI: No abstraigas algo que se usa una sola vez. Esperá a la tercera.