import { IRetryPolicy, RetryContext } from '@microsoft/signalr';

export class ConstantRetryPolicy implements IRetryPolicy {
    private interval: number;

    constructor(interval: number) {
        this.interval = interval;
    }

    nextRetryDelayInMilliseconds(_retryContext: RetryContext): number {
        return this.interval;
    }
}
