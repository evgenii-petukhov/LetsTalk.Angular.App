import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Observable  } from 'rxjs';
import { Chat } from '../models/api/chat';
import { User } from '../models/api/user';
import { AuthRequest, AuthResponse, Client } from './service-client';

const CHAT_URL = 'api/chat';
const USER_URL = 'api/user';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(
        private http: HttpClient,
        private client: Client) { }

    login(data: SocialUser): Promise<AuthResponse> {
        const request = new AuthRequest();
        request.provider = data.provider;
        request.id = data.id;
        request.email = data.email;
        request.name = data.name;
        request.photoUrl = data.photoUrl;
        request.firstName = data.firstName;
        request.lastName = data.lastName;
        request.authToken = data.authToken;

        return this.client.login(request);
    }

    getChats(): Observable<Chat[]> {
        return this.http.get<Chat[]>(CHAT_URL);
    }

    getUser(): Observable<User> {
        return this.http.get<User>(USER_URL);
    }

}
