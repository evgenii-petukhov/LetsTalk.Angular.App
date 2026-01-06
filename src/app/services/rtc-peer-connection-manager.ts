import { IceCandidateMetrics } from '../models/ice-candidate-metrics';
import { inject, Injectable } from '@angular/core';
import { IceCandidateMetricsService } from './ice-candidate-metrics.service';

@Injectable({
    providedIn: 'root',
})
export class RtcPeerConnectionManager {
    onCandidatesReceived: (data: string) => void;
    onGatheringCompleted: () => {};
    isMediaCaptured = false;
    private connection = new RTCPeerConnection();
    private localCandidates: RTCIceCandidate[] = [];
    private readonly iceCandidateMetricsService = inject(
        IceCandidateMetricsService,
    );
    private isGathering = true;
    private localMediaStream: MediaStream | null = null;
    private remoteMediaStream: MediaStream | null = null;

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

    async startMediaCapture(
        localVideo: HTMLVideoElement,
        remoteVideo: HTMLVideoElement,
    ): Promise<void> {
        try {
            this.localMediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            this.connectLocalVideo(localVideo);
            this.localMediaStream
                .getTracks()
                .forEach((track) =>
                    this.connection.addTrack(track, this.localMediaStream),
                );
            this.connection.ontrack = (e) => {
                this.remoteMediaStream = e.streams[0];
                this.connectRemoteVideo(remoteVideo);
            };
            this.isMediaCaptured = true;
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    reconnectVideoElements(
        localVideo: HTMLVideoElement,
        remoteVideo: HTMLVideoElement,
    ): void {
        this.connectLocalVideo(localVideo);
        this.connectRemoteVideo(remoteVideo);
    }

    private connectLocalVideo(localVideo: HTMLVideoElement): void {
        if (this.localMediaStream && localVideo) {
            localVideo.srcObject = this.localMediaStream;
        }
    }

    private connectRemoteVideo(remoteVideo: HTMLVideoElement): void {
        if (this.remoteMediaStream && remoteVideo) {
            remoteVideo.srcObject = this.remoteMediaStream;
        }
    }

    setVideoEnabled(enabled: boolean): void {
        if (this.localMediaStream) {
            const videoTracks = this.localMediaStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    setAudioEnabled(enabled: boolean): void {
        if (this.localMediaStream) {
            const audioTracks = this.localMediaStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    endCall(): void {
        if (this.connection) {
            if (this.localMediaStream) {
                this.localMediaStream
                    .getTracks()
                    .forEach((track) => track.stop());
            }
            this.connection.close();
            this.connection = new RTCPeerConnection();
            this.connection.onicecandidate =
                this.onIceCandidateReceived.bind(this);
        }

        this.remoteMediaStream = null;
        this.localCandidates = [];
        this.isGathering = true;
        this.isMediaCaptured = false;
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
