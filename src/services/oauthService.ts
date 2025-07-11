import { invoke } from '@tauri-apps/api/core';
import { AuthResult, IntercomUser, OAuthConfig } from '../types/oauth';

export class OAuthService {
    private static instance: OAuthService;
    private initialized = false;

    private constructor() { }

    static getInstance(): OAuthService {
        if (!OAuthService.instance) {
            OAuthService.instance = new OAuthService();
        }
        return OAuthService.instance;
    }

    async initialize(config: OAuthConfig): Promise<void> {
        try {
            await invoke('initialize_oauth', {
                clientId: config.client_id,
                clientSecret: config.client_secret,
                redirectPort: config.redirect_port,
            });
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize OAuth:', error);
            throw new Error(`OAuth initialization failed: ${error}`);
        }
    }

    async startOAuthFlow(): Promise<AuthResult> {
        if (!this.initialized) {
            throw new Error('OAuth service not initialized');
        }

        try {
            const result = await invoke<AuthResult>('start_oauth_flow');
            return result;
        } catch (error) {
            console.error('OAuth flow failed:', error);
            throw new Error(`OAuth flow failed: ${error}`);
        }
    }

    async getUserInfo(accessToken: string): Promise<IntercomUser> {
        if (!this.initialized) {
            throw new Error('OAuth service not initialized');
        }

        try {
            const user = await invoke<IntercomUser>('get_user_info', {
                accessToken,
            });
            return user;
        } catch (error) {
            console.error('Failed to get user info:', error);
            throw new Error(`Failed to get user info: ${error}`);
        }
    }
}