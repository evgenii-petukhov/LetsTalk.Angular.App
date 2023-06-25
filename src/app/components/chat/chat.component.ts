import {
    AfterViewInit,
    Component,
    ElementRef,
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

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
    //https://pumpingco.de/blog/automatic-scrolling-only-if-a-user-already-scrolled-the-bottom-of-a-page-in-angular/
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('scrollItem') itemElements: QueryList<any>;
    message = '';
    faPaperPlane = faPaperPlane;
    messages$ = this.store.select(selectMessages);

    private accountId$ = this.store.select(selectSelectedAccountId);
    private scrollContainer: HTMLDivElement;
    private accountId: number;

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
        this.accountId$.subscribe(accountId => {
            this.accountId = accountId;
            this.loadMessages(accountId);
        });
    }

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }

    isMessageVisible(message: Message): string {
        return message.text;
    }

    private scrollToBottom(): void {
        this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    }

    private loadMessages(accountId: number): void {
        if (accountId === null) { return; }
        this.storeService.initMessages([]);
        this.apiService.getMessages(accountId).subscribe(messageDtos => {
            this.storeService.initMessages(messageDtos);
        });
    }
}
