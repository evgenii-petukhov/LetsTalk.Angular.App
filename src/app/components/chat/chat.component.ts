import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectMessages } from 'src/app/state/messages/messages.selector';
import { StoreService } from 'src/app/services/store.service';
import { Message } from 'src/app/models/message';
import { required, validate } from 'src/app/decorators/required.decorator';
import { Subject, take, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ImageService } from 'src/app/services/image.service';
import { ImageRoles } from 'src/app/protos/file_upload_pb';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { IChatDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
    //https://pumpingco.de/blog/automatic-scrolling-only-if-a-user-already-scrolled-the-bottom-of-a-page-in-angular/
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('scrollItem') itemElements: QueryList<any>;
    message = '';
    faPaperPlane = faPaperPlane;
    faCamera = faCamera;
    messages$ = this.store.select(selectMessages);

    private scrollContainer: HTMLDivElement;
    private chat: IChatDto;
    private chatId: string;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private pageIndex = 0;
    private scrollCounter = 0;
    private isMessageListLoaded = false;
    private previousScrollHeight = 0;
    private scrollSequencePromise = Promise.resolve();

    constructor(
        private apiService: ApiService,
        private store: Store,
        private storeService: StoreService,
        private imageService: ImageService,
        private fileStorageService: FileStorageService,
        private idGeneratorService: IdGeneratorService) { }

    @validate
    send(@required message: string): void {
        this.message = '';

        if (this.chat.isIndividual && this.idGeneratorService.isFake(this.chatId)) {
            this.apiService.createIndividualChat(this.chat.accountIds[0]).pipe(take(1)).subscribe(chatDto => {
                this.apiService.sendMessage(chatDto.id, message).pipe(take(1)).subscribe(() => {
                    this.storeService.updateChatId(this.chatId, chatDto.id);
                    this.storeService.setSelectedChatId(chatDto.id);
                });
            });
        } else {
            this.apiService.sendMessage(this.chatId, message).pipe(take(1)).subscribe(messageDto => {
                messageDto.isMine = true;
                this.storeService.addMessage(messageDto);
                this.storeService.setLastMessageInfo(this.chatId, messageDto.created, messageDto.id);
            });
        }
    }

    ngOnInit(): void {
        this.store.select(selectSelectedChatId).pipe(takeUntil(this.unsubscribe$)).subscribe(chatId => {
            this.chatId = chatId;
            this.storeService.initMessages([]);
            this.pageIndex = 0;
            this.scrollCounter = 0;
            this.isMessageListLoaded = false;
            this.loadMessages();
        });

        this.store.select(selectSelectedChat).pipe(takeUntil(this.unsubscribe$)).subscribe(chat => {
            this.chat = chat;
        });
    }

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        this.itemElements.changes.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.scrollSequencePromise = this.scrollSequencePromise.then(() => {
                this.scrollToBottom();
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isMessageVisible(message: Message): boolean {
        return !!message.text || !!message.imageId;
    }

    onScroll(): void {
        if (this.isMessageListLoaded && this.scrollFrame.nativeElement.scrollTop === 0) {
            this.loadMessages();
        }
    }

    onImageSelected(event: Event): void {
        const eventTarget = (event.target as HTMLInputElement);
        if (eventTarget.files && eventTarget.files.length) {
            eventTarget.files[0].arrayBuffer().then((buffer: ArrayBuffer) => {
                const base64 = URL.createObjectURL(new Blob([buffer]));
                const sizeLimits = environment.imageSettings.limits;
                this.resizeImage(base64 as string, sizeLimits.picture.width, sizeLimits.picture.height).then((blob: Blob) => {
                    return this.fileStorageService.uploadImageAsBlob(blob, ImageRoles.MESSAGE);
                }).then(response => {
                    this.apiService.sendMessage(
                        this.chatId,
                        undefined,
                        response
                    ).pipe(take(1)).subscribe(messageDto => {
                        messageDto.isMine = true;
                        this.storeService.addMessage(messageDto);
                        this.storeService.setLastMessageInfo(this.chatId, messageDto.created, messageDto.id);
                        eventTarget.value = null;
                    });
                }).catch(e => {
                    eventTarget.value = null;
                    console.error(e);
                }).finally(() => {
                    URL.revokeObjectURL(base64);
                });
            });
        }
    }

    private scrollToBottom(): void {
        const scrollHeight = this.scrollCounter === 0 ? this.scrollContainer.scrollHeight : this.scrollContainer.scrollHeight - this.previousScrollHeight;

        if (!scrollHeight) {
            return;
        }

        this.scrollContainer.scroll({
            top: scrollHeight,
            left: 0,
            behavior: 'auto'
        });

        this.decreaseScrollCounter();
    }

    private loadMessages(): void {
        if (this.chatId === null || this.idGeneratorService.isFake(this.chatId)) {
            this.isMessageListLoaded = true;
            return;
        }
        this.scrollCounter++;
        this.previousScrollHeight = this.scrollContainer?.scrollHeight ?? 0;
        this.apiService.getMessages(
            this.chatId,
            this.pageIndex
        ).pipe(takeUntil(this.unsubscribe$)).subscribe(messageDtos => {
            this.storeService.addMessages(messageDtos);
            if (!this.isMessageListLoaded) {
                const lastMessageDate = messageDtos.length
                    ? Math.max(... messageDtos.map(x => x.created))
                    : 0;

                const lastMessageId = messageDtos.length
                    ? messageDtos.find(message => message.created === lastMessageDate)?.id
                    : '';

                this.storeService.setLastMessageInfo(this.chatId, lastMessageDate, lastMessageId);
                this.isMessageListLoaded = true;
            }
            if (messageDtos.length === 0) {
                this.decreaseScrollCounter();
            } else {
                this.pageIndex++;
            }
        });
    }

    private decreaseScrollCounter(): void {
        this.scrollCounter = (this.scrollCounter > 0 ? -1 : 0) + this.scrollCounter;
    }

    private resizeImage(photoUrl: string, maxWidth: number, maxHeight: number): Promise<Blob> {
        return photoUrl ? this.imageService.resizeBase64Image(photoUrl, maxWidth, maxHeight) : Promise.resolve(null);
    }
}
