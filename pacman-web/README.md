# Pac-Man Web Prototype (React + Phaser)

This package contains a lightweight web front-end for the Pac-Man assignment, rebuilt with [React](https://react.dev/), [Vite](https://vite.dev/), and [Phaser](https://phaser.io/). It renders the existing map/configuration assets and lays the groundwork for a full gameplay port.

## Getting Started

```bash
npm install          # install dependencies (already run once)
npm run dev          # start the dev server with HMR
npm run build        # produce the static bundle under dist/
npm run preview      # preview the production build locally
npm run deploy       # optional: publish dist/ to the gh-pages branch
```

> The build output is a static site (`dist/`) that can be hosted on GitHub Pages, Netlify, Vercel, etc.  
> The `deploy` script requires push access to your repo; it uses `gh-pages` to publish.

## Project Structure

- `src/game/` – Phaser scene, configuration helpers, and map parser
- `src/assets/` – ported sprites, fonts, and JSON configuration from the original JavaFX project
- `src/components/PacmanGame.tsx` – React wrapper that mounts the Phaser game and surfaces HUD data
- `src/components/TouchControls.tsx` – on-screen d-pad for touch devices
- `src/game/GameScene.ts` – full gameplay loop (movement, pellets, frightened mode, ghost AI, level state machine)

## Next Steps

- Add pause/resume, audio cues, and richer animations for deaths & frightened mode
- Expand automated tests (e.g., ghost target logic, frightened scoring) using Vitest
- Wire a CI workflow (GitHub Actions, Netlify, etc.) to run `npm run build` and publish automatically

> **Note**: Phaser is a large dependency, so production builds emit a ~1.7 MB bundle. Code-splitting or lazy-loading can reduce this once gameplay modules are fleshed out.
