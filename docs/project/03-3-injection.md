# 3.3 OWASP: Injection

## Risiko für Memora

Memora nimmt viele Inputs entgegen: Titel, Notizinhalte, Tags, Ordnernamen, Suchbegriffe, IDs und Share Tokens. Ohne Validation könnten Angreifer SQL Injection, Script Injection oder unsichere Links in Notizinhalten versuchen.

Besonders relevant sind:

- SQL Injection in Such- und Filterabfragen
- XSS über Rich-Text-Inhalte
- JavaScript URLs in Links
- zu grosse JSON-Inhalte als Denial-of-Service-Vektor
- ungültige IDs oder Tokens in API Requests

## Unsere Massnahmen

- API Inputs werden mit Zod validiert.
- oRPC definiert Input- und Output-Schemas pro Procedure.
- IDs werden häufig als `z.nanoid()` validiert.
- Strings haben Limits, z. B. Titel maximal 200 Zeichen und Tags maximal 60 Zeichen.
- Notizinhalte werden als JSON-Struktur validiert und auf maximal 1 MB begrenzt.
- Externe Links in Notizinhalten erlauben nur `http:`, `https:`, `mailto:` und `tel:`.
- Interne Notizlinks müssen dem Format `memora://note/<id>` entsprechen.
- Database Access läuft über den Drizzle Query Builder statt über manuell zusammengesetzte SQL-Strings.
- Raw SQL nutzen wir nur für kontrollierte Spezialfälle, z. B. Indexdefinitionen oder rekursive Ordnerabfragen.

## Technische Umsetzung

Nachweise:

- Content Validation: `packages/api/src/modules/notes/content/schema.ts`
- Notiz Input Schemas: `packages/api/src/modules/notes/procedures/create-note.ts`, `packages/api/src/modules/notes/procedures/update-note.ts`
- Pagination Limits: `packages/api/src/modules/shared/pagination.ts`
- Share Token Validation: `packages/api/src/modules/shares/procedures/get-public-share.ts`
- Drizzle Schema und Queries: `packages/db/src/schema/**`, `packages/api/src/modules/**`

## Einschätzung

Injection-Risiken sind in den wichtigsten Pfaden sinnvoll reduziert. Die Kombination aus Zod, oRPC und Drizzle verhindert viele klassische Fehler. Besonders wichtig ist die Validation der BlockNote-Inhalte, weil Rich Text ein typischer Einstiegspunkt für XSS sein kann.

## Quellen / Nachweise

- `[Quelle OWASP Injection einfügen]`
- `[Screenshot oder kurzer manueller Testnachweis für ungültigen Link / ungültige Eingabe einfügen]`
