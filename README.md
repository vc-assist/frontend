# Frontend

> The frontend for VC Assist.

## Project structure

- `ui/` - a submodule containing the ui component library
- `backend/` - a submodule containing the backend repository (because the services' gRPC types are stored there)
- `lib/` - general shared internal libraries
- `src/` - main code
   - `app/` - WIP
   - `components/` - shared internal components
   - `singletons.ts` - singletons in general
   - `providers.ts` - zustand stores
   - `main.tsx` - the ui entrypoint, sets up providers, `@vcassist/ui` and other foundational things

## Commands

- `git submodule update --remote` - updates all submodules
- `pnpm dev` - starts a hot-reload dev server using vite.
- `pnpm storybook` - runs storybook.
- `pnpm lint` - lints the entire frontend using biome and tsc.
- `pnpm build` - transpiles & bundles the frontend into the `dist/` directory.
- `pnpm preview` - starts a dev server using the result of a `pnpm run build` (useful if there are differences between build and dev because of vite).
- `pnpm syncpack fix-mismatches` - makes all dependencies an exact version, you should run `pnpm install` afterwards

## Implementing the Native API

The frontend relies on some native APIs to work. This repository does not contain any native wrappers itself, those are found in other repositories like the following:

- [vc-assist/mobile](https://github.com/vc-assist/mobile)
- [vc-assist/desktop](https://github.com/vc-assist/desktop)

There are 2 ways to expose the native API to the frontend at runtime, the different ways will be tried in the order they are defined.

1. An ES module called `native_api.js` present in the same directory as the `index<...>.js` output of the build, this will be dynamically imported at runtime, the default export of this module should be an **object (NOT A CLASS, if you have a class MAKE SURE to INSTANTIATE it)** that fulfills the interface specified in [lib/native/index.ts](./lib/native/index.ts).
2. A global variable by the name `nativeAPI` should be an object that fulfills the `NativeAPI` interface, this will be dynamically accessed at runtime.
