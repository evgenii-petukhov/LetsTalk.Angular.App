import { Component, OnInit } from '@angular/core';
import { required, validate } from 'src/app/decorators/required.decorator';
import { IChatDto } from 'src/app/api-client/api-client';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ApiService } from 'src/app/services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { errorMessages } from 'src/app/constants/errors';
import { ErrorService } from 'src/app/services/error.service';
import { environment } from 'src/environments/environment';
import { ImageRoles } from 'src/app/protos/file_upload_pb';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { ImageService } from 'src/app/services/image.service';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-send-message',
    templateUrl: './send-message.component.html',
    styleUrl: './send-message.component.scss'
})
export class SendMessageComponent implements OnInit {
    message = '';
    isSending = false;
    faPaperPlane = faPaperPlane;
    faCamera = faCamera;
    private chat: IChatDto;
    private chatId: string;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private apiService: ApiService,
        private errorService: ErrorService,
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService,
        private imageService: ImageService,
        private fileStorageService: FileStorageService,
    ) {}

    ngOnInit(): void {
        this.store.select(selectSelectedChatId).pipe(takeUntil(this.unsubscribe$)).subscribe(chatId => {
            this.chatId = chatId;
        });

        this.store.select(selectSelectedChat).pipe(takeUntil(this.unsubscribe$)).subscribe(chat => {
            this.chat = chat;
        });
    }

    @validate
    async send(@required message: string): Promise<void> {
        this.message = '';
        this.isSending = true;
        try {
            if (this.chat.isIndividual && this.idGeneratorService.isFake(this.chatId)) {
                const chatDto = await this.apiService.createIndividualChat(this.chat.accountIds[0]);
                await this.apiService.sendMessage(chatDto.id, message);
                this.storeService.updateChatId(this.chatId, chatDto.id);
                this.storeService.setSelectedChatId(chatDto.id);
            } else {
                const messageDto = await this.apiService.sendMessage(this.chatId, message);
                messageDto.isMine = true;
                this.storeService.addMessage(messageDto);
                this.storeService.setLastMessageInfo(this.chatId, messageDto.created, messageDto.id);
            }
        }
        catch (e) {
            this.handleSubmitError(e, errorMessages.sendMessage);
        }
        finally {
            this.isSending = false;
        }
    }

    async onImageSelected(event: Event): Promise<void> {
        const eventTarget = (event.target as HTMLInputElement);
        if (eventTarget.files && eventTarget.files.length) {
            const buffer = await eventTarget.files[0].arrayBuffer();
            const base64 = URL.createObjectURL(new Blob([buffer]));
            const sizeLimits = environment.imageSettings.limits;
            const blob = await this.resizeImage(base64 as string, sizeLimits.picture.width, sizeLimits.picture.height);
            try {
                const response = await this.fileStorageService.uploadImageAsBlob(blob, ImageRoles.MESSAGE);
                const messageDto = await this.apiService.sendMessage(this.chatId, undefined, response);
                messageDto.isMine = true;
                this.storeService.addMessage(messageDto);
                this.storeService.setLastMessageInfo(this.chatId, messageDto.created, messageDto.id);
                eventTarget.value = null;
            }
            catch (e) {
                eventTarget.value = null;
                console.error(e);
                this.handleSubmitError(e, errorMessages.uploadImage);
            }
            finally {
                URL.revokeObjectURL(base64);
            }
        }
    }

    private resizeImage(photoUrl: string, maxWidth: number, maxHeight: number): Promise<Blob> {
        return photoUrl
            ? this.imageService.resizeBase64Image(photoUrl, maxWidth, maxHeight)
            : Promise.resolve(null);
    }

    private handleSubmitError(e: any, defaultMessage: string) {
        this.errorService.handleError(e, defaultMessage);
    }
}
