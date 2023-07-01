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
import { Store } from '@ngrx/store';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { selectMessages } from 'src/app/state/messages/messages.selector';
import { StoreService } from 'src/app/services/store.service';
import { Message } from 'src/app/models/message';
import { required, validate } from 'src/app/decorators/required.decorator';
import { Subject, takeUntil } from 'rxjs';

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
    messages$ = this.store.select(selectMessages);

    private accountId$ = this.store.select(selectSelectedAccountId);
    private scrollContainer: HTMLDivElement;
    private accountId: number;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private pageIndex = 0;
    private scrollCounter = 0;
    private isMessageListLoaded = false;

    constructor(
        private apiService: ApiService,
        private store: Store,
        private storeService: StoreService
    ) { }

    @validate
    send(@required message: string): void {
        this.apiService.sendMessage(this.accountId, message).subscribe(messageDto => {
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
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }
    
    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isMessageVisible(message: Message): string {
        return message.text;
    }

    onScroll(): void {
        if (this.isMessageListLoaded && this.scrollFrame.nativeElement.scrollTop === 0) {
            this.loadMessages(this.accountId);
        }
    }

    private scrollToBottom(): void {
        const scrollHeight = (this.scrollCounter === 0 ? 1 : .025) * this.scrollContainer.scrollHeight;

        this.scrollContainer.scroll({
            top: scrollHeight,
            left: 0,
            behavior: 'auto'
        });

        this.decreaseScrollCounter();
    }

    private loadMessages(accountId: number): void {
        if (accountId === null) { return; }
        this.pageIndex++;
        this.scrollCounter++;
        this.apiService.getMessages(accountId, this.pageIndex).subscribe(messageDtos => {
            this.storeService.addMessages(messageDtos);
            this.isMessageListLoaded = true;
            if (messageDtos.length === 0) {
                this.decreaseScrollCounter();
            }
        });
    }

    private decreaseScrollCounter(): void {
        this.scrollCounter = (this.scrollCounter > 0 ? -1 : 0) + this.scrollCounter;
    }
}
