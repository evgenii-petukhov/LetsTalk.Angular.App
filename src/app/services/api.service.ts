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
    AccountDto,
    ImageRequestModel
} from '../api-client/api-client';
import { UploadImageResponse } from '../protos/file_upload_pb';

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

    getChats(): Observable<IAccountDto[]> {
        return this.client.chat();
    }

    getMessages(accountId: string, pageIndex: number): Observable<IMessageDto[]> {
        return this.client.messageAll(accountId, !pageIndex ? undefined : pageIndex);
    }

    getProfile(): Observable<IAccountDto> {
        return this.client.profileGET();
    }

    saveProfile(email: string, firstName: string, lastName: string, image?: UploadImageResponse): Observable<AccountDto> {
        const request = new UpdateProfileRequest({
            email,
            firstName,
            lastName,
            image: image ? new ImageRequestModel({
                id: image.getId(),
                width: image.getWidth(),
                height: image.getHeight(),
                imageFormat: image.getImageFormat(),
                signature: image.getSignature()
            }) : null
        });
        return this.client.profilePUT(request);
    }

    sendMessage(recipientId: string, text?: string, image?: UploadImageResponse): Observable<IMessageDto> {
        const request = new CreateMessageRequest({
            recipientId,
            text,
            image: image ? new ImageRequestModel({
                id: image.getId(),
                width: image.getWidth(),
                height: image.getHeight(),
                imageFormat: image.getImageFormat(),
                signature: image.getSignature()
            }) : null
        });

        return this.client.message(request);
    }

    markAsRead(messageId: string): Observable<void> {
        return this.client.markAsRead(messageId);
    }

    markAllAsRead(messageId: string): Observable<void> {
        return this.client.markAllAsRead(messageId);
    }
}
