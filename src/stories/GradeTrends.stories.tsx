import { Course, GradeSnapshot } from "@backend.studentdata/student_data_pb"
import type { Meta, StoryObj } from "@storybook/react"
import GradeTrends, { GradeInterval } from "../routes/grade-trends/GradeTrends"
import { unixDateXDaysBeforeNow } from "./utils"

const meta = {
  title: "VC Assist/Routes/Grade Trends",
  component: GradeTrends,
  parameters: {
    layout: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GradeTrends>

export default meta
type Story = StoryObj<typeof meta>

export const NoCourses: Story = {
  args: {
    courses: [],
  },
}

const fakeCourses = [
  new Course({
    name: "AP US History",
    snapshots: [
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(48),
        value: 0.7,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(12),
        value: 0.79,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(9),
        value: 0.86,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(6),
        value: 0.85,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(3),
        value: 0.8,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(0),
        value: 0.8,
      }),
    ],
  }),
  new Course({
    name: "AP Calculus BC",
    snapshots: [
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(12),
        value: 0.8,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(9),
        value: 0.8,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(6),
        value: 0.85,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(3),
        value: 0.86,
      }),
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(0),
        value: 0.79,
      }),
    ],
  }),
]

export const Default: Story = {
  args: {
    courses: fakeCourses,
  },
}
export const All: Story = {
  args: {
    courses: fakeCourses,
    interval: GradeInterval.ALL,
  },
}
export const Week: Story = {
  args: {
    courses: fakeCourses,
    interval: GradeInterval.WEEK,
  },
}
