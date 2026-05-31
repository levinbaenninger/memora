# 3.3 OWASP: Injection

## Risiko

Memora nimmt viele Inputs entgegen: Titel, Notizinhalte, Task-Beschreibungen, Tags, Ordnernamen, Suchbegriffe, IDs und Share Tokens. Ohne Validation könnten Angreifer SQL Injection, XSS Injection oder unsichere Links in Inhalten versuchen.

Besonders relevant sind:

- SQL Injection in Such- und Filterabfragen
- XSS über Rich-Text-Inhalte
- JavaScript URLs in Links
- zu grosse JSON-Inhalte als Denial-of-Service-Vektor
- ungültige IDs oder Tokens in API Requests

## Unsere Massnahmen

- API Inputs werden mit Zod validiert.
- oRPC definiert Input- und Output-Schemas pro Procedure.
- Request-IDs werden als `z.nanoid()` validiert, wenn es sich um interne Memora-IDs handelt.
- Strings haben Limits, z. B. Titel maximal 200 Zeichen und Tags maximal 60 Zeichen.
- Notizinhalte werden als JSON-Struktur validiert und auf maximal 1 MB begrenzt.
- Task-Inputs wie Titel, Beschreibung, Fälligkeitsdatum und Tags werden mit Zod Schemas validiert.
- Externe Links in Notizinhalten erlauben nur `http:`, `https:`, `mailto:` und `tel:`.
- Interne Notizlinks müssen dem Format `memora://note/<id>` entsprechen.
- Database Access läuft über den Drizzle Query Builder statt über manuell zusammengesetzte SQL-Strings.
- Raw SQL nutzen wir nur für kontrollierte Spezialfälle, z. B. Indexdefinitionen oder rekursive Ordnerabfragen.

## Technische Umsetzung

Nachweise:

- Content Validation: `packages/api/src/modules/notes/content/schema.ts`
- Notiz Input Schemas: `packages/api/src/modules/notes/procedures/create-note.ts:19`, `packages/api/src/modules/notes/procedures/update-note.ts:19`
- Task Input Schemas: `packages/api/src/modules/tasks/procedures/create-task.ts:11`, `packages/api/src/modules/tasks/procedures/update-task.ts:11`
- Task Tag Validation: `packages/api/src/modules/task-tags/procedures/create-tag.ts:13`, `packages/api/src/modules/task-tags/procedures/update-tag.ts:20`
- Pagination Limits: `packages/api/src/modules/shared/pagination.ts:3`
- Link Validation und Content-Limit: `packages/api/src/modules/notes/content/schema.ts:30`, `packages/api/src/modules/notes/content/schema.ts:117`
- Share Token Validation: `packages/api/src/modules/shares/procedures/get-public-share.ts:15`
- Drizzle Schema und Queries: `packages/db/src/schema/**`, `packages/api/src/modules/**`

## Einschätzung

Injection-Risiken sind in den wichtigsten Pfaden sinnvoll reduziert. Die Kombination aus Zod, oRPC und Drizzle verhindert viele klassische Fehler.

## Quellen / Nachweise

- [OWASP Injection](https://owasp.org/Top10/2021/A03_2021-Injection/)
- [Zod String Validation](https://zod.dev/api?id=strings)
- [oRPC Procedures mit Input/Output Schemas](https://orpc.dev/docs/procedure)
- [Drizzle SQL Template und Parameterized Queries](https://orm.drizzle.team/docs/sql)
- [BlockNote Schemas](https://www.blocknotejs.org/docs/foundations/schemas)

## Manuelles Testprotokoll

| Nr. | Test | Schritte | Erwartetes Resultat | Nachweis |
| --- | --- | --- | --- | --- |
| IN-01 | Ungültige interne ID | API Call mit ungültiger Note-, Task-, Folder- oder Tag-ID senden, z. B. `abc`. | Zod lehnt den Request ab, bevor die Business Logic läuft. | [ID Validation](./assets/id-validation.mov) |
| IN-02 | Zu langer Titel oder Tag | Note/Task mit Titel über 200 Zeichen oder Tag über 60 Zeichen erstellen. | Die API validiert den Input und gibt einen Fehler zurück. | [Title/Tag Validation](./assets/title-validation.mov) |
| IN-03 | Ungültiger Task-Input | Task mit leerem Titel, zu langer Beschreibung oder ungültigem Tag erstellen. | Die Task Procedure lehnt den Input ab. | [Task Title Validation](./assets/task-title-validation.mov) |
| IN-04 | Unsicherer Link | In einer Notiz einen Link mit `javascript:` speichern. | Die Content Validation lehnt den Inhalt ab. | [Link Validation](./assets/link-validation.mov) |
| IN-05 | Zu grosser Notizinhalt | Notizinhalt über 1 MB speichern. | Die API lehnt den Inhalt als zu gross ab. | [Content Limit](./assets/content-limit.mov) |
