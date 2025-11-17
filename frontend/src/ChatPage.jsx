// Update ChatPage.jsx
import { useState } from 'react'
import axios from 'axios'

export default function ChatPage({ storeId, fileName }) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async () => {
    if (!query.trim()) {
      setError('Please enter a question')
      return
    }

    setIsLoading(true)
    setError('')
    
    const form = new FormData()
    form.append("store_id", storeId)
    form.append("prompt", query)

    try {
      const res = await axios.post("http://localhost:8000/chat", form)
      setAnswer(res.data.answer)
      setSources(res.data.sources || [])
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error getting response. Please try again.'
      setError(errorMsg)
      console.error("Error getting response:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Chat with Your Document</h2>
        {fileName && (
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '8px 12px',
            borderRadius: '16px',
            fontSize: '0.9em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📄</span>
            <span style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} 
                  title={fileName}>
              {fileName}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <textarea
          rows="4"
          placeholder="Ask something about your document..."
          onChange={(e) => {
            setQuery(e.target.value)
            setError('')
          }}
          style={{ 
            width: '100%', 
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
          disabled={isLoading}
        />
      </div>

      <button 
        onClick={ask} 
        disabled={isLoading || !query.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: (isLoading || !query.trim()) ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Thinking...' : 'Ask'}
      </button>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
      )}

      {answer && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3>Answer:</h3>
          <p style={{ whiteSpace: 'pre-wrap' , alignContent: 'center'}}>{answer}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h4>Sources:</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {sources.map((source, i) => (
              <li key={i} style={{ 
                padding: '8px', 
                margin: '5px 0', 
                backgroundColor: '#f0f0f0',
                borderRadius: '4px'
              }}>
                {source}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}