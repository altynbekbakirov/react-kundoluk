import { useTranslation } from 'react-i18next'
import { useAuth } from '../../src/hooks/useAuth';

function Home(): JSX.Element {
  const { t } = useTranslation();
  const { authData } = useAuth();

  return (
    <div className="row g-3">
      {/* Welcome Card */}
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-3">
              {t('pages.home')}
            </h5>
            <h4 className="mb-3">
              {t('home.welcome')}, {authData?.first_name || authData?.last_name || t('home.student')}!
            </h4>
            <p className="text-muted mb-0">
              {t('home.welcomeMessage') || 'Welcome to your student dashboard'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      {authData && (
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title mb-3">
                <i className="bi bi-person-circle me-2 text-primary"></i>
                {t('info') || 'User Information'}
              </h6>
              <div className="mb-2">
                <small className="text-muted">{t('auth.username')}:</small>
                <div className="fw-semibold">{authData.pin || 'N/A'}</div>
              </div>
              {authData.name && (
                <div className="mb-2">
                  <small className="text-muted">{t('home.fullName') || 'Full Name'}:</small>
                  <div className="fw-semibold">{authData.name}</div>
                </div>
              )}
              {authData.email && (
                <div className="mb-2">
                  <small className="text-muted">{t('home.email') || 'Email'}:</small>
                  <div className="fw-semibold">{authData.email}</div>
                </div>
              )}
              {authData.studentId && (
                <div className="mb-2">
                  <small className="text-muted">{t('home.studentId') || 'Student ID'}:</small>
                  <div className="fw-semibold">{authData.studentId}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats or Additional Info */}
      <div className="col-12 col-lg-6">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-title mb-3">
              <i className="bi bi-info-circle me-2 text-info"></i>
              {t('links') || 'Quick Links'}
            </h6>
            <div className="d-grid gap-2">
              <a href="/grades" className="btn btn-outline-primary text-start">
                <i className="bi bi-clipboard-check me-2"></i>
                {t('menu.grades') || 'View Grades'}
              </a>
              <a href="/assignments" className="btn btn-outline-primary text-start">
                <i className="bi bi-book me-2"></i>
                {t('menu.assignments') || 'View Assignments'}
              </a>
              <a href="/attendance" className="btn btn-outline-primary text-start">
                <i className="bi bi-calendar-check me-2"></i>
                {t('menu.attendance') || 'View Attendance'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Card - Remove in production */}
      {authData && import.meta.env.DEV && (
        <div className="col-12">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="card-title text-warning">
                <i className="bi bi-bug me-2"></i>
                Debug: Full Auth Data
              </h6>
              <pre className="bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(authData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;