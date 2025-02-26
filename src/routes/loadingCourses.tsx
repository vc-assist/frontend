//Authored by Justin Shi and Shengzhi Hu CO 2025
//NOTE THIS FILE NEEDS TO BE MOVED TO THE UI SUBMODULE 

import { createTheme } from '@mantine/core'; //please check documentation if confused
import  RingLoader from './ringLoader';



export default function LoadingCourses(){
    return (
        <>
            <div className = "flex flex-col rounded-sm bg-gray-700">
                <div className = "p-1 font-mono text-wrap items-center">
                    Please wait while we retrieve your course data
                </div>
                <RingLoader/>
            </div>
        </>
    )
}
