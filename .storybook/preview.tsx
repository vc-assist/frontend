import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@vcassist/ui/styles.css"

import type { Preview } from "@storybook/react"
import { Foundation } from "@vcassist/ui"
import {
  UserProvider,
  StudentDataRefetchProvider,
  CredentialsProvider,
} from "../src/providers"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const FoundationProvider = Foundation({
  safeArea: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})

const queryClient = new QueryClient()

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
      <QueryClientProvider client={queryClient}>
        <FoundationProvider>
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
            <CredentialsProvider value={[]}>
              <StudentDataRefetchProvider value={async () => { }}>
                <Story />
              </StudentDataRefetchProvider>
            </CredentialsProvider>
          </UserProvider>
        </FoundationProvider>
      </QueryClientProvider>
    ),
  ],
}

export default preview
