export interface Movie {
  id: number
  tmdbId: number
  title: string | null
  description: string | null
  poster: string | null
  trailer?: string | null
  director: string | null
  genre: string | null
  releaseDate: string | Date
  createdAt: string | Date
  ratings: any[]
}
export interface TmdbMovie {
  tmdbId: number
  title: string
  description: string
  poster: string
  trailer: string
  director: string
  genre: string
  releaseDate: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  createdAt: string
  _count: {
    comments: number
    ratings: number
    favorites: number
  }
}

export interface PaginatedResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface EditForm {
  username: string
  email: string
} 
export interface Stats {
  totalUsers: number
  totalAdmins: number
  totalMovies: number
  totalRatings: number
  totalComments: number
  recentRatings: {
    id: number
    score: number
    user: { username: string }
    movie: { title: string }
  }[]
}