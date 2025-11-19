import { useMemo, useState } from 'react'
import { REACTION_OPTIONS, getReactionMeta } from '../../constants/reactions'
import { buildAvatarFallback } from '../../utils/avatar'

const DEFAULT_ICON = { id: 'ALL', label: 'All', emoji: '✨' }

function AvatarBubble({ person }) {
  if (person.avatar) {
    return <img src={person.avatar} alt={person.name} className="h-10 w-10 rounded-full object-cover" />
  }
  const fallback = buildAvatarFallback(person.name)
  return (
    <div
      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${fallback.bg} ${fallback.text}`}
      aria-label={person.name}
    >
      {fallback.initials}
    </div>
  )
}

export default function ReactionList({ visible, onClose, people = [] }) {
  if (!visible) return null

  const enrichedPeople = useMemo(
    () =>
      people.map((person) => ({
        ...person,
        reaction: (person.reaction || person.type || 'LIKE').toUpperCase(),
      })),
    [people],
  )

  const reactionCounts = useMemo(() => {
    const counts = enrichedPeople.reduce(
      (acc, person) => {
        const key =
          REACTION_OPTIONS.find((option) => option.id === person.reaction)?.id || 'LIKE'
        acc[key] = (acc[key] || 0) + 1
        acc.ALL += 1
        return acc
      },
      { ALL: 0 },
    )
    return counts
  }, [enrichedPeople])

  const filterOptions = useMemo(
    () => [
      { ...DEFAULT_ICON, count: reactionCounts.ALL },
      ...REACTION_OPTIONS.filter((option) => reactionCounts[option.id]).map((option) => ({
        ...option,
        count: reactionCounts[option.id],
      })),
    ],
    [reactionCounts],
  )

  const [activeFilter, setActiveFilter] = useState('ALL')

  const visiblePeopleList =
    activeFilter === 'ALL'
      ? enrichedPeople
      : enrichedPeople.filter((person) => person.reaction === activeFilter)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">People who reacted to this</h3>
          <button className="text-sm text-slate-400 hover:text-slate-600" onClick={onClose}>
            Close
          </button>
        </div>
        {filterOptions.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition ${
                  activeFilter === option.id
                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-700'
                }`}
              >
                <span className="text-lg">{option.emoji}</span>
                <span>{option.label}</span>
                <span className="text-xs font-semibold text-slate-500">{option.count}</span>
              </button>
            ))}
          </div>
        )}
        {visiblePeopleList.length === 0 ? (
          <p className="text-sm text-slate-500">No reactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {visiblePeopleList.map((person) => {
              const meta = getReactionMeta(person.reaction)
              return (
                <li key={person.id || person.name} className="flex items-center gap-3">
                  <AvatarBubble person={person} />
                  <div>
                    <p className="font-medium text-slate-800">{person.name}</p>
                    {person.headline && <p className="text-sm text-slate-500">{person.headline}</p>}
                  </div>
                  {meta && (
                    <span className={`ml-auto text-lg ${meta.color}`} title={meta.label}>
                      {meta.emoji}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
