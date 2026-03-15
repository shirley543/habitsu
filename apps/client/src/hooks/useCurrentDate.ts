import { useState } from 'react'

export function useCurrentDate({ tz = 'UTC' } = {}) {
  const [currentDate] = useState(new Date())

  // Returns date adjusted to timezone
  const tzDate = new Date(currentDate.toLocaleString('en-US', { timeZone: tz }))
  return tzDate
}

export function useCurrentYear({ tz = 'UTC' } = {}) {
  const currentDate = useCurrentDate({ tz: tz })
  return currentDate.getFullYear()
}
