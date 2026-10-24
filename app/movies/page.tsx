import { Suspense } from 'react'
import { connection } from 'next/server'
import axios from 'axios'
import MovieSearchClient from './MovieSearchClient'

const API_KEY = 'f1def80d'

async function getPopularMovies() {
  await connection()
  // Usamos "avengers" para obtener 10 películas con pósters oficiales 100% disponibles
  const response = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=avengers`)
  if (response.data.Response === 'True') {
    return response.data.Search
  }
  return []
}

async function MoviesContent() {
  const initialMovies = await getPopularMovies()
  return <MovieSearchClient initialMovies={initialMovies} />
}

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mb-4"></div>
          <p className="text-lg font-semibold text-slate-300">Cargando Películas en el Servidor (SSR)...</p>
        </div>
      }
    >
      <MoviesContent />
    </Suspense>
  )
}