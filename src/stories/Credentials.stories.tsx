import { CredentialStatus } from "@/backend/proto/vcassist/services/studentdata/v1/api_pb"
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
        id: "powerschool",
        name: "PowerSchool",
        provided: false,
        loginFlow: {
          case: "oauth",
          value: {},
        },
      }),
      new CredentialStatus({
        id: "moodle",
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
