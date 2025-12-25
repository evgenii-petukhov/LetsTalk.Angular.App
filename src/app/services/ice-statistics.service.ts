import { Injectable } from '@angular/core';
import { CandidateStat } from '../models/CandidateStat';

@Injectable({
    providedIn: 'root',
})
export class IceStatisticsService {
    private readonly required: CandidateStat = {
        host: 1,
        srflx: 1,
        prflx: 0,
        relay: 1,
    };

    getCandidateStatistics(candidates: RTCIceCandidate[]): CandidateStat {
        const result: CandidateStat = {
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

    hasSufficientServers(stat: CandidateStat): boolean {
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
