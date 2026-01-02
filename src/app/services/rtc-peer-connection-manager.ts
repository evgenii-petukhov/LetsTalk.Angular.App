import { IceCandidateMetrics } from '../models/ice-candidate-metrics';
import { inject, Injectable } from '@angular/core';
import { IceCandidateMetricsService } from './ice-candidate-metrics.service';

@Injectable({
    providedIn: 'root',
})
export class RtcPeerConnectionManager {
    onCandidatesReceived: (data: string) => void;
    onGatheringCompleted: () => {};
    private connection = new RTCPeerConnection();
    private localCandidates: RTCIceCandidate[] = [];
    private readonly iceCandidateMetricsService = inject(IceCandidateMetricsService);
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
            !this.iceCandidateMetricsService.hasMinimumCandidateCount(
                this.localCandidates,
            )
        )
            return;

        const stats = this.getCandidateMetrics();
        if (this.iceCandidateMetricsService.hasSufficientServers(stats)) {
            this.finalizeIceGathering(stats);
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
            const stats = this.getCandidateMetrics();
            this.finalizeIceGathering(stats);
            return;
        }

        this.localCandidates.push(e.candidate);

        const data = {
            desc: this.connection.localDescription,
            candidates: this.localCandidates,
        };

        this.onCandidatesReceived?.(JSON.stringify(data));
    }

    private finalizeIceGathering(stat: IceCandidateMetrics): void {
        this.isGathering = false;
        this.onGatheringCompleted?.();
    }

    private getCandidateMetrics() {
        return this.iceCandidateMetricsService.getIceCandidateMetrics(
            this.localCandidates,
        );
    }
}
