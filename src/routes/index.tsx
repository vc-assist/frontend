import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { DataModulesAtom } from "../lib/stores";
import { ErrorPage } from "@/ui";
import { LoadingPage } from "@/src/lib/LoadingPage";
// import type {
// 	Chapter,
// 	Course,
// 	Resource,
// 	Section,
// } from "@backend.vcmoodle/api_pb";
// import { ChapterDisplay } from "./components/ChapterDisplay";
// import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const dataModules = useAtomValue(DataModulesAtom);
	if (!dataModules?.moodle) return;
	const moodleQuery = useQuery({
		queryKey: ["moodle"],
		queryFn: dataModules.moodle.get,
	});
	if (moodleQuery.isLoading) return <LoadingPage />;
	if (moodleQuery.isError) return <ErrorPage />;
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const { courses } = moodleQuery.data!;
	return <>{JSON.stringify(courses)}</>;
}
