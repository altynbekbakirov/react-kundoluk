import React from 'react'
import { useTranslation } from 'react-i18next'

function ParentLogin(): JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="card shadow-sm border-0" style={{ background: '#f7f3fa' }}>
      <div className="card-body p-4 p-md-5">
        <h3 className="fw-bold mb-4">{t('auth.loginParent')}</h3>
        <p className="text-secondary mb-0">Coming soon...</p>
      </div>
    </div>
  )
}

export default ParentLogin



