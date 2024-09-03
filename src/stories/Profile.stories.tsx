import type { Meta, StoryObj } from "@storybook/react"
import { SISCredentialsPage } from "../app/credentials/sis"
import Profile from "../components/profile{"

const meta = {
  title: "VC Assist/Routes/Profile",
  component: Profile,
  parameters: {
    layout: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Profile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    credentials: SISCredentialsPage,
    profile: {
      email: "test.user@email.com",
      name: "Test User",
    },
  },
}
