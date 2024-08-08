import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@vcassist/ui/styles.css"

import type { Preview } from "@storybook/react"
import { Foundation } from "@vcassist/ui"
import { UserProvider } from "../src/providers"

const FoundationProvider = Foundation({
  safeArea: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <UserProvider
        value={{
          profile: {
            name: "Test User",
            email: "test.user@email.com",
          },
          // biome-ignore lint/suspicious/noExplicitAny: this is okay
          studentDataClient: undefined as any,
          logout() { },
        }}
      >
        <FoundationProvider>
          <Story />
        </FoundationProvider>
      </UserProvider>
    ),
  ],
}

export default preview
