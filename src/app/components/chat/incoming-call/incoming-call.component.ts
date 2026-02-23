import { Component, inject } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-incoming-call',
    templateUrl: './incoming-call.component.html',
    styleUrl: './incoming-call.component.scss',
    standalone: false,
})
export class IncomingCallComponent {
    private readonly storeService = inject(StoreService);

    onAcceptClicked(): void {
        this.storeService.acceptIncomingCall();
    }

    onDeclineClicked(): void {
        this.storeService.resetCall();
    }
}
