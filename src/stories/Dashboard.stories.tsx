import { Data } from "@backend.sis/api_pb"
import { CourseData, Meeting } from "@backend.sis/data_pb"
import type { Meta, StoryObj } from "@storybook/react"
import Dashboard from "../routes/sis/dashboard"
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
    data: new Data({
      profile: {
        currentGpa: 4.4,
      },
      courses: [
        new CourseData({
          name: "AP Physics C: Mechanics",
          teacher: "Mr. Naumann",
          teacherEmail: "JNaumann@vcs.net",
          room: "E112",
          overallGrade: 91,
          homeworkPasses: 0,
          dayName: "A",
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(4, 8, 0),
              stop: unixDateXDaysBeforeNow(4, 9, 15),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(2, 8, 0),
              stop: unixDateXDaysBeforeNow(2, 9, 15),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(0, 8, 0),
              stop: unixDateXDaysBeforeNow(0, 9, 15),
            }),
          ],
        }),
        new CourseData({
          name: "Philosophy in Literature (H)",
          teacher: "Dr. Lance",
          teacherEmail: "lwheatley@vcs.net",
          room: "G106",
          overallGrade: 95,
          homeworkPasses: 2,
          dayName: "A",
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(4, 9, 20),
              stop: unixDateXDaysBeforeNow(4, 10, 45),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(2, 9, 20),
              stop: unixDateXDaysBeforeNow(2, 10, 45),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(0, 9, 20),
              stop: unixDateXDaysBeforeNow(0, 10, 45),
            }),
          ],
        }),
        new CourseData({
          name: "Data Structures and Algorithms (H)",
          teacher: "Mr. MacMillan",
          teacherEmail: "jmacmillan@vcs.net",
          room: "G126",
          homeworkPasses: 3,
          dayName: "A",
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(4, 10, 50),
              stop: unixDateXDaysBeforeNow(4, 11, 40),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(2, 10, 50),
              stop: unixDateXDaysBeforeNow(2, 11, 40),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(0, 10, 50),
              stop: unixDateXDaysBeforeNow(0, 11, 40),
            }),
          ],
        }),
        new CourseData({
          name: "Unscheduled",
          teacher: "Ms. Fuller",
          dayName: "A",
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(4, 13, 20),
              stop: unixDateXDaysBeforeNow(4, 14, 30),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(2, 13, 20),
              stop: unixDateXDaysBeforeNow(2, 14, 30),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(0, 13, 20),
              stop: unixDateXDaysBeforeNow(0, 14, 30),
            }),
          ],
        }),
        new CourseData({
          name: "AP Statistics",
          dayName: "B",
          teacher: "Mrs. Smith",
          teacherEmail: "csmith@vcs.net",
          room: "E202",
          overallGrade: 87,
          homeworkPasses: 1,
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(3, 8, 0),
              stop: unixDateXDaysBeforeNow(3, 9, 15),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(1, 8, 0),
              stop: unixDateXDaysBeforeNow(1, 9, 15),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(-1, 8, 0),
              stop: unixDateXDaysBeforeNow(-1, 9, 15),
            }),
          ],
        }),
        new CourseData({
          name: "AP US Government & Politics",
          dayName: "B",
          teacher: "Ms. Robinson",
          teacherEmail: "probinson@vcs.net",
          room: "E111",
          overallGrade: 89,
          homeworkPasses: 2,
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(3, 9, 20),
              stop: unixDateXDaysBeforeNow(3, 10, 45),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(1, 9, 20),
              stop: unixDateXDaysBeforeNow(1, 10, 45),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(-1, 9, 20),
              stop: unixDateXDaysBeforeNow(-1, 10, 45),
            }),
          ],
        }),
        new CourseData({
          name: "Multi-Variable Calculus (H)",
          dayName: "B",
          teacher: "Dr. Shim",
          teacherEmail: "tshim@vcs.net",
          room: "E204",
          overallGrade: 80,
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(3, 10, 50),
              stop: unixDateXDaysBeforeNow(3, 11, 40),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(1, 10, 50),
              stop: unixDateXDaysBeforeNow(1, 11, 40),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(-1, 10, 50),
              stop: unixDateXDaysBeforeNow(-1, 11, 40),
            }),
          ],
        }),
        new CourseData({
          name: "Philosophy of Religion",
          dayName: "B",
          teacher: "Mr. Bui",
          teacherEmail: "no.email.address@smtp.sendgrid.net",
          room: "E204",
          homeworkPasses: 2,
          overallGrade: 96,
          meetings: [
            new Meeting({
              start: unixDateXDaysBeforeNow(3, 13, 20),
              stop: unixDateXDaysBeforeNow(3, 14, 30),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(1, 13, 20),
              stop: unixDateXDaysBeforeNow(1, 14, 30),
            }),
            new Meeting({
              start: unixDateXDaysBeforeNow(-1, 13, 20),
              stop: unixDateXDaysBeforeNow(-1, 14, 30),
            }),
          ],
        }),
      ],
    }),
  },
}
