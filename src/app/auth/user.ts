
export interface Roles {
    subscriber?: boolean;
    editor?: boolean;
    admin?: boolean;
    super?: boolean;
 }

export interface Parroquia {
    id?: string;
    nombre?: string;
 }

export interface Diocesis {
    id?: string;
    nombre?: string;
 }

export interface User {
    uid: string;
    email: string;
    roles: Roles;
    parroquia: Parroquia;
    diocesis: Diocesis;
    fcmTokens?: { [token: string]: true };
}
