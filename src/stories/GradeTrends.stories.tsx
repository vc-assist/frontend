import type { Meta, StoryObj } from "@storybook/react"
import GradeTrends, { GradeInterval } from "../routes/grade-trends/GradeTrends"
import { Course, GradeSnapshot } from "@backend.studentdata/student_data_pb"

const meta = {
  title: "VC Assist/Routes/GradeTrends",
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

const now = new Date()

function unixDateXDaysBeforeNow(dayOffset: number) {
  return BigInt(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOffset,
    ).getTime() / 1000,
  )
}

const fakeCourses = [
  new Course({
    name: "AP US History",
    snapshots: [
      new GradeSnapshot({
        time: unixDateXDaysBeforeNow(48),
        value: 0.70,
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
    className: "h-[400px]",
    courses: fakeCourses,
  },
}
export const All: Story = {
  args: {
    className: "h-[400px]",
    courses: fakeCourses,
    interval: GradeInterval.ALL,
  },
}
export const Week: Story = {
  args: {
    className: "h-[400px]",
    courses: fakeCourses,
    interval: GradeInterval.WEEK,
  },
}
