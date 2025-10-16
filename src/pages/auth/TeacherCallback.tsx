import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search)
}

function TeacherCallback(): JSX.Element {
  const query = useQuery()
  const navigate = useNavigate()

  useEffect(() => {
    const app = query.get('app') || undefined
    const session = query.get('session') || undefined
    const pin = query.get('pin') || undefined
    const gbToken = query.get('gb_token') || undefined
    const aisToken = query.get('ais_token') || undefined
    const aisRefresh = query.get('ais_refresh') || undefined

    if (app && session && pin && gbToken) {
      // Persist tokens (replace with secure storage as needed)
      try {
        localStorage.setItem('gb_token', gbToken)
        if (aisToken) localStorage.setItem('ais_token', aisToken)
        if (aisRefresh) localStorage.setItem('ais_refresh', aisRefresh)
        localStorage.setItem('pin', pin)
        localStorage.setItem('session', session)
      } catch {}

      navigate('/', { replace: true })
    }
  }, [query, navigate])

  return (
    <div className="text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}

export default TeacherCallback


