## Project context (read first)

**[AI_CONTEXT.md](AI_CONTEXT.md)** is the single, always-current brief on this
app (BettingLog) — stack, structure, data model, auth, features, setup, and
gotchas. Read it before non-trivial work.

**Keep it updated:** whenever you change the app in a way it describes — a new
route/screen, table/column, dependency, auth/flow change, setup step, or a
fixed/known bug — update the matching section in `AI_CONTEXT.md`, bump its
"Last updated" date, and add a Changelog line. Do this in the same change.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
