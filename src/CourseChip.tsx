import { Button, Text } from "@mantine/core";
import { CSSProperties, useState } from "react";
import { MdClass, MdInfo, MdInfoOutline, MdVideocam } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { LinkButton, PopoutChip } from "@vcassist/ui"
import { Color } from "@vcassist/ui/lib/color";
import { Course } from "@backend.studentdata/student_data_pb"

const iconStyle: Partial<CSSProperties> = {
  minWidth: "18px",
  maxWidth: "18px",
  minHeight: "18px",
  maxHeight: "18px",
};

export default function CourseChip(props: {
  course: Course;
  classNames?: Partial<{
    root: string;
    text: string;
    icon: string;
  }>;
  dayNames: string[];
  disableGradeColoring?: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const dayName = props.course.dayName;
  const meetingLink = props.course.remoteMeetingLink;
  const overallGrade = Math.round(props.course.overallGrade * 100);

  return (
    <PopoutChip
      className={twMerge("flex gap-2 items-center", props.classNames?.root)}
      title={props.course.name}
      icon={MdClass}
      onOpened={(opened) => setOpened(opened)}
      chip={
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 flex-wrap max-w-[250px]">
            <div className="flex flex-col gap-1">
              <Text>Grade</Text>
              <Text
                style={
                  !props.disableGradeColoring
                    ? {
                      color: Color.fromGrade(overallGrade),
                    }
                    : undefined
                }
              >
                {overallGrade}%
              </Text>
            </div>
            <div className="flex flex-col gap-1">
              <Text>Instructor</Text>
              {props.course.teacherEmail ? (
                <LinkButton onClick={() => window.open(
                  `mailto:${props.course.teacherEmail}`
                )}>
                  {props.course.teacher}
                </LinkButton>
              ) : (
                <Text c="dimmed">{props.course.teacher}</Text>
              )}
            </div>
            {props.course.room ? (
              <div className="flex flex-col gap-1">
                <Text>Room</Text>
                <Text c="dimmed">{props.course.room}</Text>
              </div>
            ) : undefined}
            {props.course.homeworkPasses !== undefined ? (
              <div className="flex flex-col gap-1">
                <Text>Homework passes</Text>
                <Text c="dimmed">{props.course.homeworkPasses}</Text>
              </div>
            ) : undefined}
          </div>
          {meetingLink ? (
            <Button
              size="xs"
              className="w-fit"
              variant="gradient"
              onClick={() => {
                window.open(meetingLink);
              }}
              leftSection={<MdVideocam size={18} />}
            >
              Meeting
            </Button>
          ) : undefined}
          {dayName ? (
            <div className="flex gap-1 col-span-2">
              <div
                className="px-3 py-2 rounded-lg"
                style={{
                  background: dayName
                    ? Color.DAY_COLORS_LIST[
                    props.dayNames.findIndex((value) => value === dayName)
                    ]
                    : undefined,
                }}
                key={dayName}
              >
                <p className="text-gray-50 font-bold text-sm">{dayName}</p>
              </div>
            </div>
          ) : undefined}
        </div>
      }
    >
      <Text
        className={twMerge("w-fit", props.classNames?.text)}
        style={{ fontWeight: 500 }}
      >
        {props.course.name}
      </Text>
      {!opened ? (
        <MdInfoOutline className={props.classNames?.icon} style={iconStyle} />
      ) : (
        <MdInfo className={props.classNames?.icon} style={iconStyle} />
      )}
    </PopoutChip>
  );
}
