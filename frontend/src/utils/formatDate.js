const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function formatPostTimestamp(value) {
  if (!value) return 'now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'now'
  if (diffMinutes === 1) return '1 min'
  if (diffMinutes < 60) return `${diffMinutes} min`
  if (diffHours === 1) return '1 h'
  if (diffHours < 24) return `${diffHours} h`
  if (diffDays === 1) return 'Yesterday'

  const day = date.getDate()
  const month = MONTH_NAMES[date.getMonth()]
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${day} ${month} at ${hours}:${minutes}`
}
