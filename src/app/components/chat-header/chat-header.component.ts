import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedAccount } from 'src/app/state/selected-account/select-selected-account.selector';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent {
    constructor(private store: Store) {}

    account$ = this.store.select(selectSelectedAccount);
}
