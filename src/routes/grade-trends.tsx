import { createFileRoute } from "@tanstack/react-router"
import { createDefaultMeter, Panel } from "@vcassist/ui"
import { LoadingPage } from "@/src/lib/components/LoadingPage"
import { useEffect, useState } from "react"
import GradeTrendsComponent from "../lib/GradeTrends"
import { Powerschool } from "../lib/modules"
import { createPromiseClient } from "@connectrpc/connect"
import { PowerschoolService } from "@/backend/api/vcassist/powerschool/v1/api_connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import Config from "@/vcassist.config" 
import { DataRequest, DataResponse } from "@/backend/api/vcassist/powerschool/v1/api_pb"
import { RiBlazeFill } from "react-icons/ri"



export const Route = createFileRoute("/grade-trends")({
  component: GradeTrends,
  staticData: {
    className: "h-full",
  },
  // context: { rootClassName: "arsta" },
})
declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    className?: string
  }
}

const baz = new Promise<number>((res, rej) =>{
  setTimeout(() => {
    res(Math.random()) 
  }, 1000)
})

baz.then((hi : number) =>{
  
})

const meter = createDefaultMeter("routes.grades")
const viewPage = meter.createCounter("view")
const powerschoolHelper = createPromiseClient(PowerschoolService, createConnectTransport({baseUrl: Config.endpoints.vcassist_backend}))

function GradeTrends() {
  const [loginState, setLoginState] = useState<boolean>(Powerschool.isLoggedIn())
  const [courses, setCourses] = useState<DataResponse>(); 
  const [error, setError] = useState<Error>();
  
  useEffect(() => {
    const data : Promise<DataResponse> = powerschoolHelper.data({})
    const courses = data.then((response : DataResponse) => {
     setCourses(response);
    }, (error : Error) => {
      setError(error)
    })
  }, [])   

  if(error) {
    return (
      <>
        <Panel>
          <div className = "text-red-700 font-serif"> 
            {error.message}
          </div>
        </Panel>
      </>
    )
  }
  
  if(!loginState){
    return (
      <>
        <Powerschool.renderLogin onDone = {() => {
          setLoginState(true)
        }}>

        </Powerschool.renderLogin>
      </>
    )
  } else {
    return <GradeTrendsComponent courses={courses}></GradeTrendsComponent>
  }

}
