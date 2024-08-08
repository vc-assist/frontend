import type { Meta, StoryObj } from "@storybook/react"
import { LoadingPage } from "../studentdata/LoadingPage"

const meta = {
  title: "VC Assist/Routes/LoadingPage",
  component: LoadingPage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoadingPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
