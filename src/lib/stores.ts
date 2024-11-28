import type { UserProfile } from "@vcassist/ui"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import type { Modules } from "./modules"
export type LoggedInUser = {
  token: string
  profile: UserProfile
}
export type User = { token: null; profile: null } | LoggedInUser
export const UserAtom = atomWithStorage<User>("user", {
  token: null,
  profile: null,
})

export const DataModulesAtom = atom<Modules | null>(null)
export const settings = {
  dashboard: {
    hideGPA: atomWithStorage("settings.dashboard-hide-gpa", false),
    hideGrades: atomWithStorage("settings.dashboard-hide-grades", false),
    disableGradeVisualizers: atomWithStorage(
      "settings.dashboard-disable-grade-visualizers",
      false,
    ),
  },
}
export const DataModulesLoaded = atom((get) => {
  const dataModules = get(DataModulesAtom)
  if (!dataModules) return false
  // No idea why TypeScript thinks it could be undefined:
  // If the key doesn't exist, the value won't be iterated on either
  return Object.values(dataModules).every((x) => x?.provided)
})
