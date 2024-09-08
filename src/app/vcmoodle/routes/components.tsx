import { UnstyledButton, useComputedColorScheme } from "@mantine/core"
import { twMerge } from "tailwind-merge"

export function SectionButton(props: { children: React.ReactNode, selected?: boolean, onClick: () => void }) {
  const colorScheme = useComputedColorScheme()

  const activeBorder = colorScheme === "light" ? "border-zinc-300" : "border-zinc-700"
  const hoveredBg = colorScheme === "light" ? "bg-zinc-200 bg-opacity-70" : "bg-zinc-900 bg-opacity-30"

  return (
    <UnstyledButton
      className={twMerge(
        `px-2 py-1 rounded-lg border border-solid border-transparent active:${activeBorder}`,
        `hover:${hoveredBg} transition-all`,
        props.selected ? `${activeBorder} ${hoveredBg}` : "",
      )}
      onClick={props.onClick}
    >
      {props.children}
    </UnstyledButton>
  )
}

export function PanelTitle(props: { className?: string, label: string }) {
  return (
    <h4 className={twMerge(
      "font-semibold text-lg",
      props.className
    )}>
      {props.label}
    </h4>
  )
}

