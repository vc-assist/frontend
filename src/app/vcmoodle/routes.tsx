import { Router } from "@/src/components/Router"
import Profile from "@/src/components/profile"
import { useUser } from "@/src/providers"
import { MdTravelExplore } from "react-icons/md"
import { VCMoodleCredentialsPage } from "./credentials"
import { useVCMoodleData } from "./providers"
import { VCMoodleCourses } from "./routes/courses"

export function Routes() {
  const { profile } = useUser()
  const data = useVCMoodleData()

  return (
    <Router
      profile={profile}
      routes={{
        "/moodle": {
          title: "Moodle",
          icon: MdTravelExplore,
          render() {
            return <VCMoodleCourses courses={data} />
          },
        },
      }}
      defaultRoute="/moodle"
      profileRoute={{
        rootClassName: "h-full",
        render() {
          return (
            <Profile profile={profile} credentials={VCMoodleCredentialsPage} />
          )
        },
      }}
    />
  )
}
