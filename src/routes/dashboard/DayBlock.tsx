import { Color, Panel } from "@vcassist/ui"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

function formatDate(date: Date, size: "long" | "short", withDay?: boolean) {
  if (size === "long") {
    if (withDay) {
      return format(date, "MMM dd, EEEE")
    }
    return format(date, "EEEE, MMM y")
  }
  if (size === "short") {
    if (withDay) {
      return format(date, "E dd")
    }
    return format(date, "E, MMM")
  }
}

export default function DayBlock(props: {
  className?: string
  currentDay: string
  dayNames: string[]
}) {
  const day = props.currentDay

  const dayIdx = props.dayNames.findIndex((v) => v === day)
  const color = dayIdx >= 0 ? Color.DAY_COLORS_LIST[dayIdx] : undefined

  const today = new Date()
  const primaryDisplay = day ? day : format(today, "dd")
  const secondaryDisplay = formatDate(today, "long", !!day)

  return (
    <Panel
      className={twMerge(
        props.className,
        "flex flex-col justify-center items-center p-7 relative aspect-square",
      )}
      style={{
        backgroundColor: color ?? "gray",
      }}
      noBorder
    >
      <p className="text-center text-gray-50 text-6xl xl:text-7xl font-bold">
        {primaryDisplay}
      </p>
      <p className="text-center text-gray-50 text-lg xl:text-xl font-semibold">
        {secondaryDisplay}
      </p>
    </Panel>
  )
}
