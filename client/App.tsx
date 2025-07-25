import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NyxOS } from '@/components/os/SamOS'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SamOS />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
