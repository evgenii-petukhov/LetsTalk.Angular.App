import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ApiService } from './api.service';
import { Timer } from '../utils/timer';
import { RtcPeerConnectionManager } from './rtc-peer-connection-manager';

@Injectable({
    providedIn: 'root',
})
export class RtcConnectionService {
    private readonly apiService = inject(ApiService);
    private readonly connectionManager = inject(RtcPeerConnectionManager);
    private iceCandidateSubject = new Subject<string>();
    private iceGatheringComplete = new Subject<void>();
    private iceGatheringTimer: Timer;
    private iceGatheringTimeoutMs = 5000;

    constructor() {
        this.connectionManager.onCandidatesReceived =
            this.onIceCandidateGenerated.bind(this);
        this.connectionManager.onGatheringCompleted =
            this.onIceGatheringComplete.bind(this);
    }

    async startOutgoingCall(accountId: string): Promise<void> {
        const callSettings = await this.apiService.getCallSettings();
        this.connectionManager.initiateOffer(JSON.parse(callSettings.iceServerConfiguration));

        this.iceGatheringTimer = new Timer(() => {
            this.connectionManager.requestCompleteGathering();
        }, this.iceGatheringTimeoutMs);

        const finalOffer = await lastValueFrom(
            this.iceCandidateSubject.pipe(takeUntil(this.iceGatheringComplete)),
        );

        return this.apiService.startOutgoingCall(accountId, finalOffer);
    }

    async handleIncomingCall(accountId: string, offer: string): Promise<void> {
        const remote = JSON.parse(offer);
        const callSettings = await this.apiService.getCallSettings();

        await this.connectionManager.handleOfferAndCreateAnswer(
            JSON.parse(callSettings.iceServerConfiguration),
            remote.desc,
            remote.candidates,
        );

        this.iceGatheringTimer = new Timer(() => {
            this.connectionManager.requestCompleteGathering();
        }, this.iceGatheringTimeoutMs);

        const finalOffer = await lastValueFrom(
            this.iceCandidateSubject.pipe(takeUntil(this.iceGatheringComplete)),
        );

        return this.apiService.handleIncomingCall(accountId, finalOffer);
    }

    async establishConnection(answer: string): Promise<void> {
        const remote = JSON.parse(answer);

        if (remote.desc.type !== 'answer') return;

        await this.connectionManager.setRemoteAnswerAndCandidates(
            remote.desc,
            remote.candidates,
        );
    }

    private onIceCandidateGenerated(data: string): void {
        this.iceCandidateSubject.next(data);

        if (this.iceGatheringTimer.isExpired()) {
            this.connectionManager.requestCompleteGathering();
        }
    }

    private onIceGatheringComplete(): void {
        this.iceGatheringComplete.next();
        this.iceGatheringTimer.clear();
    }
}
