import { Component, OnDestroy, OnInit } from '@angular/core';
import { required, validate } from 'src/app/decorators/required.decorator';
import { IChatDto, IMessageDto } from 'src/app/api-client/api-client';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ApiService } from 'src/app/services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { errorMessages } from 'src/app/constants/errors';
import { ErrorService } from 'src/app/services/error.service';
import { environment } from 'src/environments/environment';
import { ImageRoles, UploadImageResponse } from 'src/app/protos/file_upload_pb';
import { ImageUploadService } from 'src/app/services/image-upload.service';

@Component({
    selector: 'app-compose-area',
    templateUrl: './compose-area.component.html',
    styleUrl: './compose-area.component.scss',
    standalone: false,
})
export class ComposeAreaComponent implements OnInit, OnDestroy {
    message = '';
    isSending = false;
    private chat: IChatDto;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private apiService: ApiService,
        private errorService: ErrorService,
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService,
        private imageUploadService: ImageUploadService,
    ) {}

    ngOnInit(): void {
        this.store
            .select(selectSelectedChat)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((chat) => {
                this.chat = chat;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    @validate
    async onSendMessage(@required message: string): Promise<void> {
        this.message = '';
        this.isSending = true;
        try {
            await this.processSendMessage(this.chat, message);
        } catch (e) {
            this.errorService.handleError(e, errorMessages.sendMessage);
        } finally {
            this.isSending = false;
        }
    }

    async onImageBlobReady(blob: Blob): Promise<void> {
        const chat = this.chat;
        const buffer = await blob.arrayBuffer();
        const base64 = URL.createObjectURL(new Blob([buffer]));
        const sizeLimits = environment.imageSettings.limits;
        try {
            const image = await this.imageUploadService.resizeAndUploadImage(
                base64 as string,
                sizeLimits.picture.width,
                sizeLimits.picture.height,
                ImageRoles.MESSAGE,
            );
            await this.processSendMessage(chat, undefined, image);
        } catch (e) {
            this.errorService.handleError(e, errorMessages.sendMessage);
        } finally {
            URL.revokeObjectURL(base64);
        }
    }

    private async processSendMessage(
        chat: IChatDto,
        message: string,
        image?: UploadImageResponse,
    ): Promise<void> {
        if (this.shouldCreateIndividualChat(chat)) {
            await this.handleIndividualChatCreation(
                chat.id,
                chat.accountIds[0],
                message,
                image,
            );
        } else {
            await this.handleMessageSending(chat.id, message, image);
        }
    }

    private shouldCreateIndividualChat(chat: IChatDto): boolean {
        return chat.isIndividual && this.idGeneratorService.isFake(chat.id);
    }

    private async handleIndividualChatCreation(
        chatId: string,
        accountId: string,
        message: string,
        image: UploadImageResponse,
    ): Promise<void> {
        const chatDto = await this.apiService.createIndividualChat(accountId);
        await this.apiService.sendMessage(chatDto.id, message, image);
        this.storeService.updateChatId(chatId, chatDto.id);
        this.storeService.setSelectedChatId(chatDto.id);
    }

    private async handleMessageSending(
        chatId: string,
        message: string,
        image: UploadImageResponse,
    ): Promise<void> {
        const messageDto = await this.apiService.sendMessage(
            chatId,
            message,
            image,
        );
        if (chatId === this.chat.id) {
            this.addMessageToStore(chatId, messageDto);
        }
    }

    private addMessageToStore(chatId: string, messageDto: IMessageDto): void {
        messageDto.isMine = true;
        this.storeService.addMessage(messageDto);
        this.storeService.setLastMessageInfo(
            chatId,
            messageDto.created,
            messageDto.id,
        );
    }
}
