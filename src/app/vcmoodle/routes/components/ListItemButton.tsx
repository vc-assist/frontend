import { UnstyledButton, useComputedColorScheme } from "@mantine/core"
import type { IconType } from "react-icons"
import { twMerge } from "tailwind-merge"

export function ListItemButton(props: {
  children: React.ReactNode
  className?: string
  icon?: IconType
  selected?: boolean
  onClick?: () => void
}) {
  const colorScheme = useComputedColorScheme()

  const activeBorder =
    colorScheme === "light" ? "border-zinc-300" : "border-zinc-700"

  const hoverPrefixedClass =
    colorScheme === "light"
      ? "hover:bg-zinc-200 hover:bg-opacity-70"
      : "hover:bg-zinc-900 hover:bg-opacity-30"

  const hoverClass =
    colorScheme === "light"
      ? "bg-zinc-200 bg-opacity-70"
      : "bg-zinc-900 bg-opacity-30"

  return (
    <UnstyledButton
      className={twMerge(
        `px-2 py-1 rounded-lg border border-solid border-transparent active:${activeBorder}`,
        `${hoverPrefixedClass} transition-all flex gap-2 items-center`,
        props.selected ? `${activeBorder} ${hoverClass}` : "",
        props.className,
      )}
      onClick={props.onClick}
    >
      {props.icon ? (
        <props.icon className="min-w-5 min-h-5 max-w-5 max-h-5" />
      ) : undefined}
      {props.children}
    </UnstyledButton>
  )
}
