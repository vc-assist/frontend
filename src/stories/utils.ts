const now = new Date()

export function unixDateXDaysBeforeNow(dayOffset: number, hours?: number, minutes?: number) {
  return BigInt(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOffset,
      hours,
      minutes,
    ).getTime() / 1000,
  )
}
