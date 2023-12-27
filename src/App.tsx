import { Route, Routes } from 'react-router-dom'
import './App.css'
import './animations.css'
import { StartPage } from './screens/StartPage'
import { GamePage } from './screens/GamePage'
import { ScorePage } from './screens/ScorePage'


function App() {

  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/play" element={<GamePage />} />
      <Route path="/score" element={<ScorePage />} />
    </Routes>
  )
}

export default App
