import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL,
})

export const getPhotos = async () => {
  const response = await api.get('/photos/')
  return response.data
}

export const uploadPhoto = async ({ file, title }) => {
  const formData = new FormData()
  formData.append('title', title || file.name)
  formData.append('image', file)

  const response = await api.post('/photos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export default api


