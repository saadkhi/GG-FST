import { useState } from 'react'
import UploadPage from './UploadPage'
import ChatPage from './ChatPage'

function App() {
  const [storeId, setStoreId] = useState('')
  const [fileName, setFileName] = useState('')

  return (
    <div>
      <h1 style={{  }}>Document Chat</h1>
      {!storeId ? (
        <UploadPage onUpload={(id, name) => {
          setStoreId(id);
          setFileName(name);
        }} />
      ) : (
        <ChatPage storeId={storeId} fileName={fileName} />
      )}
    </div>
  )
}

export default App