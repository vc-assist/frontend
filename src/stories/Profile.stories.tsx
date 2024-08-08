import type { Meta, StoryObj } from "@storybook/react"
import Profile from "../routes/profile"

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
    profile: {
      email: "test.user@email.com",
      name: "Test User",
    },
  },
}
