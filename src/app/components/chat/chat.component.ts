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
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { selectMessages } from 'src/app/state/messages/messages.selector';
import { StoreService } from 'src/app/services/store.service';
import { Message } from 'src/app/models/message';
import { required, validate } from 'src/app/decorators/required.decorator';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ImageService } from 'src/app/services/image.service';
import { ImageRoles } from 'src/app/protos/file_upload_pb';
import { FileStorageService } from 'src/app/services/file-storage.service';

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

    private accountId$ = this.store.select(selectSelectedAccountId);
    private scrollContainer: HTMLDivElement;
    private accountId: number;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private pageIndex = 0;
    private scrollCounter = 0;
    private isMessageListLoaded = false;
    private previousScrollHeight = 0;

    constructor(
        private apiService: ApiService,
        private store: Store,
        private storeService: StoreService,
        private imageService: ImageService,
        private fileStorageService: FileStorageService
    ) { }

    @validate
    send(@required message: string): void {
        this.apiService.sendMessage(
            this.accountId,
            message
        ).pipe(takeUntil(this.unsubscribe$)).subscribe(messageDto => {
            messageDto.isMine = true;
            this.storeService.addMessage(messageDto);
            this.storeService.setLastMessageDate(this.accountId, messageDto.created);
        });
        this.message = '';
    }

    ngOnInit(): void {
        this.accountId$.pipe(takeUntil(this.unsubscribe$)).subscribe(accountId => {
            this.accountId = accountId;
            this.storeService.initMessages([]);
            this.pageIndex = 0;
            this.scrollCounter = 0;
            this.isMessageListLoaded = false;
            this.loadMessages(accountId);
        });
    }

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        this.itemElements.changes.pipe(takeUntil(this.unsubscribe$)).subscribe(() => this.scrollToBottom());
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
            this.loadMessages(this.accountId);
        }
    }

    onImageSelected(event: Event): void {
        const eventTarget = (event.target as HTMLInputElement);
        if (eventTarget.files && eventTarget.files.length) {
            eventTarget.files[0].arrayBuffer().then((buffer: ArrayBuffer) => {
                const base64 = URL.createObjectURL(new Blob([buffer]));
                const env = (environment as any);
                this.resizeImage(base64 as string, env.pictureMaxWidth, env.pictureMaxHeight).then((blob: Blob) => {
                    return this.fileStorageService.uploadImageAsBlob(blob, ImageRoles.MESSAGE);
                }).then(response => {
                    this.apiService.sendMessage(
                        this.accountId,
                        undefined,
                        response.getImageId()
                    ).pipe(takeUntil(this.unsubscribe$)).subscribe(messageDto => {
                        messageDto.isMine = true;
                        this.storeService.addMessage(messageDto);
                        this.storeService.setLastMessageDate(this.accountId, messageDto.created);
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

        this.scrollContainer.scroll({
            top: scrollHeight,
            left: 0,
            behavior: 'auto'
        });

        this.decreaseScrollCounter();
    }

    private loadMessages(accountId: number): void {
        if (accountId === null) { return; }
        this.scrollCounter++;
        this.previousScrollHeight = this.scrollContainer?.scrollHeight ?? 0;
        this.apiService.getMessages(
            accountId,
            this.pageIndex
        ).pipe(takeUntil(this.unsubscribe$)).subscribe(messageDtos => {
            this.storeService.addMessages(messageDtos);
            this.isMessageListLoaded = true;
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
