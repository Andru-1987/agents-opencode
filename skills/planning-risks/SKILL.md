# Skill: Risk & Mitigation Radar

For every architectural proposal, attach this risk assessment:

### Risk Table
| Risk Identifier | Impact (1-5) | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Data Consistency** | 5 | Low | Implement Saga pattern / Distributed locks. |
| **Learning Curve** | 3 | High | Schedule a 2-day spike for the team. |

**Assumed Trade-off**:
- Explicitly state what you are sacrificing (e.g., "We sacrifice sub-second latency for absolute data consistency").