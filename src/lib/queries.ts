import { useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import { DataModulesAtom, UserAtom } from "./stores"

export function usePowerSchoolQuery() {
  const { token } = useAtomValue(UserAtom)
  const dataModules = useAtomValue(DataModulesAtom)
  // Should never happen
  if (!dataModules?.powerschool) return null
  return useQuery({
    queryKey: ["powerschool", token],
    queryFn: dataModules.powerschool.get,
  })
}
export function useMoodleQuery() {
  const { token } = useAtomValue(UserAtom)
  const dataModules = useAtomValue(DataModulesAtom)
  // Should never happen
  if (!dataModules?.moodle) return null
  return useQuery({
    queryKey: ["moodle", token],
    queryFn: dataModules.moodle.get,
  })
}
