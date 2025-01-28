# A NOTE TO ALL FUTURE VCASSIST DEVELOPERS
>PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE NO NO NO DO NOT DO THIS DO NOT DO THIS
>DO NOT USE THE LATEST TECH/REACT TRENDS WHEN DEVVING ON THIS CODEBASE, PLEASE CONSIDER OTHER DEVELOPERS ESPECIALLY THOSE WHO WERE JUST EXPOSED TO THE REACT FRAMEWORK
>PLEASE DO NOT CREATE TECHNICAL DEBT FOR SLIGHT BETTER AUTOCOMPLETE AND AN EGO BOOST, DO NOT DO THIS DO NOT DO THIS DO NOT DO THIS DO NOT DO NOT
# Frontend

> The frontend for VC Assist.
>
## Project structure

- `ui/` - a Git submodule containing the ui component library
- `backend/` - a submodule containing the backend repository (because the services' gRPC types are stored there)
- `src/` - main code
  - `lib/` - general shared internal logic libraries
    - `lib/components` - shouldn't really exist as all UI code should be in the ui component library repo
  - `routes/` - TanStack Router routes
  - `main.tsx` - the main app entrance called by `index.html`
  - `routeTree.gen.ts` - generated routes file by TanStack router. If something gliches out and this file isn't being regenerated, you can regenerate it using `pnpm generate-routes`

## Commands

- `git submodule update --remote` - updates all submodules
- `pnpm dev` - starts a hot-reload dev server using Vite.
<!-- - `pnpm storybook` - runs storybook. -->
- `pnpm lint` - lints the entire frontend using biome and tsc.
- `pnpm build` - transpiles & bundles the frontend into the `dist/` directory.

To develop on the code (and get into a productive REPL or edit->preview cycle), you run `mprocs -c ./mprocs/dev_vcs.yaml` in the [quick-start](https://github.com/vc-assist/quick-start) repo (after you had set up the [backend](https://github.com/vc-assist/backend) as well).

## Implementing the Native API

The frontend relies on some native APIs to work. This repository does not contain any native wrappers itself, those are found in other repositories like the following:

- [vc-assist/mobile](https://github.com/vc-assist/mobile)
- [vc-assist/desktop](https://github.com/vc-assist/desktop)

There are 2 ways to expose the native API to the frontend at runtime, the different ways will be tried in the order they are defined.

1. An ES module called `native_api.js` present in the same directory as the `index<...>.js` output of the build, this will be dynamically imported at runtime, the default export of this module should be an **object (NOT A CLASS, if you have a class MAKE SURE to INSTANTIATE it)** that fulfills the interface specified in [lib/native/index.ts](./lib/native/index.ts).
2. A global variable by the name `nativeAPI` should be an object that fulfills the `NativeAPI` interface, this will be dynamically accessed at runtime.
