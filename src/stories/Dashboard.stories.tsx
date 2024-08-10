import {
  Course,
  CourseMeeting,
  StudentData,
} from "@backend.studentdata/student_data_pb"
import type { Meta, StoryObj } from "@storybook/react"
import Dashboard from "../routes/dashboard"
import { unixDateXDaysBeforeNow } from "./utils"

const meta = {
  title: "VC Assist/Routes/Dashboard",
  component: Dashboard,
  parameters: {
    layout: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dashboard>

export default meta
type Story = StoryObj<typeof meta>

export const ADay: Story = {
  args: {
    data: new StudentData({
      gpa: 4.4,
      courses: [
        new Course({
          name: "AP Physics C: Mechanics",
          teacher: "Mr. Naumann",
          teacherEmail: "JNaumann@vcs.net",
          room: "E112",
          overallGrade: 91,
          homeworkPasses: 0,
          remoteMeetingLink: "https://bing.com",
          dayName: "A",
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(4, 8, 0),
              endTime: unixDateXDaysBeforeNow(4, 9, 15),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(2, 8, 0),
              endTime: unixDateXDaysBeforeNow(2, 9, 15),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(0, 8, 0),
              endTime: unixDateXDaysBeforeNow(0, 9, 15),
            }),
          ],
        }),
        new Course({
          name: "Philosophy in Literature (H)",
          teacher: "Dr. Lance",
          teacherEmail: "lwheatley@vcs.net",
          room: "G106",
          overallGrade: 95,
          homeworkPasses: 2,
          remoteMeetingLink: "https://google.com",
          dayName: "A",
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(4, 9, 20),
              endTime: unixDateXDaysBeforeNow(4, 10, 45),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(2, 9, 20),
              endTime: unixDateXDaysBeforeNow(2, 10, 45),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(0, 9, 20),
              endTime: unixDateXDaysBeforeNow(0, 10, 45),
            }),
          ],
        }),
        new Course({
          name: "Data Structures and Algorithms (H)",
          teacher: "Mr. MacMillan",
          teacherEmail: "jmacmillan@vcs.net",
          room: "G126",
          homeworkPasses: 3,
          remoteMeetingLink: "https://google.com",
          dayName: "A",
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(4, 10, 50),
              endTime: unixDateXDaysBeforeNow(4, 11, 40),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(2, 10, 50),
              endTime: unixDateXDaysBeforeNow(2, 11, 40),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(0, 10, 50),
              endTime: unixDateXDaysBeforeNow(0, 11, 40),
            }),
          ],
        }),
        new Course({
          name: "Unscheduled",
          teacher: "Ms. Fuller",
          dayName: "A",
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(4, 13, 20),
              endTime: unixDateXDaysBeforeNow(4, 14, 30),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(2, 13, 20),
              endTime: unixDateXDaysBeforeNow(2, 14, 30),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(0, 13, 20),
              endTime: unixDateXDaysBeforeNow(0, 14, 30),
            }),
          ],
        }),
        new Course({
          name: "AP Statistics",
          dayName: "B",
          teacher: "Mrs. Smith",
          teacherEmail: "csmith@vcs.net",
          room: "E202",
          overallGrade: 87,
          homeworkPasses: 1,
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(3, 8, 0),
              endTime: unixDateXDaysBeforeNow(3, 9, 15),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(1, 8, 0),
              endTime: unixDateXDaysBeforeNow(1, 9, 15),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(-1, 8, 0),
              endTime: unixDateXDaysBeforeNow(-1, 9, 15),
            }),
          ],
        }),
        new Course({
          name: "AP US Government & Politics",
          dayName: "B",
          teacher: "Ms. Robinson",
          teacherEmail: "probinson@vcs.net",
          room: "E111",
          overallGrade: 89,
          homeworkPasses: 2,
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(3, 9, 20),
              endTime: unixDateXDaysBeforeNow(3, 10, 45),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(1, 9, 20),
              endTime: unixDateXDaysBeforeNow(1, 10, 45),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(-1, 9, 20),
              endTime: unixDateXDaysBeforeNow(-1, 10, 45),
            }),
          ],
        }),
        new Course({
          name: "Multi-Variable Calculus (H)",
          dayName: "B",
          teacher: "Dr. Shim",
          teacherEmail: "tshim@vcs.net",
          room: "E204",
          overallGrade: 80,
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(3, 10, 50),
              endTime: unixDateXDaysBeforeNow(3, 11, 40),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(1, 10, 50),
              endTime: unixDateXDaysBeforeNow(1, 11, 40),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(-1, 10, 50),
              endTime: unixDateXDaysBeforeNow(-1, 11, 40),
            }),
          ],
        }),
        new Course({
          name: "Philosophy of Religion",
          dayName: "B",
          teacher: "Mr. Bui",
          teacherEmail: "no.email.address@smtp.sendgrid.net",
          room: "E204",
          homeworkPasses: 2,
          overallGrade: 96,
          remoteMeetingLink: "https://google.com",
          meetings: [
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(3, 13, 20),
              endTime: unixDateXDaysBeforeNow(3, 14, 30),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(1, 13, 20),
              endTime: unixDateXDaysBeforeNow(1, 14, 30),
            }),
            new CourseMeeting({
              startTime: unixDateXDaysBeforeNow(-1, 13, 20),
              endTime: unixDateXDaysBeforeNow(-1, 14, 30),
            }),
          ],
        }),
      ],
      currentDay: "A",
      dayNames: ["A", "B"],
    }),
  },
}
