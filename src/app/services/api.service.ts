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
        return this.client.accountAll();
    }

    getMessages(accountId: string, pageIndex: number): Observable<IMessageDto[]> {
        return this.client.messageAll(accountId, !pageIndex ? undefined : pageIndex);
    }

    getProfile(): Observable<IAccountDto> {
        return this.client.profile();
    }

    saveProfile(email: string, firstName: string, lastName: string, imageId: string): Observable<AccountDto> {
        const request = new UpdateProfileRequest({
            email,
            firstName,
            lastName,
            imageId
        });
        return this.client.account(request);
    }

    sendMessage(recipientId: string, text?: string, imageId?: string): Observable<IMessageDto> {
        const request = new CreateMessageRequest();
        request.recipientId = recipientId;
        request.text = text;
        request.imageId = imageId;
        return this.client.message(request);
    }

    markAsRead(messageId: string): Observable<void> {
        return this.client.markAsRead(messageId);
    }

    markAllAsRead(messageId: string): Observable<void> {
        return this.client.markAllAsRead(messageId);
    }
}
