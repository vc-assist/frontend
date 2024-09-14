import { useLayout } from "@vcassist/ui"
import { createRef, useEffect } from "react"

export function useListMaxWidthClass(): string {
  const layout = useLayout()
  return layout === "mobile" ? "max-w-[320px] sm:max-w-[500px]" : "max-w-[280px]"
}

export function useScrollIntoViewRef(...dependsOn: unknown[]) {
  const layout = useLayout()
  const selectedRef = createRef<HTMLDivElement>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: depending on selectedRef.current will not update when the element changes
  useEffect(() => {
    if (layout === "mobile") {
      return
    }
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, dependsOn)

  return selectedRef
}
