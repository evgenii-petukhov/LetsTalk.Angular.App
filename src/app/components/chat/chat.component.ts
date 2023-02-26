import { Component, Input, OnChanges } from "@angular/core";

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnChanges {
    @Input() accountId: number;

    ngOnChanges(): void {
        console.log(`Current accountId=${this.accountId}`);
    }
}
