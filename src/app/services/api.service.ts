import { SocialUser } from '@abacritt/angularx-social-login';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    LoginRequest,
    LoginResponseDto,
    ApiClient,
    CreateMessageRequest,
    IMessageDto,
    UpdateProfileRequest,
    ImageRequestModel,
    IChatDto,
    IProfileDto,
    ProfileDto
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

    getChats(): Observable<IChatDto[]> {
        return this.client.chat();
    }

    getAccounts(): Observable<IChatDto[]> {
        return this.client.account();
    }

    getMessages(chatId: string, pageIndex: number): Observable<IMessageDto[]> {
        return this.client.messageAll(chatId, !pageIndex ? undefined : pageIndex);
    }

    getProfile(): Observable<IProfileDto> {
        return this.client.profileGET();
    }

    saveProfile(email: string, firstName: string, lastName: string, image?: UploadImageResponse): Observable<ProfileDto> {
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

    sendMessage(chatId: string, text?: string, image?: UploadImageResponse): Observable<IMessageDto> {
        const request = new CreateMessageRequest({
            chatId,
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

    markAsRead(chatId: string, messageId: string): Observable<void> {
        return this.client.markAsRead(chatId, messageId);
    }
}
