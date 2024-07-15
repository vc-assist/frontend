export type GradeCategoryMetadata = {
  earnedPoints: number
  totalPoints: number
  weight: number
}

export type GradeCategories = Record<string, GradeCategoryMetadata>

// Grade from score calculation:
// cat_grade = (s1 + s2 + s3 + ...) / (t1 + t2 + t3 + ...)
// overall_grade = w1 * cat_grade_1 + w2 * cat_grade_2  + ...

export type BaseAssignment = {
  name: string
  scored?: number
  total?: number
  assignmentTypeName?: string
}

export type BaseAssignmentType = {
  name: string
  weight: number
}

export function calculateGradeCategories(
  assignments: BaseAssignment[],
  assignmentTypes: BaseAssignmentType[],
): GradeCategories {
  const categoryAggregation = new Map<
    string,
    {
      sum: number
      total: number
    }
  >()

  const courseAssignmentTypeRecord = new Map<string, number>()
  for (const assignType of assignmentTypes) {
    courseAssignmentTypeRecord.set(assignType.name, assignType.weight)
  }
  for (const category of courseAssignmentTypeRecord.keys()) {
    categoryAggregation.set(category, {
      sum: 0,
      total: 0,
    })
  }

  for (const a of assignments) {
    if (
      a.scored === undefined ||
      a.total === undefined ||
      a.assignmentTypeName === undefined
    ) {
      continue
    }

    const assignmentType = categoryAggregation.get(a.assignmentTypeName)
    if (!assignmentType) {
      continue
    }
    assignmentType.sum += a.scored
    assignmentType.total += a.total
  }

  const result: GradeCategories = {}
  for (const [category, aggregation] of categoryAggregation.entries()) {
    const assignmentTypeWeight = courseAssignmentTypeRecord.get(category)
    if (!assignmentTypeWeight) {
      continue
    }
    result[category] = {
      earnedPoints: aggregation.sum,
      totalPoints: aggregation.total,
      weight: assignmentTypeWeight,
    }
  }

  return result
}

export function calculateOverallGrade(information: GradeCategories): number {
  let overallGrade = 0
  let weightSum = 0

  for (const category in information) {
    const info = information[category]
    if (info.totalPoints === 0) {
      continue
    }
    weightSum += info.weight
    overallGrade += (info.earnedPoints / info.totalPoints) * info.weight
  }

  // simplification of: overallGrade * 1 / weightSum
  return overallGrade / weightSum
}

export type PointsForGradeInput = {
  category: string
  pointValue: number
  targetGrade: number
}

// Score for grade formula derivation:
// target_grade = w1 * (s1 + s2 + s3 + ... + {S}) / (t1 + t2 + t3 + ... + p_value) + w2 * cat_grade_2 + ...
// (target_grade - w2 * cat_grade_2 - ...) = w1 * (s1 + s2 + s3 + ... + {S}) / (t1 + t2 + t3 + ... + p_value)
// (t1 + t2 + t3 + ... + p_value) * (target_grade - w2 * cat_grade_2 - ...) = w1 * (s1 + s2 + s3 + ... + {S})
// (t1 + t2 + t3 + ... + p_value) * (target_grade - w2 * cat_grade_2 - ...) / w1 = s1 + s2 + s3 + ... + {S}
// (t1 + t2 + t3 + ... + p_value) * (target_grade - w2 * cat_grade_2 - ...) / w1 - (s1 + s2 + s3 + ...) = {S}

export function calculatePointsForGrade(
  information: GradeCategories,
  input: PointsForGradeInput,
): number {
  const totalOtherWeight = 1 - information[input.category].weight

  let otherWeightedSum = 0
  let weightSum = 0
  for (const category in information) {
    if (category === input.category) {
      continue
    }
    const info = information[category]
    if (info.totalPoints === 0) {
      continue
    }
    otherWeightedSum += (info.earnedPoints / info.totalPoints) * info.weight
    weightSum += info.weight
  }
  otherWeightedSum *= totalOtherWeight / weightSum

  const final =
    ((information[input.category].totalPoints + input.pointValue) *
      (input.targetGrade - otherWeightedSum)) /
      information[input.category].weight -
    information[input.category].earnedPoints

  // return final > 0 && final < input.pointValue ? final : -1;
  return final
}
