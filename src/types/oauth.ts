export interface IntercomUser {
    id: string;
    name?: string;
    email?: string;
    app?: IntercomApp;
    avatar?: Avatar;
}

export interface IntercomApp {
    id_code: string;
    name: string;
    created_at: number;
}

export interface Avatar {
    image_url?: string;
}

export interface AuthResult {
    access_token: string;
    user: IntercomUser;
}

export interface OAuthConfig {
    client_id: string;
    client_secret: string;
    redirect_port?: number;
}

