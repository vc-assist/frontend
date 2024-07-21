import { MdCalculate, MdDashboard, MdPages, MdTimeline } from "react-icons/md"
import { twMerge } from "tailwind-merge"
import { useStudentData, useUser } from "../providers"
import { Router } from "./Router"
import Dashboard from "./dashboard"
import GradeCalculator from "./grade-calculator"
import GradeTrends from "./grade-trends"
import Profile from "./profile"
import Courses from "./courses"

export function Routes() {
  const { profile } = useUser()
  const data = useStudentData()

  return (
    <Router
      profile={profile}
      routes={{
        "/dashboard": {
          title: "Dashboard",
          icon: MdDashboard,
          rootClassName: "grid gap-6 lg:grid-cols-2",
          render() {
            return <Dashboard data={data} />
          },
        },
        "/courses": {
          title: "Courses",
          icon: MdPages,
          render() {
            return <Courses courses={data.courses} />
          }

        },
        "/grade-calculator": {
          title: "Grade Calculator",
          icon: MdCalculate,
          render() {
            return <GradeCalculator courses={data.courses} />
          },
        },
        "/grade-trends": {
          title: "Grade Trends",
          icon: MdTimeline,
          render() {
            return <GradeTrends courses={data.courses} />
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
          return <Profile profile={profile} />
        },
      }}
    />
  )
}
