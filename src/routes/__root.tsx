import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const TanStackRouterDevtools = import.meta.env.PROD
		? () => null // Render nothing in production
		: React.lazy(() =>
				// Lazy load in development
				import("@tanstack/router-devtools").then((res) => ({
					default: res.TanStackRouterDevtools,
					// For Embedded Mode
					// default: res.TanStackRouterDevtoolsPanel
				})),
			);
	return (
		<>
			<Outlet />
			<React.Suspense>
				<TanStackRouterDevtools position="bottom-right" />
			</React.Suspense>
		</>
	);
}
