import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin } from 'lucide-react'

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim() || location.trim()) {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append('search', searchTerm.trim())
      if (location.trim()) params.append('city', location.trim())
      navigate(`/search?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Que recherchez-vous ? (ex: restaurant, médecin, école...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="sm:w-64 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Où ? (ex: Kinshasa, Lubumbashi...)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary whitespace-nowrap"
        >
          Rechercher
        </button>
      </div>
    </form>
  )
}

export default SearchBar
