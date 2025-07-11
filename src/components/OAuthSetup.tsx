import React, { useState } from 'react';
import { OAuthConfig } from '../types/oauth';

interface OAuthSetupProps {
    onInitialize: (config: OAuthConfig) => void;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

export const OAuthSetup: React.FC<OAuthSetupProps> = ({
    onInitialize,
    isLoading,
    isInitialized,
    error,
}) => {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [redirectPort, setRedirectPort] = useState(8080);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInitialize({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_port: redirectPort,
        });
    };

    if (isInitialized) {
        return (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ✅ OAuth Initialized
                </h3>
                <p className="text-green-700">
                    Ready to start OAuth flow
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">OAuth Setup</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID
                    </label>
                    <input
                        id="clientId"
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                        Client Secret
                    </label>
                    <input
                        id="clientSecret"
                        type="password"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label htmlFor="redirectPort" className="block text-sm font-medium text-gray-700 mb-1">
                        Redirect Port
                    </label>
                    <input
                        id="redirectPort"
                        type="number"
                        value={redirectPort}
                        onChange={(e) => setRedirectPort(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1024"
                        max="65535"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Initializing...' : 'Initialize OAuth'}
                </button>
            </form>
        </div>
    );
};