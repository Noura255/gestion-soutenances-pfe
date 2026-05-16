import api from './api'

export async function downloadFromApi(url, filename) {
  const { data } = await api.get(url, { responseType: 'blob' })
  const href = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}
