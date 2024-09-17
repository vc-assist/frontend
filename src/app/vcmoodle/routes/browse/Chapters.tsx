import type { Resource } from "@backend.vcmoodle/api_pb"
import { useHotkeys } from "@mantine/hooks"
import { Panel } from "@vcassist/ui"
import { MdOutlineArticle } from "react-icons/md"
import { twMerge } from "tailwind-merge"
import { ListItemButton } from "../components/ListItemButton"
import { PanelTitle } from "../components/PanelTitle"
import { useListMaxWidthClass, useScrollIntoViewRef } from "./utils"

export function Chapters(props: {
  resource: Resource
  selected?: number
  onSelect(idx?: number): void
  onShow(idx: number): void
}) {
  const maxWidthClass = useListMaxWidthClass()
  const selectedRef = useScrollIntoViewRef(props.selected)

  useHotkeys([
    [
      "Enter",
      () => {
        if (
          props.resource.chapters.length === 0 ||
          props.selected === undefined
        ) {
          return
        }
        props.onShow(props.selected)
      },
    ],
  ])

  if (props.resource.chapters.length === 0) {
    return <></>
  }

  return (
    <Panel className={twMerge("flex flex-col gap-1 p-3", maxWidthClass)}>
      <PanelTitle label="Chapters" />

      <div className="flex flex-col gap-1">
        {props.resource.chapters.map((c, idx) => {
          return (
            <ListItemButton
              key={c.id}
              icon={MdOutlineArticle}
              selected={idx === props.selected}
              onClick={() => {
                props.onSelect(idx)
                props.onShow(idx)
              }}
            >
              <p
                ref={idx === props.selected ? selectedRef : undefined}
                className="text-md"
              >
                {c.name}
              </p>
            </ListItemButton>
          )
        })}
      </div>
    </Panel>
  )
}
