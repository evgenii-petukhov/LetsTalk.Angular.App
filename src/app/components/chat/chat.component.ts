import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { Message } from "src/app/models/rendering/message";
import { ApiService } from '../../services/api.service';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { Store } from "@ngrx/store";
import { selectSelectedAccountId } from "src/app/state/selected-account-id/select-selected-account-id.selectors";
import { selectMessages } from "src/app/state/messages/messages.selector";
import { MessagesActions } from "src/app/state/messages/messages.actions";

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
    private scrollContainer: any;
    private accountId: number;

    constructor(
        private apiService: ApiService,
        private store: Store
    ) { }

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

    send(): boolean {
        if (!this.message.trim()) return;
        this.apiService.sendMessage(this.accountId, this.message).subscribe(response => {
            const message = new Message();
            message.date = response.created;
            message.text = response.text;
            message.isMine = true;
            this.store.dispatch(MessagesActions.add({message}));
        });
        this.message = '';
        return false;
    }

    private scrollToBottom(): void {
        this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    }

    private loadMessages(accountId: number): void {
        this.apiService.getMessages(accountId).subscribe(messages => {
            this.store.dispatch(MessagesActions.init({
                messages: messages.map((m) => {
                    const message = new Message();
                    message.text = m.text;
                    message.date = m.created;
                    message.isMine = m.senderId !== accountId
                    return message;
                })
            }));
        });
    }
}
