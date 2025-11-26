import './App.css'

import { useEffect, useRef, useState } from 'react'
import { getPhotos, uploadPhoto } from './api'

function App() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getPhotos()
      setPhotos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Something went wrong while loading photos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Allow selecting the same file again later
    event.target.value = ''

    try {
      setUploading(true)
      setError('')

      const created = await uploadPhoto({ file, title: file.name })

      if (created && created.id) {
        setPhotos((prev) => [created, ...prev])
      } else {
        // If the API shape changes or doesn't return the created object,
        // fall back to reloading the full list.
        fetchPhotos()
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong while uploading')
    } finally {
      setUploading(false)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Aura Vault</h1>
        <div className="upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <button
            type="button"
            className="upload-button"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </header>

      <main className="gallery">
        {loading ? (
          <p className="status-text">Loading photos...</p>
        ) : photos.length === 0 ? (
          <p className="status-text">
            No photos yet. Upload an image to get started.
          </p>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              <article key={photo.id} className="photo-card">
                <div className="image-wrapper">
                  <img
                    src={photo.image}
                    alt={photo.title || 'Aura Vault photo'}
                    loading="lazy"
                  />
                </div>
                {(photo.title || photo.uploaded_at) && (
                  <div className="photo-meta">
                    {photo.title && (
                      <h2 className="photo-title">{photo.title}</h2>
                    )}
                    {photo.uploaded_at && (
                      <p className="photo-date">
                        {formatDateTime(photo.uploaded_at)}
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
