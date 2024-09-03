import type { GetCoursesResponse } from "@backend.vcmoodle/api_pb"

export function VCMoodleChapters() {}

export function VCMoodleSections() {}

export function VCMoodleCourses(props: {
  courses: GetCoursesResponse
}) {
  return <div className="flex gap-3" />
}
