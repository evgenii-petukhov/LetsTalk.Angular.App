import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateTimeService {
    private localTimeZone = this.getLocalTimezoneInternal();

    getLocalTimezone(): string {
        return this.localTimeZone;
    }

    private getLocalTimezoneInternal(): string {
        const offset = this.getTimezoneOffsetInHours();
        return `UTC${offset > 0 ? '+' : ''}${offset}`
    }

    private getTimezoneOffsetInHours(): number {
        const date = new Date();
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US'));
        return (tzDate.getTime() - utcDate.getTime()) / 36e5;
    }
}
