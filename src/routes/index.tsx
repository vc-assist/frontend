import { MdCalculate, MdDashboard, MdPages, MdTimeline } from "react-icons/md"
import { useStudentData, useUser } from "../providers"
import { Router } from "./Router"
import Dashboard from "./dashboard"
import GradeCalculator from "./grade-calculator"
import GradeTrends from "./grade-trends"
import LessonPlans from "./lesson-plans"
import Profile from "./profile"

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
          render() {
            return <Dashboard data={data} />
          },
        },
        "/lesson-plans": {
          title: "Lesson Plans",
          icon: MdPages,
          render() {
            return <LessonPlans courses={data.courses} />
          },
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
          rootClassName: "h-full",
          render() {
            return <GradeTrends courses={data.courses} />
          },
        },
      }}
      defaultRoute="/dashboard"
      profileRoute={{
        rootClassName: "h-full",
        render() {
          return <Profile profile={profile} />
        },
      }}
    />
  )
}
