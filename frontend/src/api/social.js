import { apiClient } from './client'

const unwrap = (promise) => promise.then((res) => res.data)

export const socialApi = {
  listPosts: (config) => unwrap(apiClient.get('/posts', config)),
  createPost: (payload) => unwrap(apiClient.post('/posts', payload)),
  addComment: (postId, payload) => unwrap(apiClient.post(`/posts/${postId}/comments`, payload)),
  toggleReaction: (postId, type = 'LIKE') =>
    unwrap(
      apiClient.post(`/posts/${postId}/reactions`, {
        type: type ? type.toUpperCase() : null,
      }),
    ),
  getProfile: (userId) => unwrap(apiClient.get(`/users/${userId}`)),
  updateProfile: (payload) => unwrap(apiClient.put('/users/me', payload)),
  listNotifications: () => unwrap(apiClient.get('/notifications')),
  markNotificationRead: (notificationId) => unwrap(apiClient.post(`/notifications/${notificationId}/read`)),
  listMessages: () => unwrap(apiClient.get('/messages')),
  sendMessage: (payload) => unwrap(apiClient.post('/messages', payload)),
}
