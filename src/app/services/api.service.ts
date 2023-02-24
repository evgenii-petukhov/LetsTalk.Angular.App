import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Observable  } from 'rxjs';
import { Chat } from '../models/api/chat';
import { User } from '../models/api/user';
import { MappingService } from './mapping-service';
import { AuthRequest, AuthResponse, Client } from './service-client';

const CHAT_URL = 'api/chat';
const USER_URL = 'api/user';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(
        private http: HttpClient,
        private client: Client,
        private mappingService: MappingService) { }

    login(data: SocialUser): Promise<AuthResponse> {
        const request = this.mappingService.map(data, AuthRequest);
        return this.client.login(request);
    }

    getChats(): Observable<Chat[]> {
        return this.http.get<Chat[]>(CHAT_URL);
    }

    getUser(): Observable<User> {
        return this.http.get<User>(USER_URL);
    }

}
