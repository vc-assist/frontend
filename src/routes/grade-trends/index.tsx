import GradeTrendsComponent from "./GradeTrends";
import { useEffect } from "react";
import { createDefaultMeter } from "@vcassist/ui";
import { Course } from "@backend.studentdata/student_data_pb";

const meter = createDefaultMeter("routes.grades");
const viewPage = meter.createCounter("view");

export default function GradeTrends({ courses }: { courses: Course[] }) {
  useEffect(() => {
    viewPage.add(1);
  }, []);
  return (
    <GradeTrendsComponent
      courses={courses}
      className="h-full"
    />
  );
}
