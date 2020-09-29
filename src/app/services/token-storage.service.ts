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
    window.localStorage.clear();
    this.isLoggedInInternal.next(false);
  }

  saveToken(token: string) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
    this.isLoggedInInternal.next(true);
  }

  saveUser(user: any) {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getToken(): string {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser() {
    return JSON.parse(localStorage.getItem(USER_KEY));
  }

  get isLoggedInObservable(): Observable<boolean> {
    return this.isLoggedInInternal.asObservable();
  }
}
