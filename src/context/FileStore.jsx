import { createContext, useContext, useState } from 'react'

const FileStoreContext = createContext(null)

export function FileStoreProvider({ children }) {
  const [files, setFiles] = useState([])

  const sendFile = (fileData) => {
    setFiles(prev => [...prev, { ...fileData, id: Date.now(), status: 'pending' }])
  }

  const updateStatus = (id, status) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status } : f))
  }

  return (
    <FileStoreContext.Provider value={{ files, sendFile, updateStatus }}>
      {children}
    </FileStoreContext.Provider>
  )
}

export const useFileStore = () => useContext(FileStoreContext)
