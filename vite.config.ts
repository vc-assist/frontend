import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { join } from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	return {
		server: {
			port: 5173,
		},
		resolve: {
			alias: {
				"@": __dirname,
				"@backend.auth": join(
					__dirname,
					"backend",
					"proto",
					"vcassist",
					"services",
					"auth",
					"v1",
				),
				"@backend.sis": join(
					__dirname,
					"backend",
					"proto",
					"vcassist",
					"services",
					"sis",
					"v1",
				),
				"@backend.vcmoodle": join(
					__dirname,
					"backend",
					"proto",
					"vcassist",
					"services",
					"vcmoodle",
					"v1",
				),
			},
		},
		plugins: [
			mode === "development"
				? {
						name: "resolve-native-api",
						resolveId(id) {
							if (id === "native_api.js") {
								return "\0" + "virtual:native_api";
							}
						},
						load(id) {
							if (id === "\0" + "virtual:native_api") {
								return "undefined";
							}
						},
					}
				: undefined,
			TanStackRouterVite({}),
			react(),
		],
	};
});
