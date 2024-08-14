import { Title } from "@mantine/core"
import { Panel, UserAvatar, type UserProfile } from "@vcassist/ui"
import { twMerge } from "tailwind-merge"

const avatarClass = "w-24 h-24 lg:w-36 lg:h-36 rounded-full text-[4rem]"

export default function ProfileHeader(
  props: UserProfile & {
    className?: string
  },
) {
  return (
    <Panel
      className={twMerge(
        "grid grid-cols-[min-content_minmax(0,1fr)]",
        "items-center gap-6 p-6 lg:p-10 overflow-hidden",
        props.className,
      )}
    >
      <div className="relative overflow-visible">
        <UserAvatar
          name={props.name}
          email={props.email}
          picture={props.picture}
          className={twMerge(avatarClass, "absolute top-0 left-0 blur-3xl")}
        />
        <UserAvatar
          name={props.name}
          email={props.email}
          picture={props.picture}
          className={avatarClass}
        />
      </div>
      <div className="flex flex-col gap-2 lg:gap-3 flex-1">
        <Title className="text-3xl lg:text-6xl lg:leading-tight truncate">
          {props.name ?? props.email}
        </Title>
      </div>
    </Panel>
  )
}
