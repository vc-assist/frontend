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

- `git submodule foreach "git pull"` - updates all submodules

