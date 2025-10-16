import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LogoutModalProps {
  show: boolean;
  onClose: () => void;
}

function LogoutModal({ show, onClose }: LogoutModalProps): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('studentLogin');
    sessionStorage.removeItem('studentLogin');
    
    // Redirect to login
    navigate('/auth', { replace: true });
  };

  if (!show) return <></>;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        tabIndex={-1} 
        role="dialog"
        aria-labelledby="logoutModalLabel"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title" id="logoutModalLabel">
                <i className="bi bi-box-arrow-right text-danger me-2"></i>
                {t('auth.warning') || 'Confirm Logout'}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">
                {t('auth.confirmation') || 'Are you sure you want to logout?'}
              </p>
            </div>
            <div className="modal-footer border-0">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                {t('auth.cancel') || 'Cancel'}
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                {t('auth.logout') || 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LogoutModal;