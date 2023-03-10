import { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable  } from 'rxjs';
import { 
    LoginRequest, 
    LoginResponseDto, 
    ApiClient, 
    IAccountDto, 
    CreateMessageRequest, 
    IMessageDto, 
    MarkAsReadRequest
} from '../api-client/api-client';

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

    getAccounts(): Observable<IAccountDto[]> {
        return this.client.account();
    }

    getMessages(accountId: number): Observable<IMessageDto[]> {
        return this.client.messageAll(accountId);
    }

    getMe(): Observable<IAccountDto> {
        return this.client.me();
    }

    sendMessage(recipientId: number, text: string): Observable<IMessageDto> {
        const request = new CreateMessageRequest();
        request.recipientId = recipientId;
        request.text = text;
        return this.client.message(request);
    }

    markAsRead(messageId: number): Observable<void> {
        const request = new MarkAsReadRequest();
        request.messageId = messageId;
        return this.client.markAsRead(request);
    }
}
