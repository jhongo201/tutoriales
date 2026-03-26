export interface Tutorial {
  id: number
  title: string
  description: string | null
  content_type: 'VIDEO_TUTORIAL' | 'MANUAL_PDF' | 'FAQ' | 'INFOGRAFIA'
  user_profile: 'AGENTE' | 'AGENCIA' | 'CORREDOR' | 'TODOS'
  operation_type: string | null
  resource_url: string | null
  thumbnail_url: string | null
  display_order: number
  active: boolean
  view_count: number
  download_count: number
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface AuthResponse {
  token: string
  user: {
    username: string
    displayName: string
    email: string
  }
  expiresIn: string
}