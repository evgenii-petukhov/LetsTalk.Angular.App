import { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable  } from 'rxjs';
import { 
    LoginRequest, 
    LoginResponseDto, 
    ApiClient, 
    AccountDto, 
    CreateMessageRequest, 
    MessageDto, 
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

    getAccounts(): Observable<AccountDto[]> {
        return this.client.account();
    }

    getMessages(accountId: number): Observable<MessageDto[]> {
        return this.client.messageAll(accountId);
    }

    getMe(): Observable<MessageDto> {
        return this.client.me();
    }

    sendMessage(recipientId: number, text: string): Observable<MessageDto> {
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
