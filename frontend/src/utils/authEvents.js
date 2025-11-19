const subscribers = new Set()

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'unauthorized',
}

export function subscribeAuthEvents(listener) {
  subscribers.add(listener)
  return () => subscribers.delete(listener)
}

export function emitAuthEvent(event) {
  subscribers.forEach((listener) => {
    try {
      listener(event)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Auth event listener failed', err)
    }
  })
}
