import { Injectable } from '@angular/core';
import { IceCandidateMetrics } from '../models/ice-candidate-metrics';

@Injectable({
    providedIn: 'root',
})
export class IceCandidateMetricsService {
    private readonly required: IceCandidateMetrics = {
        host: 1,
        srflx: 1,
        prflx: 0,
        relay: 1,
    };

    getIceCandidateMetrics(candidates: RTCIceCandidate[]): IceCandidateMetrics {
        const result: IceCandidateMetrics = {
            host: 0,
            srflx: 0,
            prflx: 0,
            relay: 0,
        };

        for (let candidate of candidates) {
            result[candidate.type] = result[candidate.type] + 1;
        }
        return result;
    }

    hasSufficientServers(stat: IceCandidateMetrics): boolean {
        return (
            stat.host >= this.required.host &&
            stat.srflx >= this.required.srflx &&
            stat.relay >= this.required.relay
        );
    }

    hasMinimumCandidateCount(candidates: RTCIceCandidate[]) {
        return candidates.length >= this.getRequiredTotal();
    }

    private getRequiredTotal(): number {
        return this.required.host + this.required.srflx + this.required.relay;
    }
}
