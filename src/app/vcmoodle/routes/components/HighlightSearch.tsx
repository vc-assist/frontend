import { useRouteContext } from "@/src/components/Router"
import { Panel } from "@vcassist/ui"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { MdSearch } from "react-icons/md"
import type { BrowseParams } from "../browse"

export function HighlightSearch(props: {
  courseId?: bigint
}) {
  const { push } = useRouteContext()
  const [selectBounds, setSelectBounds] = useState<DOMRect>()
  const [selection, setSelection] = useState<Selection>()

  useEffect(() => {
    let currentTime = performance.now()
    const highlightHandler = () => {
      const last = currentTime
      currentTime = performance.now()
      if (currentTime - last < 100) {
        return
      }

      setTimeout(() => {
        const selection = document.getSelection()
        if (!selection || selection.isCollapsed) {
          setSelectBounds(undefined)
          setSelection(undefined)
          return
        }
        const range = selection.getRangeAt(0)
        setSelectBounds(range.getBoundingClientRect())
        setSelection(selection)
      }, 100)
    }

    const cancelHandler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return
      }
      document.getSelection()?.empty()
      setSelectBounds(undefined)
      setSelection(undefined)
    }

    window.addEventListener("mouseup", highlightHandler)
    window.addEventListener("touchend", highlightHandler)
    window.addEventListener("keydown", cancelHandler)

    return () => {
      window.removeEventListener("mouseup", highlightHandler)
      window.removeEventListener("touchend", highlightHandler)
      window.addEventListener("keydown", cancelHandler)
    }
  }, [])

  const selectionStr = selection?.toString()

  return (
    <AnimatePresence>
      {selectBounds ? (
        <motion.div
          style={{
            position: "fixed",
            left: `${(selectBounds.left + selectBounds.right) / 2}px`,
            top: `${selectBounds.bottom}px`,
            transform: "translateX(-50%) translateY(-200%)",
          }}
          initial={{ y: 20, opacity: 0.2 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0.2 }}
          onClick={() => {
            let courseId = props.courseId
            if (!courseId) {
              let current = selection?.anchorNode
              while (current) {
                if (current instanceof Element) {
                  const data = current.getAttribute("data-course-id") ?? ""
                  const id = Number.parseInt(data)
                  if (!Number.isNaN(id)) {
                    courseId = BigInt(id)
                    break
                  }
                }
                current = current.parentNode
              }
            }

            push("/browse", {
              path: [courseId],
              search: selectionStr,
            } satisfies BrowseParams)
          }}
        >
          <Panel className="hover:cursor-pointer px-3 py-2 flex gap-1 items-start max-w-sm">
            <MdSearch className="min-w-5 max-w-5 min-h-5 max-h-5" />"
            <span>{selectionStr}</span>"
          </Panel>
        </motion.div>
      ) : undefined}
    </AnimatePresence>
  )
}
