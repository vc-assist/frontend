import { Title } from "@mantine/core"
import { type FileRoutesByPath, Link } from "@tanstack/react-router"
import { twMerge } from "tailwind-merge"
type NavButtonProps = {
  icon: (props: { className?: string }) => JSX.Element
  label?: string
  routeSelected: boolean
  route?: keyof FileRoutesByPath
}
export function NavButton(props: NavButtonProps) {
  const className = twMerge(
    "flex gap-2 rounded-xl transition-all p-3 min-[400px]:p-4",
    "focus:outline focus:outline-2 focus:outline-dimmed bg-bg",
    props.routeSelected
      ? "bg-bg-dimmed text-dimmed hover:text-dimmed fill-primary"
      : "text-dimmed fill-dimmed hover:cursor-pointer hover:text-primary",
  )

  const children = (
    <>
      <props.icon className="min-w-[2rem] min-h-[2rem]" />
      {props.label ? (
        <Title className="leading-8" order={5}>
          {props.label}
        </Title>
      ) : undefined}
    </>
  )
  if (props.route) {
    return (
      <Link className={className} to={props.route}>
        {children}
      </Link>
    )
  }

  // this is done so one can "tab" over buttons that don't do anything
  return <div className={className}>{children}</div>
}
