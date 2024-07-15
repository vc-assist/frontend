import type { Course } from "@backend.studentdata/student_data_pb"
import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core"
import type { Span } from "@opentelemetry/api"
import { useComputed, useSignal } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"
import {
  type CellContext,
  type ColumnFilter,
  type HeaderContext,
  type SortDirection,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Color,
  ColorKey,
  InfoTooltip,
  type MacroLayouts,
  Panel,
  RingProgressPicker,
  useSpan,
} from "@vcassist/ui"
import { compareAsc, format } from "date-fns"
import Fuse, { type FuseResult } from "fuse.js"
import {
  Fragment,
  createRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdDelete,
  MdEdit,
  MdRestore,
  MdSearch,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md"
import { twMerge } from "tailwind-merge"
import {
  fnSpan,
  getSectionsFromCategories,
  useCalculatorLayout,
} from "./internal"
import {
  type BaseAssignment,
  type BaseAssignmentType,
  calculateGradeCategories,
} from "./logic"

export enum WhatIfAssignmentState {
  NORMAL = 0,
  REPLACED = 1,
  ADDED = 2,
}

export type WhatIfAssignment = BaseAssignment & {
  index: number
  time: Date
  state: WhatIfAssignmentState
  disabled: boolean
  ctx: WhatIfTableContext
}

const columnHelper = createColumnHelper<WhatIfAssignment>()

const coreRowModel = getCoreRowModel()
const filteredRowModel = getFilteredRowModel()
const coreSortedRowModel = getSortedRowModel()

function TableHeader<T>(props: {
  width: string
  ctx: HeaderContext<T, unknown>
  title: string
  onSort?: (newValue: SortDirection | false) => void
}): React.ReactNode {
  const title = <Title order={6}>{props.title}</Title>

  if (!props.ctx.column.getCanSort()) {
    return (
      <Table.Th className="text-sm text-start" style={{ width: props.width }}>
        {title}
      </Table.Th>
    )
  }

  const sorted = props.ctx.column.getIsSorted()
  return (
    <Table.Th className="text-sm text-start" style={{ width: props.width }}>
      <UnstyledButton
        className="flex items-center gap-2"
        onClick={props.ctx.column.getToggleSortingHandler()}
      >
        {title}
        {sorted ? (
          sorted === "asc" ? (
            <MdArrowUpward size={20} />
          ) : (
            <MdArrowDownward size={20} />
          )
        ) : undefined}
      </UnstyledButton>
    </Table.Th>
  )
}

function editableCell({
  edit: Edit,
  fallback: Fallback,
}: {
  fallback?: (props: { assignment: WhatIfAssignment }) => React.ReactNode
  edit: (props: { assignment: WhatIfAssignment }) => React.ReactNode
}) {
  return (ctx: CellContext<WhatIfAssignment, unknown>) => {
    const assignment = ctx.row.original
    if (
      assignment.state === WhatIfAssignmentState.REPLACED ||
      assignment.state === WhatIfAssignmentState.ADDED
    ) {
      return <Edit assignment={assignment} />
    }
    if (Fallback) {
      return <Fallback assignment={assignment} />
    }
  }
}

const columnDef = [
  columnHelper.accessor("name", {
    id: "name",
    header(ctx) {
      return <TableHeader ctx={ctx} title="Assignment" width="50%" />
    },
    cell(info) {
      return (
        <Text
          className={twMerge(
            info.row.original.disabled ? "line-through" : undefined,
            "select-all",
          )}
          c={info.row.original.disabled ? "dimmed" : undefined}
        >
          {info.getValue()}
        </Text>
      )
    },
    filterFn(info) {
      if (!info.original.ctx.filterResults) {
        return true
      }
      for (const { item } of info.original.ctx.filterResults) {
        if (item === info.original.name) {
          return true
        }
      }
      return false
    },
  }),
  columnHelper.accessor("scored", {
    id: "scored",
    header(ctx) {
      return <TableHeader ctx={ctx} title="Scored" width="10%" />
    },
    size: 200,
    cell: editableCell({
      fallback: ({ assignment }) =>
        assignment.scored !== undefined ? (
          <Text
            className="select-all"
            style={{
              color:
                assignment.scored !== undefined &&
                assignment.total !== undefined
                  ? Color.fromGrade(
                      (assignment.scored / assignment.total) * 100,
                    )
                  : undefined,
            }}
          >
            {assignment.scored}
          </Text>
        ) : undefined,
      edit: ({ assignment }) => (
        <NumberInput
          hideControls={assignment.ctx.layout === "mobile"}
          className="min-w-[50px]"
          defaultValue={assignment.scored}
          onBlur={(event) => {
            assignment.scored = Number.parseInt(event.currentTarget.value)
            if (Number.isNaN(assignment.scored)) {
              return
            }
            assignment.ctx.onUpdate(assignment)
          }}
        />
      ),
    }),
  }),
  columnHelper.accessor("total", {
    id: "total",
    header: (ctx) => <TableHeader ctx={ctx} title="Total" width="10%" />,
    size: 200,
    cell: editableCell({
      fallback: ({ assignment }) =>
        assignment.total !== undefined ? (
          <Text className="select-all">{assignment.total}</Text>
        ) : undefined,
      edit: ({ assignment }) => (
        <NumberInput
          hideControls={assignment.ctx.layout === "mobile"}
          className="min-w-[50px] select-all"
          defaultValue={assignment.total}
          onBlur={(event) => {
            assignment.total = Number.parseInt(event.currentTarget.value)
            if (Number.isNaN(assignment.total)) {
              return
            }
            assignment.ctx.onUpdate(assignment)
          }}
        />
      ),
    }),
  }),
  columnHelper.accessor("assignmentTypeName", {
    id: "assignmentTypeName",
    header: (ctx) => <TableHeader ctx={ctx} title="Category" width="20%" />,
    cell: editableCell({
      fallback: ({ assignment }) =>
        assignment.assignmentTypeName !== undefined ? (
          <Text className="select-all">{assignment.assignmentTypeName}</Text>
        ) : undefined,
      edit: ({ assignment }) => (
        <Select
          data={assignment.ctx.assignmentTypes}
          value={assignment.assignmentTypeName}
          onChange={(value) => {
            assignment.assignmentTypeName = value ?? undefined
            assignment.ctx.onUpdate(assignment)
          }}
        />
      ),
    }),
  }),
  columnHelper.accessor("time", {
    id: "time",
    cell: (ctx) => (
      <Text className="select-all">{format(ctx.getValue(), "MM/dd/yyyy")}</Text>
    ),
    header: (ctx) => <TableHeader ctx={ctx} title="Date" width="5%" />,
    sortingFn: (a, b) => compareAsc(a.getValue("time"), b.getValue("time")),
  }),
  columnHelper.accessor("state", {
    id: "category-action",
    header: () => <Table.Th />,
    cell: (info) => {
      const a = info.row.original
      const value: WhatIfAssignmentState = info.getValue()
      return (
        <ActionIcon
          variant="subtle"
          onClick={() => {
            switch (value) {
              case WhatIfAssignmentState.NORMAL:
                a.ctx.onEdit(a)
                break
              case WhatIfAssignmentState.ADDED:
                a.ctx.onDelete(a)
                break
              case WhatIfAssignmentState.REPLACED:
                a.ctx.onReset(a)
                break
            }
          }}
        >
          {value === WhatIfAssignmentState.NORMAL ? (
            <MdEdit />
          ) : value === WhatIfAssignmentState.REPLACED ? (
            <MdRestore size={18} />
          ) : (
            <MdDelete />
          )}
        </ActionIcon>
      )
    },
  }),
  columnHelper.display({
    id: "visibility-toggle",
    header: () => <Table.Th />,
    cell: (info) => {
      const a = info.row.original
      return (
        <ActionIcon
          variant="subtle"
          onClick={() => {
            a.ctx.onToggleVisibility(info.row.original)
          }}
          style={{ opacity: info.row.original.disabled ? 0.5 : 1 }}
        >
          {info.row.original.disabled ? (
            <MdVisibilityOff size={16} />
          ) : (
            <MdVisibility size={16} />
          )}
        </ActionIcon>
      )
    },
  }),
]

function WhatIfAssignmentTable(props: {
  filterString?: string
  assignments: WhatIfAssignment[]
}) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "time",
      desc: true,
    },
  ])

  const columnFilters = useMemo((): ColumnFilter[] => {
    return [
      {
        id: "name",
        value: props.filterString,
      },
    ]
  }, [props.filterString])

  const table = useReactTable<WhatIfAssignment>({
    columns: columnDef,
    data: props.assignments,
    getCoreRowModel: coreRowModel,
    getFilteredRowModel: filteredRowModel,
    getSortedRowModel: coreSortedRowModel,
    state: { sorting, columnFilters },
    onSortingChange: (state) => setSorting(state),
  })

  const sortedRowModel = table.getSortedRowModel()

  const bodyRef = createRef<HTMLTableElement>()

  return (
    <Table
      className="block max-h-[500px] overflow-y-auto border-collapse"
      ref={bodyRef}
    >
      <Table.Tbody>
        {sortedRowModel.rows.map((row) => {
          return (
            <Table.Tr key={row.original.index}>
              {row.getAllCells().map((cell) => {
                return (
                  <Table.Td className="text-sm" key={cell.column.id + row.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                )
              })}
            </Table.Tr>
          )
        })}
      </Table.Tbody>
      {/* <thead> is after <tbody> because otherwise buttons will float above headers */}
      <Table.Thead className="sticky top-0">
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Tr className="backdrop-blur-sm" key={headerGroup.id}>
            {headerGroup.headers.map((header) =>
              header.isPlaceholder ? (
                <Table.Thead key={header.id} />
              ) : (
                <Fragment key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Fragment>
              ),
            )}
          </Table.Tr>
        ))}
      </Table.Thead>
    </Table>
  )
}

function GradeColorKey(props: {
  className?: string
}) {
  return (
    <div className={twMerge("flex gap-2 min-w-[5rem]", props.className)}>
      <ColorKey
        classNames={{ label: "whitespace-nowrap" }}
        color={Color.CUSTOM.lightGreen}
        label="≥ 85%"
      />
      <ColorKey
        classNames={{ label: "whitespace-nowrap" }}
        color={Color.CUSTOM.orange}
        label="≥ 75%"
      />
      <ColorKey
        classNames={{ label: "whitespace-nowrap" }}
        color={Color.CUSTOM.red}
        label="< 75%"
      />
      <InfoTooltip message="Each assignment in the table will be given a color, the grade you got on the assignment (which is scored points divided by total points) corresponds to the colors in the key." />
    </div>
  )
}

type WhatIfTableContext = {
  layout: MacroLayouts
  filterResults: FuseResult<string>[] | undefined
  assignmentTypes: string[]
  onToggleVisibility: (assignment: WhatIfAssignment) => void
  onEdit: (assignment: WhatIfAssignment) => void
  onUpdate: (assignment: WhatIfAssignment) => void
  onReset: (assignment: WhatIfAssignment) => void
  onDelete: (assignment: WhatIfAssignment) => void
}

export function WhatIfInterface(props: {
  parentSpan: Span
  course: Course
  assignmentTypes: BaseAssignmentType[]
}) {
  useSignals()

  const [, startTransition] = useTransition()
  const span = useSpan(fnSpan, props.parentSpan, "what-if")

  const layout = useCalculatorLayout()

  const course = useSignal(props.course)
  const assignmentTypes = useSignal(props.assignmentTypes)

  const addedAssignments = useSignal<WhatIfAssignment[]>([])
  const replacedAssignments = useSignal<Record<string, WhatIfAssignment>>({})
  const disabledAssignments = useSignal<number[]>([])
  const filterString = useSignal("")

  useEffect(() => {
    course.value = props.course
    addedAssignments.value = []
    replacedAssignments.value = {}
    disabledAssignments.value = []
    filterString.value = ""
  }, [
    addedAssignments,
    replacedAssignments,
    disabledAssignments,
    filterString,
    course,
    props.course,
  ])
  useEffect(() => {
    assignmentTypes.value = props.assignmentTypes
  }, [assignmentTypes, props.assignmentTypes])

  const ctx = useComputed<WhatIfTableContext>(() => ({
    layout,
    filterResults: [],
    assignmentTypes: [],
    onToggleVisibility: (assignment) => {
      startTransition(() => {
        assignment.disabled = !assignment.disabled
        switch (assignment.state) {
          case WhatIfAssignmentState.ADDED: {
            addedAssignments.value = [...addedAssignments.value]
            break
          }
          case WhatIfAssignmentState.REPLACED: {
            replacedAssignments.value[assignment.index] = assignment
            replacedAssignments.value = { ...replacedAssignments.value }
            break
          }
          case WhatIfAssignmentState.NORMAL:
            if (assignment.disabled) {
              disabledAssignments.value = [
                ...disabledAssignments.value,
                assignment.index,
              ]
              return
            }
            disabledAssignments.value = disabledAssignments.value.filter(
              (v) => v !== assignment.index,
            )
            break
        }
      })
    },
    onUpdate: (a) => {
      startTransition(() => {
        replacedAssignments.value = {
          ...replacedAssignments.value,
          [a.index]: a,
        }
      })
    },
    onEdit: (a) => {
      startTransition(() => {
        a.state = WhatIfAssignmentState.REPLACED
        replacedAssignments.value = {
          ...replacedAssignments.value,
          [a.index]: a,
        }
      })
    },
    onReset: (a) => {
      startTransition(() => {
        const { [a.index]: _, ...without } = replacedAssignments.value
        replacedAssignments.value = without
      })
    },
    onDelete: (deleted) => {
      startTransition(() => {
        addedAssignments.value = addedAssignments.value.filter((a) => {
          return a.index !== deleted.index
        })
      })
    },
  }))

  const baseAssignments = useComputed(() => {
    return course.value.assignments.map((a, i): WhatIfAssignment => {
      const value: WhatIfAssignment = {
        index: i,
        name: a.name,
        assignmentTypeName: a.assignmentTypeName,
        time: a.time,
        scored: a.scored,
        total: a.total,
        state: WhatIfAssignmentState.NORMAL,
        disabled: false,
        ctx: ctx.value,
      }
      return value
    })
  })

  const editedAssignments = useComputed(() => {
    return baseAssignments.value.map((a, i): WhatIfAssignment => {
      const value: WhatIfAssignment = {
        ...a,
        disabled: disabledAssignments.value.includes(i),
      }
      Object.assign(value, replacedAssignments.value[i])
      return value
    })
  })

  const whatIfAssignments = useComputed(() => {
    const totalCount: {
      assignmentTypeName?: string
      assignments: WhatIfAssignment[]
    }[] = []

    for (const assignment of addedAssignments.value) {
      const counter = totalCount.find(
        (v) => v.assignmentTypeName === assignment.assignmentTypeName,
      )
      if (counter) {
        counter.assignments.push(assignment)
        continue
      }
      totalCount.push({
        assignmentTypeName: assignment.assignmentTypeName,
        assignments: [assignment],
      })
    }

    for (const group of totalCount) {
      let i = 1
      for (const assignment of group.assignments) {
        assignment.name = `+ ${
          assignment.assignmentTypeName
            ? assignment.assignmentTypeName
            : "Unknown"
        } | ${i}/${group.assignments.length}`
        i++
      }
    }

    return [...addedAssignments.value, ...editedAssignments.value]
  })

  const assignmentTypeNames = useComputed(() =>
    assignmentTypes.value.map((a) => a.name),
  )

  const beforeCategories = useComputed(() =>
    calculateGradeCategories(course.value.assignments, assignmentTypes.value),
  )

  const afterCategories = useComputed(() => {
    const disabledIgnored: WhatIfAssignment[] = []

    for (const assignment of whatIfAssignments.value) {
      if (!assignment.disabled) {
        disabledIgnored.push(assignment)
        continue
      }
      if (assignment.state !== WhatIfAssignmentState.REPLACED) {
        continue
      }
      const original = baseAssignments.value.find(
        (a) => a.index === assignment.index,
      )
      if (!original) {
        span.addEvent("Base assignment is missing.", {
          "log.severity": "error",
          baseAssignments: JSON.stringify(baseAssignments),
          assignment: JSON.stringify(assignment),
        })
        continue
      }
      disabledIgnored.push(original)
    }

    return calculateGradeCategories(disabledIgnored, assignmentTypes.value)
  })

  const addedAssignmentsIdOffset = useRef(props.course.assignments.length)

  function addAssignment() {
    startTransition(() => {
      addedAssignments.value = [
        ...addedAssignments.value,
        {
          index: addedAssignmentsIdOffset.current++,
          name: "",
          time: new Date(),
          state: WhatIfAssignmentState.ADDED,
          disabled: false,
          ctx: ctx.value,
        },
      ]
    })
  }

  const fuse = useComputed(() => {
    if (!whatIfAssignments.value) {
      return
    }
    return new Fuse(whatIfAssignments.value.map((a) => a.name))
  })

  const filterResults = useComputed(() => {
    if (!filterString.value || !fuse.value) {
      return
    }
    return fuse.value.search(filterString.value)
  })

  ctx.value.filterResults = filterResults.value
  ctx.value.assignmentTypes = assignmentTypeNames.value

  const beforeSections = useComputed(() =>
    getSectionsFromCategories(beforeCategories.value, true),
  )
  const afterSections = useComputed(() =>
    getSectionsFromCategories(afterCategories.value, true),
  )

  return (
    <>
      {/* Before & After calculation */}
      <Panel className="flex flex-col gap-6 min-h-[300px]">
        <div className="flex flex-col gap-5">
          <Title order={4}>Before</Title>
          <RingProgressPicker
            className="m-auto"
            sections={beforeSections.value}
            disabled
          />
          <Title order={4}>After</Title>
          <RingProgressPicker
            className="m-auto"
            sections={afterSections.value}
            disabled
          />
        </div>
      </Panel>

      {/* Horizontal bar */}
      <Panel
        className={twMerge(
          "flex gap-3 p-2 justify-between items-center",
          layout === "desktop" ? "col-span-2" : "col-span-1",
        )}
        noPadding
      >
        <TextInput
          placeholder="Search"
          leftSection={<MdSearch size={20} />}
          value={filterString.value}
          onChange={(value) => {
            filterString.value = value.currentTarget.value
          }}
        />

        {/* Desktop color key */}
        {layout === "desktop" ? <GradeColorKey /> : undefined}

        <div className="flex gap-3">
          {layout === "mobile" ? (
            <ActionIcon
              variant="filled"
              c="blueGray"
              size="lg"
              onClick={addAssignment}
            >
              <MdAdd size={20} />
            </ActionIcon>
          ) : (
            <Button
              className="w-fit"
              leftSection={<MdAdd size={20} />}
              onClick={addAssignment}
            >
              Assignment
            </Button>
          )}
        </div>
      </Panel>

      {/* What-If Table */}
      <Panel
        className={twMerge(
          "overflow-hidden min-w-0",
          layout === "desktop" ? "col-span-2" : "col-span-1",
        )}
        noPadding
      >
        <WhatIfAssignmentTable
          filterString={filterString.value}
          assignments={whatIfAssignments.value}
        />
      </Panel>

      {/* Mobile color key */}
      {layout === "mobile" ? (
        <Panel className="flex">
          <GradeColorKey className="m-auto" />
        </Panel>
      ) : undefined}
    </>
  )
}
