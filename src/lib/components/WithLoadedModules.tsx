import { useAllModulesQuery } from "../queries"
import { LoadingPage } from "./LoadingPage"

export default function WithLoadedModules({
  children,
}: { children: React.ReactNode }) {
  // I'm pretty sure this has to be in a separate function (cannot be inlined)
  // because of the way this hook depends on the dataModules atom
  // not being null
  const dataModules = useAllModulesQuery()!
  const allLoaded = dataModules.every((query) => query.isSuccess)
  if (!allLoaded) {
    return (
      <main className="h-screen">
        <LoadingPage />
      </main>
    )
  }
  return children
}
