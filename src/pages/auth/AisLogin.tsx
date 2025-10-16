import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { webUrl } from '../../services/CommonServices';
import { authTeacherUser } from '../../services/LoginServices';

interface AuthParams {
    app: string;
    session: string;
    pin: string;
    gb_token: string;
    ais_token?: string;
    ais_refresh?: string;
}

interface AisLoginScreenProps {
    app: string;
    session: string;
    lang: string;
    onAuthSuccess?: (params: AuthParams) => void;
}

function AisLogin({ app, session, lang, onAuthSuccess }: AisLoginScreenProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const buildLoginUrl = (): string => {
        const params = new URLSearchParams({
            app,
            session,
            lang,
            redirect: encodeURIComponent('params'),
        });
        return `${webUrl}?${params.toString()}`;
    };

    const handleMessage = (event: MessageEvent) => {
        // Security: Verify origin if needed
        // if (event.origin !== 'https://kundoluk.edu.gov.kg') return;

        console.log('Message received:', event.data);

        // Handle postMessage from iframe if the auth system uses it
        if (event.data && typeof event.data === 'object') {
            handleAuthParams(event.data);
        }
    };

    const handleAuthParams = (params: any) => {
        const { app, session, pin, gb_token, ais_token, ais_refresh } = params;

        console.log('app:', app);
        console.log('session:', session);
        console.log('pin:', pin);
        console.log('gbToken:', gb_token);

        if (app && session && pin && gb_token) {
            const authParams: AuthParams = {
                app,
                session,
                pin,
                gb_token,
                ais_token,
                ais_refresh,
            };

            if (onAuthSuccess) {
                onAuthSuccess(authParams);
            } else {
                // Navigate back with params or store them
                navigate(-1);
            }
        }
    };

    const checkIframeUrl = () => {
        try {
            const iframe = iframeRef.current;
            if (!iframe || !iframe.contentWindow) return;

            // Note: This only works if iframe is same-origin
            // For cross-origin, you'll need postMessage communication
            const iframeUrl = iframe.contentWindow.location.href;
            const url = new URL(iframeUrl);

            const params = {
                app: url.searchParams.get('app'),
                session: url.searchParams.get('session'),
                pin: url.searchParams.get('pin'),
                gb_token: url.searchParams.get('gb_token'),
                ais_token: url.searchParams.get('ais_token'),
                ais_refresh: url.searchParams.get('ais_refresh'),
            };

            if (params.app && params.session && params.pin && params.gb_token) {
                handleAuthParams(params);
            }
        } catch (e) {
            // Cross-origin error - expected for external URLs
            // The auth system should use postMessage or redirect
            console.log('Cannot access iframe URL (cross-origin)');
        }
    };

    useEffect(() => {
        // Listen for postMessage events
        window.addEventListener('message', handleMessage);

        // Poll iframe URL (only works for same-origin)
        const interval = setInterval(checkIframeUrl, 1000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(interval);
        };
    }, []);

    const handleIframeLoad = () => {
        setIsLoading(false);
        checkIframeUrl();
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setError('Failed to load authentication page');
    };

    return (
        <div className="d-flex flex-column" style={{ height: '100vh' }}>
            {/* Header */}
            <div className="bg-white border-bottom p-3 d-flex align-items-center">
                <button
                    className="btn btn-link text-dark p-0 me-3"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left fs-4"></i>
                </button>
                <h5 className="mb-0">{t('auth.teacherLogin') || 'Teacher Login'}</h5>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger m-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            {/* WebView/Iframe */}
            <div className="flex-grow-1 position-relative">
                <iframe
                    ref={iframeRef}
                    src={buildLoginUrl()}
                    className="w-100 h-100 border-0"
                    title="AIS Login"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
            </div>
        </div>
    );
}

export default AisLogin;

// Usage Example Component
export function TeacherLoginPage() {
    const navigate = useNavigate();

    const handleAuthSuccess = async (params: AuthParams) => {
        try {
            console.log('Authentication successful:', params);

            // Call your API to store tokens
            const device = navigator.userAgent;
            const fcmToken = ''; // Get from your FCM implementation
            const lang = 'kg'; // or from app state

            const response = await authTeacherUser({
                token: params.gb_token,
                access: params.ais_token || '',
                refresh: params.ais_refresh || '',
                device,
                fcmToken,
                lang,
                error: false,
            });

            // Store response in localStorage
            localStorage.setItem('teacherLogin', JSON.stringify(response));

            // Navigate to dashboard
            navigate('/');
        } catch (error) {
            console.error('Failed to complete authentication:', error);
            // Handle error appropriately
        }
    };

    return (
        <AisLogin
            app="your-app-id"
            session="your-session-id"
            lang="kg"
            onAuthSuccess={handleAuthSuccess}
        />
    );
}