import { useQueries } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import { DataModulesAtom, UserAtom } from "./stores"
// The reason why we load all of them at once is because we want to show a loading page.
// Shengzhi prefers this UX over showing a loading page for each module.
export function useAllModulesQuery() {
  const { token } = useAtomValue(UserAtom)
  const dataModules = useAtomValue(DataModulesAtom)
  // Should never happen
  if (!dataModules?.powerschool) return null
  if (!dataModules?.moodle) return null
  return useQueries({
    queries: [
      {
        queryKey: ["powerschool", token],
        queryFn: dataModules.powerschool.get,
      },
      {
        queryKey: ["moodle", token],
        queryFn: dataModules.moodle.get,
      },
    ],
  })
}
export function usePowerSchoolQuery() {
  return useAllModulesQuery()![0]
}
export function useMoodleQuery() {
  return useAllModulesQuery()![1]
}
