import type { RingProgressProps } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { Color, Panel, RingProgress } from "@vcassist/ui"
import { AnimatePresence, motion } from "framer-motion"
import { twMerge } from "tailwind-merge"

export default function Gpa(props: {
  className?: string
  gpa: number
}) {
  const gpa = props.gpa
  const progress = gpa >= 4.0 ? 100 : (gpa / 4.0) * 100

  let remainingProgress = 100 - progress
  if (remainingProgress < 0) {
    remainingProgress = 0
  }

  const { ref, width } = useElementSize()

  const expanded = width > 175

  const sections: RingProgressProps["sections"] = [
    {
      color: "rgb(var(--colors-bg-dimmed))",
      value: remainingProgress,
    },
  ]
  if (gpa > 0) {
    sections.push({
      color: Color.CUSTOM.lightGreen,
      value: progress,
    })
  }

  return (
    <Panel
      className={twMerge(
        "flex h-full items-center justify-center relative",
        props.className,
      )}
      ref={ref}
      noPadding
    >
      <AnimatePresence>
        {width > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {/* you might find this multi-layered nesting of divs to be abbhorent but it is honestly
            the only way that this stupid ring will work on iOS, I don't know what's going on in there
            but it probably has something do with the display value and how SVGs work or something */}
            <div className="flex gap-3 items-center">
              <RingProgress
                size={width}
                thickness={width / 15}
                rootColor="transparent"
                sections={sections}
                // biome-ignore lint/complexity/noUselessFragments: this one is necessary to prevent label from rendering twice
                label={<></>}
                roundCaps
              />
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-[50%] -translate-y-[50%]">
              {expanded ? (
                <p
                  className={twMerge(
                    "text-center font-semibold",
                    "text-md xl:text-lg pt-2",
                  )}
                >
                  Current GPA
                </p>
              ) : undefined}
              <p
                className={twMerge(
                  "text-center font-bold",
                  expanded ? "text-2xl sm:text-4xl xl:text-5xl" : "text-4xl",
                )}
              >
                {gpa.toFixed(2)}
              </p>
            </div>
          </motion.div>
        ) : undefined}
      </AnimatePresence>
    </Panel>
  )
}
