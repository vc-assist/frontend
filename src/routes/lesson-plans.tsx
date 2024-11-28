import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { DataModulesAtom } from "../lib/stores";
import { ErrorPage } from "@/ui";
import { LoadingPage } from "@/src/lib/LoadingPage";
import type {
	Chapter,
	Course,
	Resource,
	Section,
} from "@backend.vcmoodle/api_pb";
import { motion } from "framer-motion";
import { ChapterDisplay } from "@/src/lib/ChapterDisplay";

export const Route = createFileRoute("/lesson-plans")({
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
	const { courses } = moodleQuery.data!;
	console.log("moodleQuery", moodleQuery, courses);

	const traces: {
		course: Course;
		section: Section;
		resource: Resource;
		chapter: Chapter;
	}[] = [];

	for (const course of courses) {
		for (const section of course.sections) {
			for (const resource of section.resources) {
				for (const chapter of resource.chapters) {
					if (chapter.homepageContent !== "") {
						traces.push({ course, section, resource, chapter });
					}
				}
			}
		}
	}

	return (
		<div className="flex flex-wrap gap-5 max-w-full">
			{traces.map((trace, i) => {
				return (
					<motion.div
						key={trace.course.id}
						className="max-w-full"
						transition={{ delay: 0.05 * (i + 1) }}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
					>
						<ChapterDisplay
							courseId={Number(trace.course.id)}
							chapter={trace.chapter}
							breadcrumb={{
								course: trace.course,
								section: trace.section,
								resource: trace.resource,
							}}
							breadcrumbLinkToUrl
						/>
					</motion.div>
				);
			})}

			{/* <HighlightSearch /> */}
		</div>
	);
}
