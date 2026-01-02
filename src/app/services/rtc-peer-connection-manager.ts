import { CandidateStat } from '../models/candidate-stat';
import { inject, Injectable } from '@angular/core';
import { IceStatisticsService } from './ice-statistics.service';

@Injectable({
    providedIn: 'root',
})
export class RtcPeerConnectionManager {
    onCandidatesReceived: (data: string) => void;
    onGatheringCompleted: () => {};
    private connection = new RTCPeerConnection();
    private localCandidates: RTCIceCandidate[] = [];
    private readonly iceStatisticsService = inject(IceStatisticsService);
    private isGathering = true;

    constructor() {
        this.connection.onicecandidate = this.onIceCandidateReceived.bind(this);
    }

    async initiateOffer(config: RTCConfiguration): Promise<void> {
        this.isGathering = true;
        this.localCandidates = [];
        this.connection.setConfiguration(config);

        const offer = await this.connection.createOffer();
        await this.connection.setLocalDescription(offer);
    }

    async handleOfferAndCreateAnswer(
        config: RTCConfiguration,
        desc: RTCSessionDescriptionInit,
        candidates: RTCIceCandidateInit[],
    ): Promise<void> {
        this.isGathering = true;
        this.localCandidates = [];
        this.connection.setConfiguration(config);

        await this.connection.setRemoteDescription(desc);
        if (candidates) {
            for (let c of candidates) await this.connection.addIceCandidate(c);
        }

        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);
    }

    requestCompleteGathering(): void {
        if (
            !this.iceStatisticsService.hasMinimumCandidateCount(
                this.localCandidates,
            )
        )
            return;

        const stat = this.getCandidateStatistics();
        if (this.iceStatisticsService.hasSufficientServers(stat)) {
            this.finalizeIceGathering(stat);
        }
    }

    async setRemoteAnswerAndCandidates(
        desc: RTCSessionDescriptionInit,
        candidates: RTCIceCandidateInit[],
    ): Promise<void> {
        if (this.connection.signalingState !== 'have-local-offer') {
            return;
        }

        await this.connection.setRemoteDescription(desc);
        if (candidates) {
            for (let c of candidates) await this.connection.addIceCandidate(c);
        }
    }

    startTrackingStream(
        stream: MediaStream,
        onTrack: (e: RTCTrackEvent) => void,
    ): void {
        if (stream && this.connection) {
            stream
                .getTracks()
                .forEach((track) => this.connection.addTrack(track, stream));
            this.connection.ontrack = onTrack;
        }
    }

    stopTrackingStream(stream: MediaStream): void {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
    }

    private onIceCandidateReceived(e: RTCPeerConnectionIceEvent): void {
        if (!this.isGathering) return;

        if (!e.candidate) {
            const stat = this.getCandidateStatistics();
            this.finalizeIceGathering(stat);
            return;
        }

        this.localCandidates.push(e.candidate);

        const data = {
            desc: this.connection.localDescription,
            candidates: this.localCandidates,
        };

        this.onCandidatesReceived?.(JSON.stringify(data));
    }

    private finalizeIceGathering(stat: CandidateStat): void {
        console.log('ICE statistics:', JSON.stringify(stat));
        this.isGathering = false;
        this.onGatheringCompleted?.();
    }

    private getCandidateStatistics() {
        return this.iceStatisticsService.getCandidateStatistics(
            this.localCandidates,
        );
    }
}
