import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/logo.png'

function AuthIndex(): JSX.Element {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  return (
    <div className="text-center">
      <img src={logo} alt="logo" width={180} height={180} className="mb-3" />

      <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 420 }}>
        <div className="card-body p-3 p-md-4">
          <h3 className="fw-bold mb-4">{t('auth.loginTitle')}</h3>
          <div className="d-grid gap-3">
            <button className="btn btn-success py-2" onClick={() => navigate('teacher')}>{t('auth.loginTeacher')}</button>
            <button className="btn btn-primary py-2" onClick={() => navigate('parent')}>{t('auth.loginParent')}</button>
            <button className="btn btn-danger py-2" onClick={() => navigate('student')}>{t('auth.loginStudent')}</button>
          </div>
        </div>
      </div>

      <div className="dropdown mt-4">
        <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
          {i18n.language === 'ru' ? 'Русский' : 'Кыргызча'}
        </button>
        <ul className="dropdown-menu">
          <li><button className="dropdown-item" onClick={() => i18n.changeLanguage('ky')}>Кыргызча</button></li>
          <li><button className="dropdown-item" onClick={() => i18n.changeLanguage('ru')}>Русский</button></li>
        </ul>
      </div>
    </div>
  )
}

export default AuthIndex


