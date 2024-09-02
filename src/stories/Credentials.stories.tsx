import { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import type { Meta, StoryObj } from "@storybook/react"
import { CredentialCarousel } from "../credentials"

const meta = {
  title: "VC Assist/Routes/Credential Carousel",
  component: CredentialCarousel,
  parameters: {
    layout: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CredentialCarousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onComplete() {},
    credentials: [
      new CredentialStatus({
        name: "PowerSchool",
        provided: false,
        loginFlow: {
          case: "oauth",
          value: {},
        },
      }),
      new CredentialStatus({
        name: "Moodle",
        provided: true,
        loginFlow: {
          case: "usernamePassword",
          value: {},
        },
      }),
    ],
  },
}
export const NoCreds: Story = {
  args: {
    credentials: [],
    onComplete() {},
  },
}
