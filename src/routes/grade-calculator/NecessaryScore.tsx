import type { CourseData } from "@backend.sis/data_pb"
import { Button, NumberInput, Slider, Text, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import type { Span } from "@opentelemetry/api"
import {
  Panel,
  RingProgressPicker,
  type RingSection,
  createDefaultMeter,
  useSpan,
} from "@vcassist/ui"
import { useState } from "react"
import { MdCalculate } from "react-icons/md"
import { twMerge } from "tailwind-merge"
import {
  fnSpan,
  getSectionsFromCategories,
  useCalculatorLayout,
} from "./internal"
import { calculateGradeCategories, calculatePointsForGrade } from "./logic"

const meter = createDefaultMeter("NecessaryScore")
const calcCounter = meter.createCounter("calculate")

function generateMarks(count: number): {
  value: number
  label: React.ReactNode
}[] {
  const marks: {
    value: number
    label: React.ReactNode
  }[] = []
  for (let i = 0; i <= count; i++) {
    const percentage = 100 * (i / count)
    marks.push({
      value: percentage,
      label: `${percentage}%`,
    })
  }
  return marks
}

function CourseDependentForm(props: {
  className?: string
  course: CourseData
  selectedCategory?: RingSection
  onChooseCategory: (category: RingSection) => void
  children?: React.ReactNode
}) {
  const categoryRecord = calculateGradeCategories(
    props.course.assignments,
    props.course.assignmentCategories,
  )
  const sections = getSectionsFromCategories(categoryRecord)

  return (
    <div className={twMerge("flex flex-col gap-6", props.className)}>
      <Title order={4}>Category</Title>
      <RingProgressPicker
        className="m-auto"
        sections={sections}
        selectedId={props.selectedCategory?.id}
        onChoose={(s) => {
          props.onChooseCategory(s)
        }}
      />
      {props.selectedCategory && categoryRecord[props.selectedCategory.id] ? (
        <div className="flex justify-center gap-1">
          <Text size="xs">
            <b className="font-semibold">Category Grade:</b>{" "}
            {categoryRecord[props.selectedCategory.id].totalPoints === 0
              ? "—"
              : `${(
                  (categoryRecord[props.selectedCategory.id].earnedPoints /
                    categoryRecord[props.selectedCategory.id].totalPoints) *
                  100
                ).toFixed(1)}%`}
          </Text>
          <div className="w-[1px] h-[1rem] bg-primary" />
          <Text size="xs">
            <b className="font-semibold">Weight:</b>{" "}
            {(categoryRecord[props.selectedCategory.id]?.weight * 100).toFixed(
              1,
            )}
            %
          </Text>
        </div>
      ) : undefined}
      {props.children}
    </div>
  )
}

export default function NecessaryScore(props: {
  course?: CourseData
  parentSpan: Span
}) {
  const span = useSpan(fnSpan, props.parentSpan, "necessary-score")

  const layout = useCalculatorLayout()
  const [result, setResult] = useState<number | undefined>()

  type NecessaryScoreFormType = Partial<{
    pointWorth: number
    grade: number
    category: RingSection
  }>
  const form = useForm<NecessaryScoreFormType>({
    initialValues: {
      grade: 100,
    },
    validate: {
      pointWorth: (c) =>
        c !== undefined ? null : "You must specify point worth.",
      grade: (c) =>
        c !== undefined ? null : "You must specify a desired grade.",
      category: (c) => (c !== undefined ? null : "You must select a category."),
    },
  })

  return (
    <Panel className="flex flex-col gap-3 justify-between flex-1">
      <div className="flex flex-col gap-3">
        {props.course ? (
          <CourseDependentForm
            course={props.course}
            selectedCategory={form.values.category}
            onChooseCategory={(category) => {
              form.setFieldValue("category", category)
            }}
          >
            {form.errors.category ? (
              <Text className="text-center" c="red" size="xs">
                {form.errors.category}
              </Text>
            ) : undefined}
          </CourseDependentForm>
        ) : undefined}
        <Title order={4}>Desired Grade</Title>
        <div
          className={twMerge(
            "flex",
            layout === "mobile" ? "flex-col gap-4" : "flex-row gap-6",
          )}
        >
          <Slider
            className="pb-8 pt-4 flex-1"
            label={(value) => `${value}%`}
            labelAlwaysOn
            marks={generateMarks(layout === "desktop" ? 5 : 4)}
            value={form.values.grade ?? 100}
            step={5}
            onChange={(value) => {
              form.setFieldValue("grade", value)
            }}
          />
          <NumberInput
            className={layout === "desktop" ? "w-24" : undefined}
            decimalScale={2}
            {...form.getInputProps("grade")}
          />
        </div>
      </div>
      <Button
        c="white"
        bg="blue"
        disabled={!props.course}
        onClick={() => {
          const { hasErrors } = form.validate()
          if (hasErrors) {
            return
          }
          if (!props.course) {
            return
          }

          const information = calculateGradeCategories(
            props.course.assignments,
            props.course.assignmentCategories,
          )

          const grade = form.values.grade
          const pointWorth = form.values.pointWorth
          const category = form.values.category
          if (grade === undefined || pointWorth === undefined || !category) {
            span.addEvent("Grade calculator values unset.", {
              "log.severity": "error",
              grade: grade?.toString(),
              pointWorth: pointWorth?.toString(),
              category: category?.id,
            })
            return
          }

          const points = calculatePointsForGrade(information, {
            category: category.id,
            pointValue: pointWorth,
            targetGrade: grade / 100,
          })
          setResult(points)

          const eventData = {
            category: category.id,
            pointValue: pointWorth,
            targetGrade: grade / 100,
            courseName: props.course.name,
          }
          span.addEvent("Calculate.", eventData)
          calcCounter.add(1, eventData)
        }}
        leftSection={<MdCalculate size={24} />}
        size="md"
      >
        Calculate
      </Button>
      <Title order={4}>Necessary Score</Title>
      <div className="flex py-4">
        <div className="flex gap-3 items-center border-b-4 border-primary min-w-[180px] m-auto p-4 flex-wrap">
          <Title order={1} className="leading-8 whitespace-nowrap">
            {result ? result.toFixed(2) : "-"} /{" "}
          </Title>
          <NumberInput
            className="inline-block max-w-[8rem]"
            placeholder="Total points"
            {...form.getInputProps("pointWorth")}
          />
          {result !== undefined && form.values.pointWorth !== undefined ? (
            result > form.values.pointWorth ? (
              <Title order={1} className="leading-8">
                💀
              </Title>
            ) : undefined
          ) : undefined}
        </div>
      </div>
    </Panel>
  )
}
