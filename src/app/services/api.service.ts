import { SocialUser } from '@abacritt/angularx-social-login';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    LoginRequest,
    LoginResponseDto,
    ApiClient,
    IAccountDto,
    CreateMessageRequest,
    IMessageDto,
    MarkAsReadRequest,
    UpdateProfileRequest,
    AccountDto
} from '../api-client/api-client';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private client: ApiClient) { }

    login(data: SocialUser): Observable<LoginResponseDto> {
        const request = new LoginRequest({
            id: data.id.toString(),
            provider: data.provider,
            authToken: data.authToken
        });

        return this.client.login(request);
    }

    getAccounts(): Observable<IAccountDto[]> {
        return this.client.account();
    }

    getMessages(accountId: number, pageIndex: number): Observable<IMessageDto[]> {
        return this.client.messageAll(accountId, pageIndex === 0 ? undefined : pageIndex);
    }

    getProfile(): Observable<IAccountDto> {
        return this.client.profileGET();
    }

    saveProfile(email: string, firstName: string, lastName: string): Observable<AccountDto> {
        const request = new UpdateProfileRequest({
            email,
            firstName,
            lastName
        });
        return this.client.profilePUT(request);
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
