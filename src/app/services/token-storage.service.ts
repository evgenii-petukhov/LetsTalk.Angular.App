import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() { }

  private isLoggedInInternal: ReplaySubject<boolean> = new ReplaySubject(1);

  signOut() {
    window.sessionStorage.clear();
    this.isLoggedInInternal.next(false);
  }

  saveToken(token: string) {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
    this.isLoggedInInternal.next(true);
  }

  saveUser(user: any) {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getToken(): string {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser() {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  }

  get isLoggedInObservable(): Observable<boolean> {
    return this.isLoggedInInternal.asObservable();
  }
}
