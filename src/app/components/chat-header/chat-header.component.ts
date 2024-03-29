import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChat } from 'src/app/state/selected-chat/select-selected-chat.selector';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent {
    faChevronLeft = faChevronLeft;
    chat$ = this.store.select(selectSelectedChat);

    constructor(
        private store: Store,
        private storeService: StoreService) {}

    onBackClicked(): void {
        this.storeService.setLayoutSettings({ activeArea: 'contacts' });
        this.storeService.setSelectedChatId(null);
    }
}
