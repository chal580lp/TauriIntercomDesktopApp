import React from 'react';
import { useOAuth } from '../hooks/useOAuth';
import { OAuthSetup } from './OAuthSetup';
import { OAuthFlow } from './OAuthFlow';

export const OAuthManager: React.FC = () => {
    const {
        isLoading,
        isInitialized,
        authResult,
        error,
        initialize,
        startOAuthFlow,
        clearAuth,
    } = useOAuth();

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Intercom OAuth Integration
                </h1>

                {!isInitialized ? (
                    <OAuthSetup
                        onInitialize={initialize}
                        isLoading={isLoading}
                        isInitialized={isInitialized}
                        error={error}
                    />
                ) : (
                    <OAuthFlow
                        onStartFlow={startOAuthFlow}
                        isLoading={isLoading}
                        authResult={authResult}
                        error={error}
                        onClearAuth={clearAuth}
                    />
                )}
            </div>
        </div>
    );
};