import type {
  Course,
  GradeSnapshot,
} from "@backend.studentdata/student_data_pb"
import { hsla, toRgba } from "color2k"
import { type Duration, format, parse } from "date-fns"
import { compareDesc, sub } from "date-fns/fp"

export function rainbow(x: number) {
  // weight is calculated by the integral of the following function
  //   (cos(4pi*x) + 1) / 2
  // to generate nice looking colors
  // note: for some reason weight goes from 0-10 instead of 0-1
  const weight = ((Math.sin(4 * Math.PI * x) + 4 * Math.PI * x) / 4) * Math.PI
  return toRgba(hsla((x * 360 * weight) / 10, 0.75, 0.6, 1))
}

export function fillArray<T>(arr: (T | undefined)[], value: T): T[] {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === undefined) {
      arr[i] = value
    }
  }
  return arr as T[]
}

export type AnalysisOptions = {
  change: {
    from: Duration
    threshold: number
  }
}

export type GradeAnalysis = {
  [key: string]: {
    snapshots: GradeSnapshot[]
    changed?: number
  }
}

export function analyzeGrades(
  courses: Course[],
  options: AnalysisOptions = {
    change: {
      from: { weeks: 1 },
      threshold: 0.5,
    },
  },
): GradeAnalysis {
  const analysis: GradeAnalysis = {}
  const withinInterval = compareDesc(sub(options.change.from)(new Date()))

  for (const course of courses) {
    const grades = course.snapshots
    const dataPoints = grades.sort((a, b) => compareDesc(a.time)(b.time))
    let changed: number | undefined
    for (let i = dataPoints.length - 2; i >= 0; i--) {
      if (withinInterval(dataPoints[i].time) >= 0) {
        break
      }
      const change =
        100 *
        Math.abs(dataPoints[i].value - dataPoints[dataPoints.length - 1].value)
      if (change >= options.change.threshold) {
        changed = change
        break
      }
    }
    analysis[course.name] = { snapshots: dataPoints, changed }
  }

  return analysis
}

export type SeriesOptions = {
  onlyChanged: boolean
  from?: Duration
}

export type GradeSeries = {
  xaxis: string[]
  series: {
    name: string
    color: string
    data: (number | null)[]
  }[]
  range: {
    min: number
    max: number
  }
}

export function generateSeries(
  analysis: GradeAnalysis,
  options: SeriesOptions = {
    onlyChanged: false,
    from: { weeks: 1 },
  },
): GradeSeries {
  const withinInterval = options.from
    ? compareDesc(sub(options.from)(new Date()))
    : undefined

  const formatTime = (time: Date) => format(time, "LLL d")
  const parseTime = (time: string) => parse(time, "LLL d", new Date())

  const iterateAnalysis = (callback: (name: string) => void) => {
    for (const name in analysis) {
      if (options.onlyChanged && analysis[name].changed === undefined) {
        continue
      }
      callback(name)
    }
  }

  const iterateSnapshots = (
    snapshots: GradeAnalysis[string]["snapshots"],
    callback: (snapshot: GradeSnapshot) => void,
  ) => {
    for (let i = snapshots.length - 1; i >= 0; i--) {
      if (withinInterval && withinInterval(snapshots[i].time) >= 0) {
        break
      }
      callback(snapshots[i])
    }
  }

  const dates = new Set<string>()
  iterateAnalysis((name) => {
    iterateSnapshots(analysis[name].snapshots, (snapshot) => {
      dates.add(formatTime(snapshot.time))
    })
  })
  const dateIndex: { [key: string]: number } = {}
  let i = 0
  for (const d of Array.from(dates).sort((a, b) =>
    compareDesc(parseTime(a))(parseTime(b)),
  )) {
    dateIndex[d] = i
    i++
  }
  const xaxis: string[] = []
  for (const date in dateIndex) {
    xaxis[dateIndex[date]] = date
  }

  let range: GradeSeries["range"] = {
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
  }
  const series: GradeSeries["series"] = []

  i = 0
  const length = Object.keys(analysis).length
  iterateAnalysis((name) => {
    const data: GradeSeries["series"][number]["data"] = []
    iterateSnapshots(analysis[name].snapshots, (snapshot) => {
      if (snapshot.value * 100 < range.min) {
        range.min = snapshot.value * 100
      }
      if (snapshot.value * 100 > range.max) {
        range.max = snapshot.value * 100
      }
      data[dateIndex[formatTime(snapshot.time)]] = snapshot.value * 100
    })
    series.push({
      name,
      data: fillArray(data, null),
      color: rainbow(i / length),
    })
    i++
  })

  // ApexCharts freezes the page if it's given a bad range
  // so here I am.
  if (range.min >= range.max) {
    range = { min: 0, max: 100 }
  }

  return { series, range, xaxis }
}
