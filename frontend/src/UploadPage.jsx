// Update UploadPage.jsx
import { useState } from 'react'
import axios from 'axios'

export default function UploadPage({ onUpload }) {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsLoading(true)
    setError('')
    
    const form = new FormData()
    form.append("file", file)

    try {
      const res = await axios.post("http://localhost:8000/upload", form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      onUpload(res.data.store_id)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Upload failed. Please try again.'
      setError(errorMsg)
      console.error("Upload failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Upload a Document</h2>
      <form onSubmit={upload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <input
            type="file"
            onChange={(e) => {
              setFile(e.target.files[0])
              setError('')
            }}
            accept=".pdf,.txt,.doc,.docx"
            disabled={isLoading}
          />
        </div>
        
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        <button 
          type="submit" 
          disabled={isLoading || !file}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '200px'
          }}
        >
          {isLoading ? 'Uploading...' : 'Upload & Process'}
        </button>
      </form>
    </div>
  )
}