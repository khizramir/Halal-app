import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import PrayerTimes from './pages/PrayerTimes'
import Qibla from './pages/Qibla'
import Restaurants from './pages/Restaurants'
import Scanner from './pages/Scanner'
import Calendar from './pages/Calendar'
import Adhkar from './pages/Adhkar'
import Zakat from './pages/Zakat'
import Submit from './pages/Submit'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="prayer-times" element={<PrayerTimes />} />
        <Route path="qibla" element={<Qibla />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="adhkar" element={<Adhkar />} />
        <Route path="zakat" element={<Zakat />} />
        <Route path="submit" element={<Submit />} />
      </Route>
    </Routes>
  )
}

export default App
