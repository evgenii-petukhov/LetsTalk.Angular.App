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
import { AccountDto } from "src/app/api-client/api-client";
import { Store } from "@ngrx/store";
import { selectSelectedAccount } from "src/app/state/selected-account/selectedSelectedAccount.selectors";
import { selectMessages } from "src/app/state/messages/messages.selectors";
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
    account$= this.store.select(selectSelectedAccount);
    messages$ = this.store.select(selectMessages);

    private scrollContainer: any;
    private account: AccountDto;

    constructor(
        private apiService: ApiService,
        private store: Store
    ) { }

    ngOnInit(): void {
        this.account$.subscribe(account => {
            this.account = account;
            this.loadMessages(account.id);
        });
    }

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }

    private scrollToBottom(): void {
        this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    }

    send(): void {
        if (!this.message.trim()) return;
        
        this.apiService.sendMessage(this.account.id, this.message).subscribe(response => {
            this.message = '';
            const message = new Message();
            message.date = response.created;
            message.text = response.text;
            message.isMine = true;
            this.store.dispatch(MessagesActions.add({message}));
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
