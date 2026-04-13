# Global Project Rules

## Architectural Integrity
- **Planning First**: No implementation is allowed without a prior architectural plan or ADR.
- **Agent Authority**: The @planning-master agent is the final authority on system design.
- **Code Standards**: Follow SOLID, DRY, and Clean Code. Use Design Patterns (Saga, Repository, etc.) where appropriate.

## Skill Invocation
- Use `@planning-alternatives` for any technical decision.
- Use `@planning-risks` for any new feature or architectural change.
- Use `@planning-output` to generate final documentation.