import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { Account } from "src/app/models/rendering/account";
import { Message } from "src/app/models/rendering/message";
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewInit {
    @Input() account: Account;
    @Input() messages: Message[];
    @Output() messageSentEvent = new EventEmitter<Message>();
    //https://pumpingco.de/blog/automatic-scrolling-only-if-a-user-already-scrolled-the-bottom-of-a-page-in-angular/
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('scrollItem') itemElements: QueryList<any>;
    message = '';

    private scrollContainer: any;

    constructor(
        private apiService: ApiService
    ) { }

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
        this.apiService.sendMessage(this.account.id, this.message).subscribe(response => {
            this.message = '';
            const message = new Message();
            message.date = response.created;
            message.text = response.text;
            message.isMine = true;
            this.messageSentEvent.emit(message);
        });
    }
}
