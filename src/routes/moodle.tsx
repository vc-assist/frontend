import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: HwPage,
})

import { Panel } from "@/ui"
import { Moodle } from "@/src/lib/modules"
import { useEffect, useState } from "react"
import { LessonPlansResponse_Course } from "@/backend/api/vcassist/moodle/v1/api_pb"
import { CourseData } from "@/backend/api/vcassist/powerschool/v1/types_pb"
import { AnimatePresence, motion } from "framer-motion"
import { Container } from "@mantine/core"
import { ChapterDisplay } from "../lib/components/ChapterDisplay"
import { protoInt64 } from "@bufbuild/protobuf"
import z from "zod"
import { isThisSecond } from "date-fns"
 //this should have ur hw for the day and something on the side no clue
 //
 

 //type validation i dont even know if this is needed
// const LessonPlansResponse_Chapter = z.object({
//   courseId: z.string(), 
//   date: z.array(z.string()), 
//   content: z.string().optional(), 
//   url: z.string()
// })

// const LessonPlansResponseCourseSchema = z.object({
//   courseId: z.string(), 
//   courseName: z.string(),
//   courseTeacher: z.string(), 
//   courseUrl: z.string()
// })

// const CourseDataSchema = z.object({

// })

function ProtectedHwPage(){
  const [postLoginState, setPostLoginState] = useState(Moodle.isLoggedIn());
  if(!postLoginState){
    return (
      <Moodle.renderLogin onDone={
        () => {
          setPostLoginState(true);
        }
      }>
      </Moodle.renderLogin>
    )
  } else {
    return (
      <HwPage></HwPage>
    )
  }
}

// function isLessonPlansReponse_Course(course : any ): course is LessonPlansResponse_Course {
//   return (
//     course && 
//     typeof course.id === "string" &&
//     typeof course.name === "string" && 
//     typeof course


//   )
// }

// function isCourseData(course : any): course is CourseData {

// }

function HwPage() {
    const [courseData, setCourseData] = useState<LessonPlansResponse_Course[] | null>(null);
    const [errorState, setErrorState] = useState<any>(null);
    const [courseState, setCourseState] = useState<LessonPlansResponse_Course | null>(null)
    useEffect(() => {
        const moodleData = Moodle.getData().then((value) => {
          setCourseData(value.courses)
        }, 
        (error) => {
          setErrorState(error)
        }) //.then is needed because
    }, [])

    return (
      <div className = "flex gap-5">
        {courseState !== null ? <>
          <Panel>
            <AnimatePresence initial={false}>
                  <motion.div
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0 }}
                       style={} //add styling later 
                       key="box"
                   />
                {courseState.chapters.map((chapter) => {
                  return (
                    <ChapterDisplay
                      courseId={Number(courseState.id)}
                      chapter = {chapter}

                    > 

                    </ChapterDisplay>
                  )
                })}
            </AnimatePresence>
            <motion.button
                className ="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setCourseState(null)}
                whileTap={{ y: 1 }}
            >
                Close
            </motion.button>
        </Panel>
        </> : null}
        <div className = "grid grid-rows-2 grid-cols-4">
          {courseData?.map((course) => {
            return (
              <button onClick={() => {
                setCourseState(course);
              }}>
                <Panel className = "flex font-mono ">
                  <p className = "m-auto">{course.name}</p>    
                </Panel>
              </button>
            )
          })}
        </div>
      </div>
    )
}

