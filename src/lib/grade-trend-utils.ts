import { dateFromUnix } from "@/src/lib/date"
import { CourseData, GradeSnapshot } from "@/backend/api/vcassist/powerschool/v1/types_pb"
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

export type GradeChangeAnalysisOptions = {
  change: {
    from: Duration
    threshold: number
  }
}

export type GradeChangeAnalysis = {
  [key: string]: {
    snapshots: GradeSnapshot[]
    changed?: number
  }
}

export function analyzeGradeChange(
  courses: CourseData[],
  options: GradeChangeAnalysisOptions = {
    change: {
      from: { weeks: 1 },
      threshold: 0.5,
    },
  },
): GradeChangeAnalysis {
  const analysis: GradeChangeAnalysis = {}
  const withinInterval = compareDesc(sub(options.change.from)(new Date()))
  for (const course of courses) {
    const grades = course.snapshots
    const dataPoints = grades.sort((a, b) => {
      if(a?.time === undefined || b?.time === undefined) {
        throw new Error
      }
      if (a.time > b.time) {
        return 1
      }
      if (a.time < b.time) {
        return -1
      }
      return 0
    })
    let changed: number | undefined
    for (let i = dataPoints.length - 2; i >= 0; i--) {
      const time = dateFromUnix(dataPoints[i].time)
      if (withinInterval(time) >= 0) {
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
  fromLast?: Duration
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
  analysis: GradeChangeAnalysis,
  options: SeriesOptions = {
    onlyChanged: false,
    fromLast: { weeks: 1 },
  },
): GradeSeries {
  // returns >= 0 if given time is after (now - options.fromLast)
  const afterIntervalCutoff = options.fromLast
    ? compareDesc(sub(options.fromLast)(new Date()))
    : undefined

  const formatTime = (time: Date) => format(time, "LLL d")
  const parseTime = (time: string) => parse(time, "LLL d", new Date())

  const forEachActiveSeries = (callback: (name: string) => void) => {
    for (const name in analysis) {
      if (options.onlyChanged && analysis[name].changed === undefined) {
        continue
      }
      callback(name)
    }
  }

  const forEachSnapshotInCurrentInterval = (
    snapshots: GradeChangeAnalysis[string]["snapshots"],
    callback: (snapshot: GradeSnapshot) => void,
  ) => {
    for (let i = snapshots.length - 1; i >= 0; i--) {
      const time = dateFromUnix(snapshots[i].time)
      if (afterIntervalCutoff && afterIntervalCutoff(time) >= 0) {
        break
      }
      callback(snapshots[i])
    }
  }

  const dates = new Set<string>()
  forEachActiveSeries((name) => {
    forEachSnapshotInCurrentInterval(analysis[name].snapshots, (snapshot) => {
      const time = dateFromUnix(snapshot.time)
      dates.add(formatTime(time))
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

  let gradeRange: GradeSeries["range"] = {
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
  }
  const output: GradeSeries["series"] = []

  i = 0
  const seriesCount = Object.keys(analysis).length
  forEachActiveSeries((name) => {
    const outputSeriesData: GradeSeries["series"][number]["data"] = []

    forEachSnapshotInCurrentInterval(analysis[name].snapshots, (snapshot) => {
      if (snapshot.value < gradeRange.min) {
        gradeRange.min = snapshot.value
      }
      if (snapshot.value > gradeRange.max) {
        gradeRange.max = snapshot.value
      }
      const time = dateFromUnix(snapshot.time)
      outputSeriesData[dateIndex[formatTime(time)]] = snapshot.value
    })

    output.push({
      name,
      data: fillArray(outputSeriesData, null),
      color: rainbow(i / seriesCount),
    })
    i++
  })

  // ApexCharts freezes the page if it's given a bad range
  // so here I am.
  if (gradeRange.min >= gradeRange.max) {
    gradeRange = { min: 0, max: 100 }
  }

  return { series: output, range: gradeRange, xaxis }
}
