import { IRetryPolicy, RetryContext } from '@microsoft/signalr';

export class ConstantRetryPolicy implements IRetryPolicy {
    constructor(private interval: number) {
        this.interval = interval;
    }

    nextRetryDelayInMilliseconds(_retryContext: RetryContext): number {
        return this.interval;
    }
}
