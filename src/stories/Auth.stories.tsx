import type { Meta, StoryObj } from "@storybook/react"
import { LoginPage } from "../auth"

const meta = {
  title: "VC Assist/Routes/Auth",
  component: LoginPage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const NoToken: Story = {
  args: {
    onLogin() {},
  },
}
export const TokenProvided: Story = {
  args: {
    token: "token provided",
    onLogin() {},
  },
}
