import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Store } from '@ngrx/store';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectMessages } from 'src/app/state/messages/messages.selector';
import { StoreService } from 'src/app/services/store.service';
import { Message } from 'src/app/models/message';
import { Subject, takeUntil } from 'rxjs';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: false,
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
    // https://pumpingco.de/blog/automatic-scrolling-only-if-a-user-already-scrolled-the-bottom-of-a-page-in-angular/
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    @ViewChildren('scrollItem') itemElements: QueryList<any>;
    messages: readonly Message[] = [];
    private scrollContainer: HTMLDivElement;
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
        private idGeneratorService: IdGeneratorService,
        private location: Location,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/messenger');
        
        this.store
            .select(selectSelectedChatId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (chatId) => {
                this.chatId = chatId;
                this.storeService.initMessages([]);
                this.pageIndex = 0;
                this.scrollCounter = 0;
                this.isMessageListLoaded = false;
                await this.loadMessages();
            });

        this.store
            .select(selectMessages)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (messages) => {
                this.messages = messages;
            });
    }

    ngAfterViewInit(): void {
        this.scrollContainer = this.scrollFrame.nativeElement;
        this.itemElements.changes
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.scrollSequencePromise = this.scrollSequencePromise.then(
                    () => {
                        this.scrollToBottom();
                    },
                );
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isMessageVisible(message: Message): boolean {
        return !!message.text || !!message.image;
    }

    async onScroll(): Promise<void> {
        if (
            this.isMessageListLoaded &&
            this.scrollFrame.nativeElement.scrollTop === 0
        ) {
            await this.loadMessages();
        }
    }

    private scrollToBottom(): void {
        const scrollHeight =
            this.scrollCounter === 0
                ? this.scrollContainer.scrollHeight
                : this.scrollContainer.scrollHeight - this.previousScrollHeight;

        if (!scrollHeight) {
            return;
        }

        this.scrollContainer.scroll({
            top: scrollHeight,
            left: 0,
            behavior: 'auto',
        });

        this.decreaseScrollCounter();
    }

    private async loadMessages(): Promise<void> {
        if (
            this.chatId === null ||
            this.idGeneratorService.isFake(this.chatId)
        ) {
            this.isMessageListLoaded = true;
            return;
        }
        this.scrollCounter++;
        this.previousScrollHeight = this.scrollContainer?.scrollHeight ?? 0;
        const messageDtos = await this.apiService.getMessages(
            this.chatId,
            this.pageIndex,
        );
        this.storeService.addMessages(messageDtos);
        if (!this.isMessageListLoaded) {
            const lastMessageDate = messageDtos.length
                ? Math.max(...messageDtos.map((x) => x.created))
                : 0;

            const lastMessageId = messageDtos.length
                ? messageDtos.find(
                      (message) => message.created === lastMessageDate,
                  )?.id
                : '';

            this.storeService.setLastMessageInfo(
                this.chatId,
                lastMessageDate,
                lastMessageId,
            );
            this.isMessageListLoaded = true;
        }
        if (messageDtos.length === 0) {
            this.decreaseScrollCounter();
        } else {
            this.pageIndex++;
        }
    }

    private decreaseScrollCounter(): void {
        this.scrollCounter =
            (this.scrollCounter > 0 ? -1 : 0) + this.scrollCounter;
    }
}
