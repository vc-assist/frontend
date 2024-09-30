import { config } from "@/src/singletons"
import { MoodleService } from "@backend.vcmoodle/api_connect"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { MdHome } from "react-icons/md"
import type { AppModule } from "../App"
import { Home } from "./routes/home"
import { useMoodleContext } from "./stores"

export const vcmoodleModule: AppModule = {
  async afterLogin(token) {
    const authHeader = `Bearer ${token}`
    const transport = createConnectTransport({
      baseUrl: config.endpoints.vcassist_backend,
      interceptors: [
        (next) => (req) => {
          req.header.append("Authorization", authHeader)
          return next(req)
        },
      ],
    })
    const client = createPromiseClient(MoodleService, transport)
    useMoodleContext.setState({ client })

    const res = await client.getAuthStatus({})

    return {
      credentialStates: [
        {
          name: "Moodle",
          provided: res?.provided ?? false,
          loginFlow: {
            type: "usernamePassword",
            async onSubmit(username: string, password: string) {
              await client.provideUsernamePassword({
                username,
                password,
              })
            },
          },
        },
      ],
      async afterCredentialsProvided() {
        const res = await client.getCourses({})
        useMoodleContext.setState({ data: res.courses })

        return {
          routes: {
            "/vcmoodle-lesson-plans": {
              title: "Lesson Plans",
              icon: MdHome,
              render() {
                const data = useMoodleContext((c) => c.data)
                return <Home courses={data} />
              },
            },
            // "/vcmoodle-browse": {
            //   title: "Browse Moodle",
            //   icon: MdTravelExplore,
            //   rootClassName: "p-0",
            //   render() {
            //     const data = useData()
            //     return <Browse courses={data} />
            //   },
            // },
          },
        }
      },
    }
  },
}
