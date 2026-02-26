import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { selectVideoCall } from 'src/app/state/video-call/video-call.selectors';

@Component({
    selector: 'app-incoming-call',
    templateUrl: './incoming-call.component.html',
    styleUrl: './incoming-call.component.scss',
    standalone: false,
})
export class IncomingCallComponent {
    private readonly storeService = inject(StoreService);
    private readonly store = inject(Store);

    urlOptions = toSignal(
        this.store
            .select(selectVideoCall)
            .pipe(
                map(
                    (videoCall) =>
                        videoCall?.caller && [
                            videoCall.caller.image,
                            videoCall.caller.photoUrl,
                        ],
                ),
            ),
    );

    onAcceptClicked(): void {
        this.storeService.acceptIncomingCall();
    }

    onDeclineClicked(): void {
        this.storeService.resetCall();
    }
}
