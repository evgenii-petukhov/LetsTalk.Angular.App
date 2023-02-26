import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Observable  } from 'rxjs';
import { User } from '../models/api/user';
import { LoginRequest, LoginResponseDto, ApiClient, AccountDto } from './api-client';

const USER_URL = 'api/user';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(
        private http: HttpClient,
        private client: ApiClient) { }

    login(data: SocialUser): Observable<LoginResponseDto> {
        const request = new LoginRequest();
        request.id = data.id.toString();
        request.provider = data.provider;
        request.authToken = data.authToken;
        return this.client.login(request);
    }

    getAccounts(): Observable<AccountDto[]> {
        return this.client.account();
    }

    getUser(): Observable<User> {
        return this.http.get<User>(USER_URL);
    }

}
