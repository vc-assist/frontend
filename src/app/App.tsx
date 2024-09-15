import { LoginPage } from "@/src/components/Auth"
import { useSignals } from "@preact/signals-react/runtime"
import { LogoutModal, Panel, Positioned, persistentSignal } from "@vcassist/ui"
import { motion } from "framer-motion"
import { Suspense, useState } from "react"
import type { IconType } from "react-icons"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import {
  ReturnHomeProvider,
  type UserContext,
  UserProvider,
} from "../providers"

const token = persistentSignal({
  key: "token",
  schema: z.string(),
  defaultValue: "",
})

window.addEventListener("storage", () => {
  const setValue = localStorage.getItem("token")
  if (!setValue || setValue === token.value) {
    return
  }
  token.value = setValue
})

const activeModule = persistentSignal({
  key: "active-module",
  schema: z.string().optional(),
  defaultValue: undefined,
})

export interface AppModule {
  name: string
  icon: IconType
  enabled: boolean
  render(props: { token: string }): React.ReactNode
}

export function App(props: {
  modules: AppModule[]
}) {
  useSignals()

  const [user, setUser] = useState<UserContext>()
  const active = props.modules.find((m) => m.name === activeModule.value)

  const logout = () => {
    setUser(undefined)
    token.value = ""
  }

  if (!user) {
    return (
      <LoginPage
        token={token.value}
        onLogin={(newToken, profile) => {
          token.value = newToken
          setUser({ profile, logout })
        }}
        onInvalidToken={() => {
          token.value = ""
        }}
      />
    )
  }

  if (props.modules.length === 1 || active) {
    const ModuleRender = active?.render ?? props.modules[0].render
    return (
      <UserProvider value={user}>
        <ReturnHomeProvider
          value={
            props.modules.length > 1
              ? () => {
                  activeModule.value = undefined
                }
              : undefined
          }
        >
          <Suspense>
            <ModuleRender token={token.value} />
          </Suspense>
        </ReturnHomeProvider>
      </UserProvider>
    )
  }

  return (
    <motion.div
      className="flex h-full"
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      exit={{ y: 10 }}
    >
      <div className="flex flex-col gap-3 p-6 m-auto">
        {props.modules
          .filter((m) => m.enabled)
          .map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => {
                activeModule.value = m.name
              }}
            >
              <Panel
                className={twMerge(
                  "flex gap-2 items-center text-dimmed",
                  "hover:text-primary transition-all active:translate-y-2",
                )}
              >
                <m.icon className="size-6" />
                <h2 className="text-md">{m.name}</h2>
              </Panel>
            </button>
          ))}
      </div>

      <Positioned x="right" y="top" padding="2rem">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <LogoutModal handleLogout={logout} />
        </motion.div>
      </Positioned>
    </motion.div>
  )
}
