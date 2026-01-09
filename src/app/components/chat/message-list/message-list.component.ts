import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    QueryList,
    ViewChild,
    ViewChildren, OnInit,
    signal,
} from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Store } from '@ngrx/store';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectMessages } from 'src/app/state/messages/messages.selector';
import { StoreService } from 'src/app/services/store.service';
import { Message } from 'src/app/models/message';
import { Subject, takeUntil } from 'rxjs';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ProblemDetails } from 'src/app/api-client/api-client';
import { MessageListStatus } from 'src/app/models/message-list-status';

@Component({
    selector: 'app-message-list',
    templateUrl: './message-list.component.html',
    styleUrl: './message-list.component.scss',
    standalone: false,
})
export class MessageListComponent implements AfterViewInit, OnDestroy, OnInit {
    // https://pumpingco.de/blog/automatic-scrolling-only-if-a-user-already-scrolled-the-bottom-of-a-page-in-angular/
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    @ViewChildren('scrollItem') itemElements: QueryList<any>;
    messages = signal<readonly Message[]>([]);

    private scrollContainer: HTMLDivElement;
    private chatId: string;
    private pageIndex = 0;
    private scrollCounter = 0;
    private isMessageListLoaded = false;
    private previousScrollHeight = 0;
    private scrollSequencePromise = Promise.resolve();

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly apiService = inject(ApiService);
    private readonly store = inject(Store);
    private readonly storeService = inject(StoreService);
    private readonly idGeneratorService = inject(IdGeneratorService);

    ngOnInit(): void {
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
                this.messages.set(messages);
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
        if (this.chatId === null) {
            this.isMessageListLoaded = true;
            return;
        }

        if (this.idGeneratorService.isFake(this.chatId)) {
            const isChatIdValid = await this.storeService.isChatIdValid(
                this.chatId,
            );
            if (isChatIdValid) {
                this.isMessageListLoaded = true;
                this.storeService.setSelectedChatMessageListStatus(MessageListStatus.Success);
            } else {
                this.storeService.setSelectedChatMessageListStatus(MessageListStatus.NotFound);
            }

            return;
        }
        this.scrollCounter++;
        this.previousScrollHeight = this.scrollContainer?.scrollHeight ?? 0;
        try {
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
                this.storeService.setSelectedChatMessageListStatus(MessageListStatus.Success);
            }
            if (messageDtos.length === 0) {
                this.decreaseScrollCounter();
            } else {
                this.pageIndex++;
            }
        } catch (e) {
            if (e instanceof ProblemDetails && e.status === 404) {
                this.storeService.setSelectedChatMessageListStatus(MessageListStatus.NotFound);
            } else {
                this.storeService.setSelectedChatMessageListStatus(MessageListStatus.Error);
            }
        }
    }

    private decreaseScrollCounter(): void {
        this.scrollCounter =
            (this.scrollCounter > 0 ? -1 : 0) + this.scrollCounter;
    }
}
