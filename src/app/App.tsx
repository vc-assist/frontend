import { LoginPage } from "@/src/components/Auth"
import { useSignals } from "@preact/signals-react/runtime"
import { LogoutModal, Panel, Positioned, persistentSignal } from "@vcassist/ui"
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
  const [selectedModule, setSelectedModule] = useState<AppModule>()

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

  if (props.modules.length === 1 || selectedModule) {
    const ModuleRender = selectedModule?.render ?? props.modules[0].render
    return (
      <UserProvider value={user}>
        <ReturnHomeProvider
          value={
            props.modules.length > 1
              ? () => {
                  setSelectedModule(undefined)
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
    <div className="flex h-full">
      <div className="flex flex-col gap-3 p-6 m-auto">
        {props.modules
          .filter((m) => m.enabled)
          .map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => {
                setSelectedModule(m)
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
        <LogoutModal handleLogout={logout} />
      </Positioned>
    </div>
  )
}
