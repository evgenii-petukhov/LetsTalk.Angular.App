import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ApiService } from './api.service';
import { IceStatisticsService } from './ice-statistics.service';
import { CandidateStat } from '../models/CandidateStat';
import { Timer } from '../utils/timer';

@Injectable({
    providedIn: 'root',
})
export class RtcConnectionService {
    private readonly apiService = inject(ApiService);
    private readonly iceStatisticsService = inject(IceStatisticsService);
    private connection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
                urls: 'turn:relay1.expressturn.com:3480',
                username: '000000002081634833',
                credential: 'sHASFidRDCXTgfg6hGCGPQJ4xns=',
            },
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
    });
    private localCandidates: RTCIceCandidate[] = [];
    private iceCandidateSubject = new Subject<string>();
    private iceGatheringComplete = new Subject<void>();
    private iceGatheringTimer: Timer;
    private iceGatheringTimeoutMs = 5000;

    constructor() {
        this.connection.onicecandidate = this.handleOnIceCandidate.bind(this);
    }

    async initializeCallAsync(accountId: string): Promise<void> {
        this.localCandidates = [];

        const offer = await this.connection.createOffer();
        await this.connection.setLocalDescription(offer);

        this.iceGatheringTimer = new Timer(() => {
            this.forceCompleteIceGathering();
        }, this.iceGatheringTimeoutMs);

        const finalOffer = await lastValueFrom(
            this.iceCandidateSubject.pipe(takeUntil(this.iceGatheringComplete)),
        );

        return this.apiService.initializeCall(accountId, finalOffer);
    }

    async acceptCallAsync(accountId: string, offer: string): Promise<void> {
        const remote = JSON.parse(offer);
        await this.connection.setRemoteDescription(remote.desc);
        if (remote.candidates) {
            for (let c of remote.candidates)
                await this.connection.addIceCandidate(c);
        }

        this.localCandidates = [];

        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);

        this.iceGatheringTimer = new Timer(() => {
            this.forceCompleteIceGathering();
        }, this.iceGatheringTimeoutMs);

        const finalOffer = await lastValueFrom(
            this.iceCandidateSubject.pipe(takeUntil(this.iceGatheringComplete)),
        );

        return this.apiService.acceptCall(accountId, finalOffer);
    }

    async openChannelAsync(answer: string): Promise<void> {
        const remote = JSON.parse(answer);

        if (
            remote.desc.type !== 'answer' ||
            this.connection.signalingState !== 'have-local-offer'
        ) {
            return;
        }

        await this.connection.setRemoteDescription(remote.desc);
        if (remote.candidates) {
            for (let c of remote.candidates)
                await this.connection.addIceCandidate(c);
        }
    }

    handleOnIceCandidate(e: RTCPeerConnectionIceEvent): void {
        if (!e.candidate) {
            const stat = this.getStatistics();
            this.completeIceGathering(stat);
            return;
        }

        this.localCandidates.push(e.candidate);

        const data = {
            desc: this.connection.localDescription,
            candidates: this.localCandidates,
        };

        this.iceCandidateSubject.next(JSON.stringify(data));

        if (this.iceGatheringTimer.isExpired()) {
            this.forceCompleteIceGathering();
        }
    }

    getConnection(): RTCPeerConnection {
        return this.connection;
    }

    private completeIceGathering(stat: CandidateStat): void {
        console.log('ICE statistics:', JSON.stringify(stat));

        const data = {
            desc: this.connection.localDescription,
            candidates: this.localCandidates,
        };

        this.iceCandidateSubject.next(JSON.stringify(data));
        this.iceGatheringComplete.next();
        this.iceGatheringTimer.clear();
    }

    private forceCompleteIceGathering(): void {
        if (!this.iceStatisticsService.preCheck(this.localCandidates)) return;

        const stat = this.getStatistics();
        if (this.iceStatisticsService.hasSufficientServers(stat)) {
            this.completeIceGathering(stat);
        }
    }

    private getStatistics() {
        return this.iceStatisticsService.getCandidateStatistics(
            this.localCandidates,
        );
    }
}
