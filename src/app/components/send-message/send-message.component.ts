import { Component, OnInit } from '@angular/core';
import { required, validate } from 'src/app/decorators/required.decorator';
import { IChatDto, IMessageDto } from 'src/app/api-client/api-client';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ApiService } from 'src/app/services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { errorMessages } from 'src/app/constants/errors';
import { ErrorService } from 'src/app/services/error.service';
import { environment } from 'src/environments/environment';
import { ImageRoles } from 'src/app/protos/file_upload_pb';
import { ImageUploadService } from 'src/app/services/image-upload.service';

@Component({
    selector: 'app-send-message',
    templateUrl: './send-message.component.html',
    styleUrl: './send-message.component.scss',
})
export class SendMessageComponent implements OnInit {
    message = '';
    isSending = false;
    private chat: IChatDto;
    private chatId: string;
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
        combineLatest([
            this.store.select(selectSelectedChatId),
            this.store.select(selectSelectedChat),
        ])
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([chatId, chat]) => {
                this.chatId = chatId;
                this.chat = chat;
            });
    }

    @validate
    async send(@required message: string): Promise<void> {
        this.message = '';
        this.isSending = true;
        try {
            await this.processSendMessage(message);
        } catch (e) {
            this.errorService.handleError(e, errorMessages.sendMessage);
        } finally {
            this.isSending = false;
        }
    }

    async onImageBufferReady(buffer: ArrayBuffer): Promise<void> {
        const base64 = URL.createObjectURL(new Blob([buffer]));
        const sizeLimits = environment.imageSettings.limits;
        try {
            const response = await this.imageUploadService.resizeAndUploadImage(
                base64 as string,
                sizeLimits.picture.width,
                sizeLimits.picture.height,
                ImageRoles.MESSAGE,
            );
            const messageDto = await this.apiService.sendMessage(
                this.chatId,
                undefined,
                response,
            );
            this.addMessageToStore(messageDto);
        } catch (e) {
            this.errorService.handleError(e, errorMessages.uploadImage);
        } finally {
            URL.revokeObjectURL(base64);
        }
    }

    private async processSendMessage(message: string): Promise<void> {
        if (this.shouldCreateIndividualChat()) {
            await this.handleIndividualChatCreation(message);
        } else {
            await this.handleMessageSending(message);
        }
    }

    private shouldCreateIndividualChat(): boolean {
        return (
            this.chat.isIndividual &&
            this.idGeneratorService.isFake(this.chatId)
        );
    }

    private async handleIndividualChatCreation(message: string): Promise<void> {
        const chatDto = await this.apiService.createIndividualChat(
            this.chat.accountIds[0],
        );
        await this.apiService.sendMessage(chatDto.id, message);
        this.storeService.updateChatId(this.chatId, chatDto.id);
        this.storeService.setSelectedChatId(chatDto.id);
    }

    private async handleMessageSending(message: string): Promise<void> {
        const messageDto = await this.apiService.sendMessage(
            this.chatId,
            message,
        );
        this.addMessageToStore(messageDto);
    }

    private addMessageToStore(messageDto: IMessageDto): void {
        messageDto.isMine = true;
        this.storeService.addMessage(messageDto);
        this.storeService.setLastMessageInfo(
            this.chatId,
            messageDto.created,
            messageDto.id,
        );
    }
}
