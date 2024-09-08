import { Router } from "@/src/components/Router"
import Profile from "@/src/components/profile"
import { useUser } from "@/src/providers"
import { MdHome, MdTravelExplore } from "react-icons/md"
import { VCMoodleCredentialsPage } from "./credentials"
import { useVCMoodleData } from "./providers"
import { Courses as Browse } from "./routes/browse"
import { Home } from "./routes/home"

export function Routes() {
  const { profile } = useUser()
  const data = useVCMoodleData()

  return (
    <Router
      profile={profile}
      routes={{
        "/home": {
          title: "Home",
          icon: MdHome,
          render() {
            return <Home courses={data} />
          },
        },
        "/browse": {
          title: "Browse",
          icon: MdTravelExplore,
          render() {
            return <Browse courses={data} />
          },
        },
      }}
      defaultRoute="/home"
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
