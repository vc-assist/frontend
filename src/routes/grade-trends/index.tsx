import { createFileRoute } from "@tanstack/react-router";
import { createDefaultMeter, ErrorPage } from "@vcassist/ui";

import type { CourseData } from "@backend.sis/data_pb";
import GradeTrendsComponent from "./-GradeTrends";
import { useEffect } from "react";
import { usePowerSchoolQuery } from "@/src/lib/queries";
import { LoadingPage } from "@/src/lib/components/LoadingPage";

export const Route = createFileRoute("/grade-trends/")({
	component: GradeTrends,
});
const meter = createDefaultMeter("routes.grades");
const viewPage = meter.createCounter("view");
function GradeTrends() {
	const powerschoolQuery = usePowerSchoolQuery()!;
	useEffect(() => {
		viewPage.add(1);
	}, []);
	if (powerschoolQuery.isLoading) return <LoadingPage />;
	if (powerschoolQuery.isError) return <ErrorPage />;

	const { courses } = powerschoolQuery.data!;

	return <GradeTrendsComponent courses={courses} />;
}
