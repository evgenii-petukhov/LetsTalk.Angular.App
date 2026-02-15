import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ApiService } from './api.service';
import { Timer } from '../utils/timer';
import { RtcPeerConnectionManager } from './rtc-peer-connection-manager';
import { StoreService } from './store.service';

@Injectable({
    providedIn: 'root',
})
export class RtcConnectionService {
    private readonly apiService = inject(ApiService);
    private readonly connectionManager = inject(RtcPeerConnectionManager);
    private readonly storeService = inject(StoreService);
    private iceCandidateSubject = new Subject<string>();
    private iceGatheringComplete = new Subject<void>();
    private iceGatheringTimer: Timer;
    private iceGatheringTimeoutMs = 10000;
    private iceGatheringElapsedMs = 0;
    private iceGatheringCollectedAll = false;

    constructor() {
        this.connectionManager.onCandidatesReceived =
            this.onIceCandidateGenerated.bind(this);
        this.connectionManager.onGatheringCompleted =
            this.onIceGatheringComplete.bind(this);
        this.connectionManager.onConnectionStateChange =
            this.onConnectionStateChange.bind(this);
    }

    async startOutgoingCall(chatId: string): Promise<void> {
        const callSettings = await this.apiService.getCallSettings();
        this.connectionManager.initiateOffer(
            JSON.parse(callSettings.iceServerConfiguration),
        );

        this.iceGatheringTimer = new Timer(() => {
            this.connectionManager.requestCompleteGathering();
        }, this.iceGatheringTimeoutMs);

        const finalOffer = await lastValueFrom(
            this.iceCandidateSubject.pipe(takeUntil(this.iceGatheringComplete)),
        );

        const diagnostics = await this.connectionManager.getDiagnostics();

        const { callId } = await this.apiService.startOutgoingCall(
            chatId,
            finalOffer,
            this.iceGatheringElapsedMs,
            this.iceGatheringCollectedAll,
            diagnostics,
        );

        this.connectionManager.setCallContext(callId, chatId);
    }

    async handleIncomingCall(
        callId: string,
        chatId: string,
        offer: string,
    ): Promise<void> {
        const remote = JSON.parse(offer);
        const callSettings = await this.apiService.getCallSettings();

        this.connectionManager.setCallContext(callId, chatId);

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

        const diagnostics = await this.connectionManager.getDiagnostics();

        return this.apiService.handleIncomingCall(
            callId,
            chatId,
            finalOffer,
            this.iceGatheringElapsedMs,
            this.iceGatheringCollectedAll,
            diagnostics,
        );
    }

    async establishConnection(answer: string): Promise<void> {
        const remote = JSON.parse(answer);

        if (remote.desc.type !== 'answer') return;

        await this.connectionManager.setRemoteAnswerAndCandidates(
            remote.desc,
            remote.candidates,
        );
    }

    endCall(): void {
        this.processEndCall();
    }

    private onIceCandidateGenerated(data: string): void {
        this.iceCandidateSubject.next(data);

        if (this.iceGatheringTimer.isExpired()) {
            this.connectionManager.requestCompleteGathering();
        }
    }

    private onIceGatheringComplete(
        timeElapsed: number,
        collectedAll: boolean,
    ): void {
        this.iceGatheringElapsedMs = timeElapsed;
        this.iceGatheringCollectedAll = collectedAll;
        this.iceGatheringComplete.next();
        this.iceGatheringTimer.clear();
    }

    private async onConnectionStateChange(
        state: RTCPeerConnectionState,
        callId: string,
        chatId: string,
    ): Promise<void> {
        switch (state) {
            case 'connected':
            case 'failed':
                const diagnostics =
                    await this.connectionManager.getDiagnostics();
                if (state === 'connected') {
                    await this.apiService.logConnectionEstablished(
                        callId,
                        chatId,
                        diagnostics,
                    );
                } else {
                    await this.apiService.logConnectionFailed(
                        callId,
                        chatId,
                        diagnostics,
                    );
                }
                break;
            case 'disconnected':
                this.processEndCall();
                break;
        }
    }

    private processEndCall() {
        this.connectionManager.reinitialize();
        this.storeService.resetCall();
    }
}
