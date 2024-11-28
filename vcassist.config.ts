import type { FileRoutesByPath } from "@tanstack/react-router";
import type { IconType } from "react-icons";
import {
	MdCalculate,
	MdDashboard,
	MdHome,
	MdPerson,
	MdTimeline,
} from "react-icons/md";

export type Config = {
	// environment: "dev" | "prod";
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
type Route = { title: string; icon: IconType; noNavbar?: boolean };
export default {
	// environment: "dev",
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
} satisfies Config;

export const routes: Partial<Record<keyof FileRoutesByPath, Route>> = {
	"/": { title: "Dashboard", icon: MdDashboard },
	"/grade-calculator": {
		title: "Grade Calculator",
		icon: MdCalculate,
	},
	"/grade-trends/": {
		title: "Grade Trends",
		icon: MdTimeline,
		// rootClassName: "h-full",
	},
	"/lesson-plans": {
		title: "Lesson Plans",
		icon: MdHome,
	},
	// "/profile": {
	// 	title: "Profile",
	// 	icon: MdPerson,
	// },
	// "/browse/"
	// "/dashboard": {
	// 	title: "Dashboard",
	// 	icon: MdDashboard,
	// },
};
