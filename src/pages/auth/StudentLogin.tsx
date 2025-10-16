import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authStudentUser, PasswordChangeException } from '../../services/LoginServices';

type FormValues = {
  username: string;
  password: string;
  remember: boolean;
};

const schema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(2, "Should be at least 2 symbols"),
  password: yup
    .string()
    .trim()
    .required('Password is required'),
  remember: yup.boolean().default(true),
});

function StudentLogin(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { remember: true },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get device info and FCM token (you may need to implement these)
      const device = navigator.userAgent;
      const fcmToken = ''; // Get from your FCM implementation

      // Call authentication API
      const response = await authStudentUser(
        data.username,
        data.password,
        device,
        fcmToken
      );

      // Store the full API response in localStorage
      if (data.remember) {
        localStorage.setItem("studentLogin", JSON.stringify(response));
      } else {
        sessionStorage.setItem("studentLogin", JSON.stringify(response));
      }

      // Navigate to home page
      navigate('/');
    } catch (error) {
      if (error instanceof PasswordChangeException) {
        // Redirect to password change page
        navigate('/student/change-password', {
          state: { username: data.username, requireChange: true }
        });
      } else if (error instanceof Error) {
        // Handle error message - could be JSON string or plain text
        let errorMessage = error.message;
        
        try {
          // Try to parse if it's a JSON string
          const parsed = JSON.parse(error.message);
          if (parsed.resultMessage) {
            errorMessage = parsed.resultMessage;
          }
        } catch {
          // If parsing fails, use the message as is
          errorMessage = error.message;
        }
        
        setSubmitError(errorMessage || t('auth.loginError'));
      } else {
        setSubmitError(t('auth.loginError') || 'An error occurred during login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="card shadow-sm border-0" style={{ background: '#f7f3fa' }}>
        <div className="card-body p-4 p-md-5">
          <h3 className="fw-bold mb-4">{t('auth.studentLoginTitle')}</h3>

          {submitError && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{submitError}</div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">
              {t('auth.username')}
            </label>
            <div className="input-group">
              <span className="input-group-text text-danger bg-transparent border-2">
                <i className="bi bi-person"></i>
              </span>
              <input
                {...register('username')}
                autoFocus
                autoComplete="username"
                className={`form-control border-2 ${errors.username ? 'is-invalid' : ''}`}
                placeholder={t('auth.usernamePlaceholder') || ''}
                disabled={isSubmitting}
              />
            </div>
            {errors.username && (
              <div className="text-danger small mt-1">
                {errors.username.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">
              {t('auth.password')}
            </label>
            <div className="input-group">
              <span className="input-group-text text-danger bg-transparent border-2">
                <i className="bi bi-lock"></i>
              </span>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-control border-2 ${errors.password ? 'is-invalid' : ''}`}
                placeholder={t('auth.passwordPlaceholder') || ''}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn btn-outline-secondary border-2"
                onClick={() => setShowPassword(v => !v)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div className="text-danger small mt-1">
                {errors.password.message}
              </div>
            )}
          </div>

          <div className="form-check mb-3">
            <input
              {...register("remember")}
              id="remember"
              className="form-check-input border-2"
              type="checkbox"
              disabled={isSubmitting}
            />
            <label className="form-check-label ms-2" htmlFor="remember">
              {t('auth.remember')}
            </label>
          </div>

          <div className="d-grid gap-3">
            <button
              type='submit'
              className="btn btn-danger py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('auth.loggingIn') || 'Logging in...'}
                </>
              ) : (
                t('auth.login')
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger py-2"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              <i className="bi bi-arrow-left me-2"></i>
              {t('auth.back')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default StudentLogin;