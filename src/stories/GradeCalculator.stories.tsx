import {
  AssignmentCategory,
  AssignmentData,
  CourseData,
} from "@backend.sis/data_pb"
import type { Meta, StoryObj } from "@storybook/react"
import GradeCalculator from "../routes/grade-calculator"
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
      new CourseData({
        name: "AP US History",
        assignmentCategories: [
          new AssignmentCategory({
            name: "Mastery",
            weight: 0.4,
          }),
          new AssignmentCategory({
            name: "Progress",
            weight: 0.3,
          }),
          new AssignmentCategory({
            name: "Classwork/Homework",
            weight: 0.15,
          }),
          new AssignmentCategory({
            name: "Final",
            weight: 0.15,
          }),
        ],
        assignments: [
          new AssignmentData({
            title: "In-class essay",
            pointsEarned: 5,
            pointsPossible: 10,
            category: "Mastery",
            dueDate: unixDateXDaysBeforeNow(5),
          }),
          new AssignmentData({
            title: "Take notes",
            pointsEarned: 9,
            pointsPossible: 10,
            category: "Classwork/Homework",
            dueDate: unixDateXDaysBeforeNow(3),
          }),
          new AssignmentData({
            title: "Take notes",
            pointsEarned: 10,
            pointsPossible: 10,
            category: "Classwork/Homework",
            dueDate: unixDateXDaysBeforeNow(2),
          }),
          new AssignmentData({
            title: "Quiz",
            pointsEarned: 17,
            pointsPossible: 20,
            category: "Progress",
            dueDate: unixDateXDaysBeforeNow(1),
          }),
        ],
      }),
    ],
  },
}
