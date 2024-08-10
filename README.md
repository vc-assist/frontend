# Frontend

> The frontend for VC Assist.

## Project structure

- `backend/` - a submodule containing the backend repository (because the services' gRPC types are stored there)
- `lib/` - shared packages
- `src/` - source code
   - `routes/` - ui code that does student data viewing
   - `auth/` - ui code that handles logging in
   - `credentials/` - ui code that handles providing credentials
   - `studentdata/` - ui code that handles fetching student data
   - `singletons.ts` - singletons: `config`, `native`
   - `providers.ts` - react context
   - `App.tsx` - the component that handles the main setup logic (login, credentials, then data fetch)
   - `main.tsx` - the ui entrypoint

## Commands

- `git submodule update --remote` - updates all submodules

## Implementing the Native API

The frontend relies on some native APIs to work. This repository does not contain any native wrappers itself, those are found in other repositories like the following:

- [vc-assist/capacitor](https://github.com/vc-assist/capacitor)

There are 2 ways to expose the native API to the frontend at runtime, the different ways will be tried in the order they are defined.

1. An ES module called `native_api.js` present in the same directory as the `index<...>.js` output of the build, this will be dynamically imported at runtime, the default export of this module should be an **object (NOT A CLASS, if you have a class MAKE SURE to INSTANTIATE it)** that fulfills the interface specified in [lib/native/index.ts](./lib/native/index.ts).
2. A global variable by the name `nativeAPI` should be an object that fulfills the `NativeAPI` interface, this will be dynamically accessed at runtime.
