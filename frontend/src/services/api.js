import axios from 'axios'

const defaultBaseURL = import.meta.env.DEV ? 'http://localhost:8080/api' : '/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sg_token')
    }
    return Promise.reject(error)
  },
)

export default api
