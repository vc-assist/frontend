import type { UserProfile } from "@vcassist/ui"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TokenContext = {
  token: string
  setToken(value: string): void
}
export const useToken = create<TokenContext>()(
  persist(
    (set) => ({
      token: "",
      setToken(value: string) {
        set({ token: value })
      },
    }),
    {
      name: "token",
    },
  ),
)
window.addEventListener("storage", () => {
  const setValue = localStorage.getItem("token")
  if (!setValue || setValue === useToken.getState().token) {
    return
  }
  useToken.getState().setToken(setValue)
})

export type UserContext = {
  profile?: UserProfile
  setProfile(profile: UserProfile): void
  logout(): void
}
export const useUser = create<UserContext>((set) => ({
  profile: undefined,
  setProfile(profile) {
    set({ profile })
  },
  logout() {
    set({ profile: undefined })
    useToken.setState({
      token: "",
    })
  },
}))
