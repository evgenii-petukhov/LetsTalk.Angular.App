import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { LoginResponseDto } from '../api-client/api-client';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private isLoggedInInternal: ReplaySubject<boolean> = new ReplaySubject(1);

    get isLoggedInObservable(): Observable<boolean> {
        return this.isLoggedInInternal.asObservable();
    }

    signOut(): void {
        window.localStorage.clear();
        this.isLoggedInInternal.next(false);
    }

    saveToken(token: string) {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.setItem(TOKEN_KEY, token);
        this.isLoggedInInternal.next(true);
    }

    saveUser(user: LoginResponseDto): void {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    getToken(): string {
        return localStorage.getItem(TOKEN_KEY);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getUser(): LoginResponseDto {
        return JSON.parse(localStorage.getItem(USER_KEY)) as LoginResponseDto;
    }
}
