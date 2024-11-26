import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "@vcassist/ui/styles.css";
import "./main.css";
import { DataModulesLoaded, UserAtom } from "./lib/stores";
import { useAtomValue } from "jotai";
import { AuthFlow, Foundation } from "@vcassist/ui";
import vcassistConfig from "@/vcassist.config";
import LoginComponent from "./lib/LoginComponent";
import { ModuleComponent } from "./lib/ModuleComponent";

// Set up a Router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	context: {},
});

// Register things for typesafety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient();
const FoundationProvider = Foundation({
	telemetry: {
		serviceName: "frontend",
		otlp: vcassistConfig.endpoints,
	},
});
function App() {
	const user = useAtomValue(UserAtom);
	const dataModulesLoaded = useAtomValue(DataModulesLoaded);
	// Don't use TanStack router's authenticated routes or whatever
	// to handle auth, I already tried that.
	// This code which bypasses the auth code from TanStack Router
	// is SIGNIFICANTLY simpler and easier to understand.
	// - ThatXliner
	if (!user?.token) {
		return (
			<React.StrictMode>
				<FoundationProvider>
					<QueryClientProvider client={queryClient}>
						<LoginComponent />
					</QueryClientProvider>
				</FoundationProvider>
			</React.StrictMode>
		);
	}
	if (!dataModulesLoaded) {
		return (
			<React.StrictMode>
				<FoundationProvider>
					<QueryClientProvider client={queryClient}>
						<ModuleComponent user={user} />
					</QueryClientProvider>
				</FoundationProvider>
			</React.StrictMode>
		);
	}
	return (
		<React.StrictMode>
			<FoundationProvider>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} context={{ user }} />
				</QueryClientProvider>
			</FoundationProvider>
		</React.StrictMode>
	);
}

// Mounting

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App />);
}
