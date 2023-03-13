import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateTimeService {

    getTimezone(): string {
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
