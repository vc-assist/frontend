import type { Meta, StoryObj } from "@storybook/react"
import { CredentialCarousel } from "../credentials"
import { CredentialStatus } from "@/backend/proto/vcassist/services/studentdata/v1/api_pb"

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
  },
}
