import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root',
})
export class RtcConnectionService {
    private readonly apiService = inject(ApiService);
    private connection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: 'turn:relay1.expressturn.com:3480',
                username: '000000002081634833',
                credential: 'sHASFidRDCXTgfg6hGCGPQJ4xns=',
            },
        ],
    });
    private channel: RTCDataChannel;
    private localCandidates: RTCIceCandidate[] = [];
    private iceCandidateSubject = new Subject<string>();
    private iceGatheringComplete = new Subject<void>();
    private serverCounter = 0;

    constructor() {
        this.connection.ondatachannel = this.handleOnDataChannel.bind(this);
        this.connection.onicecandidate = this.handleOnIceCandidate.bind(this);
    }

    async initializeCallAsync(accountId: string): Promise<void> {
        this.channel = this.connection.createDataChannel('chat');
        this.channel.onopen = this.handleConnectionOpen.bind(this);
        this.channel.onmessage = (e) => console.log('<b>Peer:</b> ' + e.data);

        // Reset candidates for new call
        this.localCandidates = [];

        const offer = await this.connection.createOffer();
        await this.connection.setLocalDescription(offer);

        // Wait for ICE gathering to complete and get the final offer
        const finalOffer = await lastValueFrom(
            this.iceCandidateSubject.pipe(takeUntil(this.iceGatheringComplete)),
        );

        return this.apiService.initializeCall(accountId, finalOffer);
    }

    handleConnectionOpen(): void {
        console.log('DataChannel open!');

        setTimeout(() => {
            this.channel.send('test');
        }, 2000);
        
    }

    async acceptCallAsync(accountId: string, offer: string): Promise<void> {
        const remote = JSON.parse(offer);
        await this.connection.setRemoteDescription(remote.desc);
        if (remote.candidates) {
            for (let c of remote.candidates)
                await this.connection.addIceCandidate(c);
        }

        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);

        const finalOffer = await lastValueFrom(
            this.iceCandidateSubject.pipe(takeUntil(this.iceGatheringComplete)),
        );

        return this.apiService.acceptCall(accountId, finalOffer);
    }

    async openChannelAsync(answer: string): Promise<void> {
        const remote = JSON.parse(answer);

        if (remote.desc.type !== 'answer') {
            console.log('Remote SDP is not an answer!');
            return;
        }

        if (this.connection.signalingState !== 'have-local-offer') {
            console.log('Cannot apply answer yet. Local offer not set.');
            return;
        }

        await this.connection.setRemoteDescription(remote.desc);
        if (remote.candidates) {
            for (let c of remote.candidates)
                await this.connection.addIceCandidate(c);
        }
    }

    handleOnDataChannel(e: RTCDataChannelEvent): void {
        this.channel = e.channel;
        this.channel.onopen = this.handleConnectionOpen.bind(this);
        this.channel.onmessage = (e) => console.log('<b>Peer:</b> ' + e.data);
        console.log("DataChannel received!");
    }

    handleOnIceCandidate(e: RTCPeerConnectionIceEvent): void {
        if (!e.candidate || this.serverCounter >= 10) {
            // ICE gathering is complete - emit the final offer data
            const data = {
                desc: this.connection.localDescription,
                candidates: this.localCandidates,
            };

            const finalOffer = JSON.stringify(data);
            this.iceCandidateSubject.next(finalOffer);
            this.iceGatheringComplete.next();
            console.log('ICE gathering complete:', finalOffer);
            return;
        }

        if (this.serverCounter < 10) {
            // Add candidate to collection
            this.localCandidates.push(e.candidate);

            // Emit current state (this will be overridden by the final one)
            const data = {
                desc: this.connection.localDescription,
                candidates: this.localCandidates,
            };

            this.iceCandidateSubject.next(JSON.stringify(data));

            this.serverCounter++;
        }
    }

    public getConnection(): RTCPeerConnection {
        return this.connection;
    }
}
