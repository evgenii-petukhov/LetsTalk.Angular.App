import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
    LoginResponseDto,
    ApiClient,
    CreateMessageRequest,
    IMessageDto,
    UpdateProfileRequest,
    ImageRequestModel,
    IChatDto,
    IProfileDto,
    ProfileDto,
    IAccountDto,
    CreateIndividualChatRequest,
    EmailLoginRequest,
    GenerateLoginCodeResponseDto,
    GenerateLoginCodeRequest,
} from '../api-client/api-client';
import { UploadImageResponse } from '../protos/file_upload_pb';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private client: ApiClient) {}

    loginByEmail(email: string, code: number): Promise<LoginResponseDto> {
        const request = new EmailLoginRequest({
            email: email,
            code: code,
            antiSpamToken: Math.floor(new Date().getTime() / 1000),
        });

        return firstValueFrom(this.client.emailLogin(request));
    }

    getChats(): Promise<IChatDto[]> {
        return firstValueFrom(this.client.chatAll());
    }

    getAccounts(): Promise<IAccountDto[]> {
        return firstValueFrom(this.client.account());
    }

    getMessages(chatId: string, pageIndex: number): Promise<IMessageDto[]> {
        return firstValueFrom(
            this.client.messageAll(chatId, !pageIndex ? undefined : pageIndex),
        );
    }

    getProfile(): Promise<IProfileDto> {
        return firstValueFrom(this.client.profileGET());
    }

    saveProfile(
        firstName: string,
        lastName: string,
        image?: UploadImageResponse,
    ): Promise<ProfileDto> {
        const request = new UpdateProfileRequest({
            firstName,
            lastName,
            image: image
                ? new ImageRequestModel({
                      id: image.getId(),
                      width: image.getWidth(),
                      height: image.getHeight(),
                      imageFormat: image.getImageFormat(),
                      signature: image.getSignature(),
                  })
                : null,
        });
        return firstValueFrom(this.client.profilePUT(request));
    }

    async sendMessage(
        chatId: string,
        text?: string,
        image?: UploadImageResponse,
    ): Promise<IMessageDto> {
        const request = new CreateMessageRequest({
            chatId,
            text,
            image: image
                ? new ImageRequestModel({
                      id: image.getId(),
                      width: image.getWidth(),
                      height: image.getHeight(),
                      imageFormat: image.getImageFormat(),
                      signature: image.getSignature(),
                  })
                : null,
        });

        return firstValueFrom(this.client.message(request));
    }

    async createIndividualChat(accountId: string): Promise<IChatDto> {
        const request = new CreateIndividualChatRequest({
            accountId: accountId,
        });

        return firstValueFrom(this.client.chat(request));
    }

    markAsRead(chatId: string, messageId: string): Promise<void> {
        return firstValueFrom(this.client.markAsRead(chatId, messageId));
    }

    generateLoginCode(email: string): Promise<GenerateLoginCodeResponseDto> {
        const request = new GenerateLoginCodeRequest({
            email: email,
            antiSpamToken: Math.floor(new Date().getTime() / 1000),
        });

        return firstValueFrom(this.client.generateLoginCode(request));
    }
}
