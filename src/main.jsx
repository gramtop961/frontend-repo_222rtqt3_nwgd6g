import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Test from './Test'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home and marketing sections */}
        <Route path="/" element={<App />} />
        {/* Route for room pages so direct links like /room/ABC123 work without errors */}
        <Route path="/room/:code" element={<App />} />
        {/* Diagnostics page */}
        <Route path="/test" element={<Test />} />
        {/* Fallback to App for any unmatched routes */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
