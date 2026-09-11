# How to extend the archive

Use a stable `project.id` only for a project listed by the frozen canon. Use a `presentation entity` for a subproject, historical name, component or significant closeout that must remain visible without becoming a canonical project. Ownerless entities may use `canonical_project_id: null`.

Artifacts should state whether they are original, metadata-only, an archaeology record, recreated, lost or unresolved. Add a timeline event only with its evidence level and an owner that resolves to a canonical project or presentation entity. Relations must name their type and source.

Never publish private memory, raw conversations, credentials, absolute local paths or unreviewed third-party payloads. Never turn source into runtime proof, a build into a tested build, or a historical document into a new archaeological fact. Run `npm run validate:canon` and `npm run build` before making a new preservation snapshot.
