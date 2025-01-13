//this file exports global settings for the entire app 
//Authored by Bryan Hu CO 2027 
import { atomWithStorage } from "jotai/utils"

export const settings = {
  dashboard: {
    hideGPA: atomWithStorage("settings.dashboard-hide-gpa", false),
    hideGrades: atomWithStorage("settings.dashboard-hide-grades", false),
    disableGradeVisualizers: atomWithStorage(
      "settings.dashboard-disable-grade-visualizers",
      false,
    ),
  },
}
