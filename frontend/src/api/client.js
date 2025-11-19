import axios from 'axios'
import { AUTH_EVENTS, emitAuthEvent } from '../utils/authEvents'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
    const status = error.response?.status
    if (status === 401) {
      emitAuthEvent({ type: AUTH_EVENTS.UNAUTHORIZED, message: message || 'Session expired' })
    }
    if (message) {
      // eslint-disable-next-line no-console
      console.warn('API error:', message)
    }
    return Promise.reject(error)
  },
)
