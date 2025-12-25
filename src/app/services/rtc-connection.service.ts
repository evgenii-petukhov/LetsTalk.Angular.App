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
    private config: RTCConfiguration = {
        iceServers: [
            {
                urls: [
                    'stun:stun.cloudflare.com:3478',
                    'stun:stun.cloudflare.com:53',
                ],
            },
            {
                urls: [
                    'turn:turn.cloudflare.com:3478?transport=udp',
                    'turn:turn.cloudflare.com:3478?transport=tcp',
                    'turns:turn.cloudflare.com:5349?transport=tcp',
                    'turn:turn.cloudflare.com:53?transport=udp',
                    'turn:turn.cloudflare.com:80?transport=tcp',
                    'turns:turn.cloudflare.com:443?transport=tcp',
                ],
                username:
                    'g06a9c09872f4d3f965175ffb1c23d5529f723250c6dfe219209fc204ba7eadb',
                credential:
                    'e8cd6ecd1c806f762521ac9086c3974b3c94101a0fa1b1839926616c9ce1fb46',
            },
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
    };
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
        this.connectionManager.initiateOffer(this.config);

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
        await this.connectionManager.handleOfferAndCreateAnswer(
            this.config,
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
