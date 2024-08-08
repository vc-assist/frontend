import type { Meta, StoryObj } from "@storybook/react"
import Courses from "../routes/courses"
import { Course } from "@backend.studentdata/student_data_pb"

const meta = {
  title: "VC Assist/Routes/Courses",
  component: Courses,
  parameters: {
    layout: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Courses>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    courses: [
      new Course({
        name: "AP Physics C: Mechanics",
        dayName: "A",
        lessonPlan: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
      }),
      new Course({
        name: "Philosophy in Literature (H)",
        dayName: "A",
        lessonPlan: "<h1>Homework</h1>\n<ul>\n<li>Read something</li>\n<li>Do <a href='https://google.com'>this</a> worksheet.</li>\n</ul>"
      }),
      new Course({
        name: "Data Structures and Algorithms (H)",
        dayName: "A",
      }),
      new Course({
        name: "Unscheduled",
        dayName: "A",
      }),
      new Course({
        name: "AP Statistics",
        dayName: "B",
      }),
      new Course({
        name: "AP US Government & Politics",
        dayName: "B",
      }),
      new Course({
        name: "Multi-Variable Calculus (H)",
        dayName: "B",
      }),
      new Course({
        name: "Philosophy of Religion",
        dayName: "B",
      }),
    ]
  },
}
