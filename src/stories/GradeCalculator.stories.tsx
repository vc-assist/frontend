import type { Meta, StoryObj } from "@storybook/react"
import GradeCalculator from "../routes/grade-calculator"
import { Assignment, AssignmentType, Course } from "@backend.studentdata/student_data_pb"
import { unixDateXDaysBeforeNow } from "./utils"

const meta = {
  title: "VC Assist/Routes/Grade Calculator",
  component: GradeCalculator,
  parameters: {
    layout: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GradeCalculator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    courses: [
      new Course({
        name: "AP US History",
        assignmentTypes: [
          new AssignmentType({
            name: "Mastery",
            weight: 0.4,
          }),
          new AssignmentType({
            name: "Progress",
            weight: 0.3,
          }),
          new AssignmentType({
            name: "Classwork/Homework",
            weight: 0.15,
          }),
          new AssignmentType({
            name: "Final",
            weight: 0.15,
          })
        ],
        assignments: [
          new Assignment({
            name: "In-class essay",
            scored: 5,
            total: 10,
            assignmentTypeName: "Mastery",
            time: unixDateXDaysBeforeNow(5),
          }),
          new Assignment({
            name: "Take notes",
            scored: 9,
            total: 10,
            assignmentTypeName: "Classwork/Homework",
            time: unixDateXDaysBeforeNow(3),
          }),
          new Assignment({
            name: "Take notes",
            scored: 10,
            total: 10,
            assignmentTypeName: "Classwork/Homework",
            time: unixDateXDaysBeforeNow(2),
          }),
          new Assignment({
            name: "Quiz",
            scored: 17,
            total: 20,
            assignmentTypeName: "Progress",
            time: unixDateXDaysBeforeNow(1),
          }),
        ]
      })
    ]
  },
}
