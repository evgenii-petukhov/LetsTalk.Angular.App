/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { IceCandidateMetricsService } from './ice-candidate-metrics.service';

export const constraintSets: MediaStreamConstraints[] = [
    // Standard enhanced
    {
        video: {
            width: { ideal: 960, max: 960 },
            height: { ideal: 540, max: 540 },
            frameRate: { ideal: 15, max: 30 },
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: { ideal: 44100 },
            channelCount: { ideal: 1 },
        },
    },
    // Standard
    {
        video: {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 15, max: 30 },
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: { ideal: 44100 },
            channelCount: { ideal: 1 },
        },
    },
    // Relaxed
    {
        video: {
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: { ideal: 15 },
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: { ideal: 1 },
        },
    },
    // Basic
    {
        video: {
            width: { ideal: 640 },
            height: { ideal: 360 },
        },
        audio: {
            echoCancellation: true,
        },
    },
    // Simple
    {
        video: true,
        audio: true,
    },
];

@Injectable({
    providedIn: 'root',
})
export class RtcPeerConnectionManager {
    onCandidatesReceived: (data: string) => void;
    onGatheringCompleted: () => void;
    onConnectionStateChange: (state: RTCPeerConnectionState) => void;
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
        this.connection.onconnectionstatechange =
            this._onConnectionStateChange.bind(this);
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
            for (const c of candidates) await this.connection.addIceCandidate(c);
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

        if (this.iceCandidateMetricsService.hasSufficientServers(this.localCandidates)) {
            this.finalizeIceGathering();
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
            for (const c of candidates) await this.connection.addIceCandidate(c);
        }
    }

    async startMediaCapture(
        localVideo: HTMLVideoElement,
        remoteVideo: HTMLVideoElement,
    ): Promise<void> {
        for (const constraints of constraintSets) {
            try {
                this.localMediaStream =
                    await navigator.mediaDevices.getUserMedia(constraints);
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
                return;
            } catch (error) {
                console.error(error);
            }
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

    reinitialize(): void {
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
            this.connection.onconnectionstatechange =
                this._onConnectionStateChange.bind(this);
        }

        this.remoteMediaStream = null;
        this.localCandidates = [];
        this.isGathering = true;
        this.isMediaCaptured = false;
    }

    private onIceCandidateReceived(e: RTCPeerConnectionIceEvent): void {
        if (!this.isGathering) return;

        if (!e.candidate) {
            this.finalizeIceGathering();
            return;
        }

        this.localCandidates.push(e.candidate);

        const data = {
            desc: this.connection.localDescription,
            candidates: this.localCandidates,
        };

        this.onCandidatesReceived?.(JSON.stringify(data));
    }

    private finalizeIceGathering(): void {
        this.isGathering = false;
        this.onGatheringCompleted?.();
    }

    private _onConnectionStateChange(): void {
        this.onConnectionStateChange?.(this.connection.connectionState);
    }
}
