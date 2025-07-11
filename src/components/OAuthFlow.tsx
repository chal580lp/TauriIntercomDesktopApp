import React from 'react';
import { AuthResult } from '../types/oauth';

interface OAuthFlowProps {
    onStartFlow: () => void;
    isLoading: boolean;
    authResult: AuthResult | null;
    error: string | null;
    onClearAuth: () => void;
}

export const OAuthFlow: React.FC<OAuthFlowProps> = ({
    onStartFlow,
    isLoading,
    authResult,
    error,
    onClearAuth,
}) => {
    if (authResult) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
                    Authentication Successful!
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        {authResult.user.avatar?.image_url && (
                            <img
                                src={authResult.user.avatar.image_url}
                                alt="User avatar"
                                className="w-16 h-16 rounded-full"
                            />
                        )}
                        <div>
                            <h3 className="text-lg font-semibold">
                                {authResult.user.name || 'Unknown User'}
                            </h3>
                            {authResult.user.email && (
                                <p className="text-gray-600">{authResult.user.email}</p>
                            )}
                        </div>
                    </div>

                    {authResult.user.app && (
                        <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="font-medium">App Details</h4>
                            <p className="text-sm text-gray-600">
                                {authResult.user.app.name} ({authResult.user.app.id_code})
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-md">
                        <h4 className="font-medium">Access Token</h4>
                        <p className="text-sm text-gray-600 font-mono break-all">
                            {authResult.access_token.substring(0, 20)}...
                        </p>
                    </div>

                    <button
                        onClick={onClearAuth}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Clear Authentication
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Start OAuth Flow</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="text-center">
                <p className="text-gray-600 mb-6">
                    Click the button below to start the OAuth authentication process.
                    This will open your browser to authorize the application.
                </p>

                <button
                    onClick={onStartFlow}
                    disabled={isLoading}
                    className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Starting OAuth Flow...' : 'Start OAuth Flow'}
                </button>
            </div>
        </div>
    );
};