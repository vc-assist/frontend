export type Config = {
	endpoints: {
		traces: {
			httpEndpoint: string;
		};
		metrics: {
			httpEndpoint: string;
		};
		vcassist_backend: string;
	};
	enabled_modules: {
		sis: boolean;
		vcmoodle: boolean;
	};
};
export default {
	environment: "dev",
	endpoints: {
		traces: {
			httpEndpoint: "http://127.0.0.1:4318/v1/traces",
		},
		metrics: {
			httpEndpoint: "http://127.0.0.1:4320/v1/metrics",
		},
		vcassist_backend: "http://127.0.0.1:8000",
	},
	enabled_modules: {
		sis: true,
		vcmoodle: true,
	},
} as Config;
