const PALETTES = [
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-sky-100', text: 'text-sky-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-lime-100', text: 'text-lime-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-slate-200', text: 'text-slate-700' },
]

const pickPalette = (seed = 'user') => {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PALETTES[hash % PALETTES.length] || PALETTES[0]
}

export const buildInitials = (name = 'User') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'U'

export const buildAvatarFallback = (name = 'User') => {
  const initials = buildInitials(name)
  const palette = pickPalette(name)
  return { initials, ...palette }
}
