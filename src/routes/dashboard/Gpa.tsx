import { useElementSize } from "@mantine/hooks";
import { twMerge } from "tailwind-merge";
import { Color, Panel, RingProgress } from "@vcassist/ui"

export default function Gpa(props: {
  className?: string;
  gpa: number;
}) {
  const gpa = props.gpa;
  const progress = gpa >= 4.0 ? 100 : (gpa / 4.0) * 100;
  const { ref, width } = useElementSize();

  const expanded = width > 175;

  const label = (
    <>
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
    </>
  );

  return (
    <Panel
      className={twMerge("flex h-full", props.className)}
      ref={ref}
      noPadding
    >
      <RingProgress
        className="m-auto"
        size={width > 0 ? width : 175}
        thickness={width / 15}
        sections={[
          {
            value: progress,
            color: Color.CUSTOM.lightGreen,
          },
        ]}
        label={label}
      />
    </Panel>
  );
}
