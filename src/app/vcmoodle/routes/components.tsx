import { UnstyledButton } from "@mantine/core"
import { twMerge } from "tailwind-merge"

export function SectionButton(props: { children: React.ReactNode, selected?: boolean, onClick: () => void }) {
  return (
    <UnstyledButton
      className={twMerge(
        "px-2 py-1 rounded-lg border border-solid border-transparent active:border-gray-300",
        "hover:bg-gray-900 hover:bg-opacity-5 transition-all",
        props.selected ? "border-gray-300 bg-gray-900 bg-opacity-5" : "",
      )}
      onClick={props.onClick}
    >
      {props.children}
    </UnstyledButton>
  )
}

export function PanelTitle(props: { label: string }) {
  return <h4 className="font-semibold text-lg">{props.label}</h4>
}

