import type { DefaultMantineColor } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { type FnSpan, type RingSection, createFnSpanner } from "@vcassist/ui"
import type { GradeCategories } from "./logic"

export const fnSpan: FnSpan = createFnSpanner("GradeCalculator")

export const sectionColorOrdering: DefaultMantineColor[] = [
  "red",
  "cyan",
  "green",
  "orange",
  "violet",
  "dark",
]

export function useCalculatorLayout() {
  const layout = useMediaQuery(
    "screen and (max-width: 1000px)",
    window.innerWidth < 1000,
  )
    ? "mobile"
    : "desktop"
  return layout
}

function getCategoryList(categories: GradeCategories) {
  const categoryList = Object.entries(categories).sort((a, b) =>
    a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0,
  )
  return categoryList
}

export function getSectionsFromCategories(
  categories: GradeCategories,
  withHighlight = false,
): RingSection[] {
  const sections: RingSection[] = []

  const categoryList = getCategoryList(categories)

  let weightSum = 0
  for (const [, metadata] of categoryList) {
    if (metadata.totalPoints === 0) {
      continue
    }
    weightSum += metadata.weight
  }
  const scaleFactor = 1 / weightSum

  let i = 0
  for (const [category, metadata] of categoryList) {
    const grade = (metadata.earnedPoints / metadata.totalPoints) * 100
    sections.push({
      id: category,
      color: sectionColorOrdering[i],
      label: () => (
        <p
          className={
            withHighlight ? "select-text hover:cursor-text" : undefined
          }
          key={category}
        >
          <span className={withHighlight ? "select-all" : undefined}>
            {category}
          </span>{" "}
          | Grade:{" "}
          <span className={withHighlight ? "select-all" : undefined}>
            {metadata.totalPoints === 0 ? "—" : `${Math.round(grade)}`}
          </span>
          % | Weight:{" "}
          <span className={withHighlight ? "select-all" : undefined}>
            {metadata.weight * 100}
          </span>
          %
        </p>
      ),
      value:
        metadata.totalPoints === 0 ? 0 : grade * metadata.weight * scaleFactor,
    })
    i++
  }

  return sections
}
