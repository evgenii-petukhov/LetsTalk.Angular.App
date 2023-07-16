import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedAccount } from 'src/app/state/selected-account/select-selected-account.selector';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent {
    faChevronLeft = faChevronLeft;
    account$ = this.store.select(selectSelectedAccount);

    constructor(
        private store: Store,
        private storeService: StoreService) {}

    onBackClicked(): void {
        this.storeService.setLayoutSettings({ activeArea: 'contacts' });
        this.storeService.setSelectedAccountId(null);
    }
}
