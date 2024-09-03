import { useUser } from "@/src/providers"
import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import {
  GetAuthStatusRequest,
  ProvideUsernamePasswordRequest,
} from "@backend.vcmoodle/api_pb"
import { IconButton, Positioned } from "@vcassist/ui"
import { CredentialFlow, type CredentialState } from "@vcassist/ui"
import { useRef } from "react"
import { MdArrowBack } from "react-icons/md"
import { useVCMoodleClient } from "./providers"

export function VCMoodleCredentialsPage(props: {
  onComplete: (credentials: CredentialStatus[]) => void
}) {
  const { profile } = useUser()
  const vcmoodleClient = useVCMoodleClient()
  const statuses = useRef<CredentialStatus[]>([])

  return (
    <div className="flex w-full h-full">
      <CredentialFlow
        queryKey={["getCredentials", "vcmoodle", profile.email]}
        profile={profile}
        getCredentialStatuses={async (): Promise<CredentialState[]> => {
          const res = await vcmoodleClient.getAuthStatus(
            new GetAuthStatusRequest(),
          )
          return [
            {
              name: "Moodle",
              provided: res.provided,
              loginFlow: {
                type: "usernamePassword",
                async onSubmit(username: string, password: string) {
                  await vcmoodleClient.provideUsernamePassword(
                    new ProvideUsernamePasswordRequest({
                      username,
                      password,
                    }),
                  )
                },
              },
            },
          ]
        }}
        onComplete={() => props.onComplete(statuses.current)}
      />
      <Positioned x="left" y="top" padding="2rem">
        <IconButton
          icon={MdArrowBack}
          label="Back"
          color="dark"
          horizontal
          onClick={open}
        />
      </Positioned>
    </div>
  )
}
