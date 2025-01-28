import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/carousel/styles.css"
import "@vcassist/ui/styles.css"
import "./main.css"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { Foundation} from "@vcassist/ui"
import {Moodle, Powerschool } from "./lib/modules"
import React, { useState } from "react"
import {config} from "./singletons"

const FoundationProvider = Foundation({
  telemetry: {
    serviceName: "frontend",
    otlp: config.endpoints,
  },
})
// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {},
})

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}


function App() {
    const [fullMoodle, setFullMoodle] = useState<boolean>(Moodle.isLoggedIn());
    const [fullPowerschool, setFullPowerschool] = useState<boolean>(Powerschool.isLoggedIn());

    return (
      <React.StrictMode>
        <FoundationProvider>
          <div>
            <Moodle.render onDone = {() => setFullMoodle(true)}/>
            <Powerschool.render onDone = {() => setFullPowerschool(true)}/>
          </div>
        </FoundationProvider>
      </React.StrictMode>
    )

    
  
  // Don't use TanStack router's authenticated routes or whatever what the fuck 
  // to handle auth, I already tried that.
  // This code which bypasses the auth/router context code from TanStack Router
  // is SIGNIFICANTLY simpler and easier to understand.
  // - ThatXliner
  // if (!user?.token) {
  //   return (
  //     <React.StrictMode>
  //       <FoundationProvider>
  //         <QueryClientProvider client={queryClient}>
  //           <LoginComponent />
  //         </QueryClientProvider>
  //       </FoundationProvider>
  //     </React.StrictMode>
  //   )
  // }
  // While yes I could've made the `index.tsx` just have whatever
  // is in the ModuleComponent and then return when authenticated a <Navigate>
  // to say `_app/dashboard` (_app means it won't be part of
  // the actual URL and is only separated into a folder for
  // developer's sake), I decided to keep it like this because
  // 1. this is less code
  // 2. I had no idea
  // https://tanstack.com/router/latest/docs/framework/react/guide/navigation#navigate-component
  // existed when I first wrote this code.
  // 3. There is currently a useQuery call in the ModuleComponent and
  // I don't know how to combine it in the same file where the
  // QueryClientProvider is. I'm not even sure if it's possible.

  // Feel free to experiment though.
  // - ThatXliner
  // if (!dataModulesHaveCredentials) {
  //   return (
  //     <React.StrictMode>
  //       <FoundationProvider>
  //         <QueryClientProvider client={queryClient}>
  //           <ModuleComponent user={user} />
  //         </QueryClientProvider>
  //       </FoundationProvider>
  //     </React.StrictMode>
  //   )
  // }

//   return (
//     <React.StrictMode>
//       <FoundationProvider>
//         <App modules={modules} />
//       </FoundationProvider>
//     </QueryClientProvider>
//   </StrictMode>,
// )
}