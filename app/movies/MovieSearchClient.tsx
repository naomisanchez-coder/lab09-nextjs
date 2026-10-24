'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

interface MovieDetail {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: Array<{ Source: string; Value: string }>
  Metascore: string
  imdbRating: string
  Type: string
}

const API_KEY = 'f1def80d'

export default function MovieSearchClient({ initialMovies }: { initialMovies: Movie[] }) {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [loading, setLoading] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null)
  const [loadingModal, setLoadingModal] = useState(false)

  // Buscador interactivo en tiempo real con debounce en el cliente (CSR)
  useEffect(() => {
    if (!query.trim()) {
      setMovies(initialMovies)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`)
        if (res.data.Response === 'True') {
          setMovies(res.data.Search)
        } else {
          setMovies([])
        }
      } catch (error) {
        console.error('Error al buscar películas:', error)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query, initialMovies])

  // Obtener detalle completo de la película seleccionada para la Modal
  const handleOpenModal = async (imdbID: string) => {
    setLoadingModal(true)
    try {
      const res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`)
      if (res.data.Response === 'True') {
        setSelectedMovie(res.data)
      }
    } catch (error) {
      console.error('Error al obtener detalles:', error)
    } finally {
      setLoadingModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner / Header estilo Cine */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xs tracking-wider uppercase">
                CineApp + Next.js
              </span>
              <span className="text-slate-400 text-xs">OMDb API</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500">
              🎬 Cartelera & Películas
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explora las mejores películas y series con renderizado híbrido SSR y CSR.
            </p>
          </div>

          {/* Input de Búsqueda CSR */}
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Buscar película o serie (ej: Batman, Suits)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-800 text-white placeholder-slate-400 rounded-2xl border-2 border-slate-700 focus:border-red-500 focus:outline-none transition shadow-inner text-sm"
            />
            <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔎</span>
          </div>
        </header>

        {/* Indicador de estado */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {query ? `🔎 Resultados para "${query}"` : '🔥 Películas Populares Destacadas (SSR)'}
            {loading && <span className="text-xs text-red-400 animate-pulse">(Buscando...)</span>}
          </h2>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700">
            {movies.length} Títulos encontrados
          </span>
        </div>

        {/* Grid de Películas */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl h-80 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <p className="text-5xl mb-3">🎬</p>
            <p className="text-lg font-semibold text-slate-300">No se encontraron resultados</p>
            <p className="text-slate-500 text-sm mt-1">Intenta buscando con otra palabra clave en inglés.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((item) => (
              <div
                key={item.imdbID}
                onClick={() => handleOpenModal(item.imdbID)}
                className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
                  <img
                   src={item.Poster !== 'N/A' ? item.Poster : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop'}
                 alt={item.Title}
                 onError={(e) => {
                 e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop'
                 }}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 uppercase">
                    {item.Type}
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-red-400 transition line-clamp-2">
                      {item.Title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>📅 {item.Year}</span>
                    <span className="text-red-400 font-semibold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalle */}
        {(selectedMovie || loadingModal) && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
              
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition"
              >
                ✕
              </button>

              {loadingModal ? (
                <div className="py-20 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500 mx-auto"></div>
                  <p className="mt-4 text-slate-400 text-sm font-semibold">Cargando detalles de OMDb...</p>
                </div>
              ) : selectedMovie && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img
                      src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://via.placeholder.com/300x450?text=Sin+Imagen'}
                      alt={selectedMovie.Title}
                      className="w-full rounded-2xl border border-slate-800 shadow-lg object-cover"
                    />
                    <div className="mt-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center">
                      <p className="text-xs text-slate-400">IMDb Rating</p>
                      <p className="text-2xl font-black text-yellow-400 mt-0.5">⭐ {selectedMovie.imdbRating} / 10</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                          {selectedMovie.Type.toUpperCase()}
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-md">
                          {selectedMovie.Rated}
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-md">
                          ⏱️ {selectedMovie.Runtime}
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-black text-white">{selectedMovie.Title}</h2>
                      <p className="text-xs text-slate-400 mt-1">Estreno: {selectedMovie.Released} | {selectedMovie.Genre}</p>

                      <div className="mt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinopsis</h4>
                        <p className="text-sm text-slate-300 mt-1 leading-relaxed">{selectedMovie.Plot}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mt-4 text-xs text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p><strong className="text-slate-400">Director:</strong> {selectedMovie.Director}</p>
                        <p><strong className="text-slate-400">Actores:</strong> {selectedMovie.Actors}</p>
                        <p><strong className="text-slate-400">Premios:</strong> {selectedMovie.Awards}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => setSelectedMovie(null)}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-red-600/20"
                      >
                        Cerrar Ventana
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}