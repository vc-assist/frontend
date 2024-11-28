import { useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import { DataModulesAtom } from "./stores"

export function usePowerSchoolQuery() {
  const dataModules = useAtomValue(DataModulesAtom)
  if (!dataModules?.powerschool) return null
  return useQuery({
    queryKey: ["powerschool"],
    queryFn: dataModules.powerschool.get,
  })
}
export function useMoodleQuery() {
  const dataModules = useAtomValue(DataModulesAtom)
  if (!dataModules?.moodle) return null
  return useQuery({
    queryKey: ["moodle", dataModules.moodle],
    queryFn: dataModules.moodle.get,
  })
}
