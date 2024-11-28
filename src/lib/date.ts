export function dateFromUnix(unix: bigint): Date {
  return new Date(Number(unix) * 1000)
}
