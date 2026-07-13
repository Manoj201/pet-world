import { BrowserRouter, Route, Routes } from 'react-router-dom'

function Home() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <h1 className="text-2xl font-medium">Pet World</h1>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
