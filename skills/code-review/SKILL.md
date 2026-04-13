---
name: code-review
description: Validador de código.
---

# Checklist de Code Review

## 1. Legibilidad y Estilo
- [ ] ¿Los nombres de variables son descriptivos (evitar `x`, `data`, `temp`)?
- [ ] ¿Las funciones son cortas (máximo 25-30 líneas)?
- [ ] ¿Hay comentarios explicando el "POR QUÉ" y no el "QUÉ"?

## 2. Seguridad
- [ ] ¿Se están validando todos los inputs del usuario?
- [ ] ¿Hay secretos (API keys) hardcodeados? (Prohibido).
- [ ] ¿Se limpian los datos antes de guardarlos en DB (SQL Injection)?

## 3. Performance
- [ ] ¿Hay bucles innecesarios o complejidad O(n^2)?
- [ ] ¿Se están cerrando correctamente las conexiones a DB o Streams?
- [ ] ¿Se usa `async/await` de forma eficiente (evitar bloqueos)?

## 4. Mantenibilidad
- [ ] ¿El código es fácil de testear?
- [ ] ¿Se introdujo deuda técnica innecesaria?