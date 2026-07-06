"""Self-contained feature bounded contexts (e.g. `patients`).

Each module under here owns its full vertical slice — `domain/`,
`application/`, `infrastructure/`, `presentation/`, `tests/` — as opposed to
the top-level `app/domain`, `app/application`, `app/infrastructure`, `app/api`
layering used by the Authentication/RBAC core, which is shared
infrastructure every module depends on (current user, permissions, the
`DomainError` base class, the DB session).
"""
