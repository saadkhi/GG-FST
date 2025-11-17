import { useState } from 'react'
import UploadPage from './UploadPage'
import ChatPage from './ChatPage'

function App() {
  const [storeId, setStoreId] = useState('')

  return (
    <div>
      <h1>Document Chat</h1>
      {!storeId ? (
        <UploadPage onUpload={setStoreId} />
      ) : (
        <ChatPage storeId={storeId} />
      )}
    </div>
  )
}

export default App