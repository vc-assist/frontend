import type { StudentData } from "@backend.studentdata/student_data_pb"
import type { UserProfile } from "@vcassist/ui"
import { MdCalculate, MdDashboard, MdTimeline } from "react-icons/md"
import { twMerge } from "tailwind-merge"
import { Router } from "./Router"
import Dashboard from "./dashboard"
import GradeCalculator from "./grade-calculator"
import GradeTrends from "./grade-trends"
import Profile from "./profile"

export function Routes(props: {
  data: StudentData
  profile: UserProfile
}) {
  return (
    <Router
      profile={props.profile}
      routes={{
        "/dashboard": {
          title: "Dashboard",
          icon: MdDashboard,
          rootClassName: "grid gap-6 lg:grid-cols-2",
          render() {
            return <Dashboard data={props.data} />
          },
        },
        "/grade-calculator": {
          title: "Grade Calculator",
          icon: MdCalculate,
          render() {
            return <GradeCalculator courses={props.data.courses} />
          },
        },
        "/grade-trends": {
          title: "Grade Trends",
          icon: MdTimeline,
          render() {
            return <GradeTrends courses={props.data.courses} />
          },
        },
      }}
      defaultRoute="/dashboard"
      profileRoute={{
        rootClassName: twMerge(
          "h-full grid grid-cols-1 grid-rows-[min-content_min-content_1fr]",
          "lg:grid-cols-5 xl:grid-cols-3 lg:grid-rows-[1fr_2fr] gap-6",
        ),
        render() {
          return <Profile profile={props.profile} />
        },
      }}
    />
  )
}
