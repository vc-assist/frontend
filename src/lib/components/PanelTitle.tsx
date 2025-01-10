import { twMerge } from "tailwind-merge"

export function PanelTitle(props: { className?: string; label: string }) {
  return (
    <h4 className={twMerge("font-semibold text-lg", props.className)}>
      {props.label}
    </h4>
  )
}
