export type Assignment = {
  name: string

  time?: Date
  description?: string
  missing?: boolean
  submitted?: boolean
  scored?: number
  total?: number
  assignmentTypeName?: string
}

export type CourseMeeting = {
  startTime: Date
  endTime: Date
}

export type AssignmentType = {
  name: string
  weight: number
}

export type GradeSnapshot = {
  time: Date
  value: number
}

export type CourseProperties = Partial<{
  overallGrade: number
  teacher: string
  teacherEmail: string
  remoteMeetingLink: string
  room: string
  dayName: string
  homeworkPasses: number
}>

export type Course = {
  name: string
  props?: CourseProperties
  meetings?: CourseMeeting[]
  assignmentTypes?: AssignmentType[]
  assignments?: Assignment[]
  snapshots?: GradeSnapshot[]
}

export type StudentData = {
  gpa: number
  courses: Course[]
  dayNames: string[]
}

// then a "linking" system between structured moodle and powerschool
// perhaps it will be specific to VCHS I don't know
// but it will contain mappings from moodle course ids to powerschool course ids
// vcassist frontend will query from this service
//
// moodle/powerschool services will not have all courses + ids all at once
// so they both must provide api endpoints for querying the known courses for the "linking system"
//
// the "linking" system will probably also link weights to the correct "unified" course,
// which contains a reference to a moodle guid and powerschool guid
//
// automatic linking between powerschool and moodle (by exact match)
// will first be attempted, then default to manual control
//
// in the case that a link doesn't yet exist, or can't exist. the linking system
// will do it's best to fill in all the data.

