import { Component, Input, OnChanges } from "@angular/core";
import { Account } from "src/app/models/rendering/account";

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnChanges {
    @Input() account: Account;

    ngOnChanges(): void {
        
    }
}
