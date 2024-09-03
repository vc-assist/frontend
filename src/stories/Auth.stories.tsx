import type { Meta, StoryObj } from "@storybook/react"
import { AuthState } from "@vcassist/ui"
import { LoginPage } from "../Auth"

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
    onInvalidToken() {},
  },
}
export const WaitingForCode: Story = {
  args: {
    state: AuthState.WAITING_FOR_CODE,
    onLogin() {},
    onInvalidToken() {},
  },
}
export const TokenProvided: Story = {
  args: {
    token: "token provided",
    onLogin() {},
    onInvalidToken() {},
  },
}
