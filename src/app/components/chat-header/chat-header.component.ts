import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { StoreService } from 'src/app/services/store.service';
import { ActiveArea } from 'src/app/enums/active-areas';

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
        this.storeService.setLayoutSettings({ activeArea: ActiveArea.sidebar });
        this.storeService.setSelectedChatId(null);
    }
}
