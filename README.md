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

- `git submodule foreach --recursive "git pull origin main"` - updates all submodules

## Implementing the Native API

The frontend relies on some native APIs to work. This repository does not contain any native wrappers itself, those are found in other repositories like the following:

- [vc-assist/capacitor](https://github.com/vc-assist/capacitor)

The native API should be exposed by an ES module called `/native_api.js` on the local origin, the default export of this module should fulfill the interface specified in [lib/native/index.ts](./lib/native/index.ts).

