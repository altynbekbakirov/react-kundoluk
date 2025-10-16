import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

function TeacherLogin(): JSX.Element {
  const { t, i18n } = useTranslation()

  const buildLoginUrl = useCallback((): string => {
    const base = 'https://kundoluk.edu.gov.kg/gbapi/v2/auth/ais'
    const params = new URLSearchParams({
      app: 'kundoluk-web',
      session: crypto.randomUUID(),
      lang: i18n.language || 'ky',
      redirect: `${window.location.origin}/auth/teacher/callback`,
    })
    return `${base}?${params.toString()}`
  }, [i18n.language])

  const onLogin = () => {
    window.location.href = buildLoginUrl()
  }

  return (
    <div className="card shadow-sm border-0" style={{ background: '#f7f3fa' }}>
      <div className="card-body p-4 p-md-5">
        <h3 className="fw-bold mb-4">{t('auth.loginTeacher')}</h3>
        <p className="text-secondary">{t('auth.login')} AIS</p>
        <div className="d-grid">
          <button className="btn btn-success" onClick={onLogin}>{t('auth.login')}</button>
        </div>
      </div>
    </div>
  )
}

export default TeacherLogin


