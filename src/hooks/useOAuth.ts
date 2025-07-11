import { useState, useCallback } from 'react';
import { OAuthService } from '../services/oauthService';
import { AuthResult, IntercomUser, OAuthConfig } from '../types/oauth';

export interface UseOAuthResult {
    isLoading: boolean;
    isInitialized: boolean;
    authResult: AuthResult | null;
    error: string | null;
    initialize: (config: OAuthConfig) => Promise<void>;
    startOAuthFlow: () => Promise<void>;
    getUserInfo: (accessToken: string) => Promise<IntercomUser>;
    clearAuth: () => void;
}

export const useOAuth = (): UseOAuthResult => {
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [authResult, setAuthResult] = useState<AuthResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const oauthService = OAuthService.getInstance();

    const initialize = useCallback(async (config: OAuthConfig) => {
        setIsLoading(true);
        setError(null);

        try {
            await oauthService.initialize(config);
            setIsInitialized(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Initialization failed');
        } finally {
            setIsLoading(false);
        }
    }, [oauthService]);

    const startOAuthFlow = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await oauthService.startOAuthFlow();
            setAuthResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'OAuth flow failed');
        } finally {
            setIsLoading(false);
        }
    }, [oauthService]);

    const getUserInfo = useCallback(async (accessToken: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const user = await oauthService.getUserInfo(accessToken);
            return user;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get user info');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [oauthService]);

    const clearAuth = useCallback(() => {
        setAuthResult(null);
        setError(null);
    }, []);

    return {
        isLoading,
        isInitialized,
        authResult,
        error,
        initialize,
        startOAuthFlow,
        getUserInfo,
        clearAuth,
    };
};
