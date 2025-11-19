export const REACTION_OPTIONS = [
  { id: 'LIKE', label: 'Like', emoji: '👍', color: 'text-sky-600' },
  { id: 'LOVE', label: 'Love', emoji: '❤️', color: 'text-rose-500' },
  { id: 'CARE', label: 'Care', emoji: '🥰', color: 'text-orange-500' },
  { id: 'HAHA', label: 'Haha', emoji: '😂', color: 'text-amber-400' },
  { id: 'WOW', label: 'Wow', emoji: '😮', color: 'text-amber-500' },
  { id: 'ANGRY', label: 'Angry', emoji: '😡', color: 'text-red-500' },
]

export const REACTION_KEY_SET = REACTION_OPTIONS.reduce((map, option) => {
  map[option.id] = option.id.toLowerCase()
  return map
}, {})

export const getReactionMeta = (reactionId) =>
  REACTION_OPTIONS.find((option) => option.id === reactionId?.toUpperCase())
