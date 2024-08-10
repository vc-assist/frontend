import type { Meta, StoryObj } from "@storybook/react"
import { LoginPage, State } from "../auth"

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
    state: State.WAITING_FOR_CODE,
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
