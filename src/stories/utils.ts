const now = new Date()

export function unixDateXDaysBeforeNow(dayOffset: number) {
  return BigInt(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOffset,
    ).getTime() / 1000,
  )
}
