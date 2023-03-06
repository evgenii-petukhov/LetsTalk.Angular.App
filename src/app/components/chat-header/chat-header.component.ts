import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedAccount } from 'src/app/state/selected-account/select-selected-account.selector';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LayoutSettingsActions } from 'src/app/state/layout-settings/layout-settings.actions';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent {
    faArrowLeft = faArrowLeft;
    account$ = this.store.select(selectSelectedAccount);

    constructor(private store: Store) {}

    onBackClicked():void {
        this.store.dispatch(LayoutSettingsActions.init({
            settings: {
                activeArea: 'contacts'
            }
        }));
    }
}
