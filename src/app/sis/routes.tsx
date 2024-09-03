import { Router } from "@/src/components/Router"
import Profile from "@/src/components/profile"
import { useUser } from "@/src/providers"
import { MdCalculate, MdDashboard, MdTimeline } from "react-icons/md"
import { SISCredentialsPage } from "./credentials"
import { useSISData } from "./providers"
import Dashboard from "./routes/dashboard"
import GradeCalculator from "./routes/grade-calculator"
import GradeTrends from "./routes/grade-trends"

export function Routes() {
  const { profile } = useUser()
  const data = useSISData()

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
          return <Profile profile={profile} credentials={SISCredentialsPage} />
        },
      }}
    />
  )
}
