
## Updating the site content

The Services, Working tools, Shipped work and Certifications sections of the home page come from `site-data.json`.

1. Edit `site-data.json`. Every entry needs a `source` note naming the record the fact came from. Never add a client, number or certification that is not in those records.
2. Run `node tools/build-site.mjs`. It rewrites the static HTML between `<!-- site-data:start -->` and `<!-- site-data:end -->` in `index.html`, so search engines and visitors without JavaScript see the same content. In the browser, `site-render.js` re-renders the same sections from `site-data.json` at load.
3. Run `npm test`. It fails if `index.html` is out of step with `site-data.json`, if an entry has no source, or if banned names or dashes appear.
4. Commit `site-data.json` and `index.html` together.

GitHub Pages serves the files as they are. No build step runs on publish.

**Rule for agents:** when a job on The Bridge's Morning Brief finishes and adds a skill, a shipped project or a certification, update `site-data.json`, run `node tools/build-site.mjs` and `npm test`, and commit on a branch. Publishing to `main` is Cartrel's call.
