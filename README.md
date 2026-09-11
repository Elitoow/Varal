# ARQUIVO INACABADO_

The Unfinished Archive is a local, evidence-first presentation of the frozen archaeological record.

## Commands

- `npm run dev` — local preview
- `npm run validate:canon` — validates counts, IDs, entity ownership and references
- `npm run build` — production build

## Data model

`canon/projects.json` contains exactly the 20 canonical projects from Archaeology 069. `canon/presentation_entities.json` contains those 20 plus historical/preserved entities such as Beyond Racing 3D. Only canonical entities count toward the project total. `canon/artifacts.json`, `timeline.json` and `relations.json` attach evidence without rewriting history.

## Safety and preservation

Historical projects are read-only sources. The site never executes original artifacts. `preservation/` contains a versioned source/build snapshot and SHA-256 manifest. Raw private, secret and unreviewed proprietary material is not staged.

## Extending

Read [HOW_TO_EXTEND_THE_ARCHIVE.md](HOW_TO_EXTEND_THE_ARCHIVE.md) before adding a project or artifact. A post-freeze note belongs in a new Archive Assembly record; it must not rewrite Archaeology 069.
