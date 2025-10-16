import { NavLink } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/sidebar.css'
import { bottomMenu, MenuItem, sidebarMenu } from '../data/menu'
import { useTranslation } from 'react-i18next'
import LogoutModal from './LogoutModal'
import { useState } from 'react'

function Sidebar(): JSX.Element {
  const { t, i18n } = useTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const changeLang = (lng: 'ru' | 'ky') => i18n.changeLanguage(lng);

  const handleMenuClick = (item: MenuItem) => {
    if (item.action === 'logout') {
      setShowLogoutModal(true);
    }
  };

  return (
    <>
      <aside className="sidebar col-12 col-md-3 col-lg-2 bg-light border-end p-3 min-vh-100 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">{t('appTitle')}</h5>
          <div className="btn-group btn-group-sm" role="group">
            <button className="btn btn-outline-secondary" onClick={() => changeLang('ky')}>
              KY
            </button>
            <button className="btn btn-outline-secondary" onClick={() => changeLang('ru')}>
              RU
            </button>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="nav flex-column gap-1 flex-grow-1">
          {sidebarMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path!}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi bi-${item.icon}`}></i>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom navigation (Settings & Logout) */}
        <nav className="nav flex-column gap-1 mt-3 border-top pt-3">
          {bottomMenu.map((item, index) => {
            if (item.action === 'logout') {
              return (
                <button
                  key={index}
                  className="nav-link d-flex align-items-center gap-2 text-danger bg-transparent border-0 text-start"
                  onClick={() => handleMenuClick(item)}
                >
                  <i className={`bi bi-${item.icon}`}></i>
                  <span>{t(item.labelKey)}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi bi-${item.icon}`}></i>
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}

export default Sidebar


