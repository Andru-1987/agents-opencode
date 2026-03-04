## Implementaciones de Referencia

### 1. Inversión de Dependencias (DI)
Evitar instanciar clases concretas dentro de servicios. Inyectar el puerto.

### 2. De if-else anidado a Guard Clauses
# Antes:
if user:
    if user.is_active:
        return process()
# Después:
if not user or not user.is_active:
    return error()
return process()

### 3. Repository Pattern con Protocol
Usar `typing.Protocol` para definir el contrato que el adaptador debe cumplir.