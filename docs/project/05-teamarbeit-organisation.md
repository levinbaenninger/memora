# 5. Teamarbeit & Organisation

## Zusammenarbeit

Unsere Zusammenarbeit ist über Git nachvollziehbar. Commits, Branches und Pull Requests zeigen, wer an welchen Teilen gearbeitet hat. Im Projekt verwenden wir Conventional Commits für Commit Messages und PR-Titel.

## Beiträge

| Person | Hauptbeiträge |
| --- | --- |
| Tobias | `[Beiträge von Tobias einfügen]` |
| Levin | `[Beiträge von Levin einfügen]` |

Nachweise:

- Commit-Konvention: `commitlint.config.ts`
- Commitizen Script: `package.json`
- PR Title Validation: `.github/workflows/validate-pr-title.yml`
- CI für Pull Requests: `.github/workflows/ci.yml`

## Organisation

Das Projekt ist als Monorepo organisiert. Dadurch sind Web-App, API, Auth, Database, UI und Env-Konfiguration getrennt, aber im gleichen Repository versioniert. Grössere Architekturentscheidungen halten wir als ADRs unter `docs/adr/` fest.

Wichtige organisatorische Dateien:

- `README.md`
- `CONTEXT.md`
- `docs/adr/**`
- `docs/agents/**`
- `AGENTS.md`

## Nachweise

- `[Screenshot oder Auszug aus Git History einfügen]`
- `[Optional: Link zu Pull Requests / Issues einfügen]`
