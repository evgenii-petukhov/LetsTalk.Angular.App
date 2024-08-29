import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root',
})
export class ErrorService {
    constructor(private toastr: ToastrService) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleError(e: any, defaultMessage: string): void {
        const errors = this.getCommaSeparatedErrorMessages(e, defaultMessage);
        this.toastr.error(errors, 'Error');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private getCommaSeparatedErrorMessages(
        e: any,
        defaultMessage: string,
    ): string {
        const response = JSON.parse(e?.response || '{}');
        return (
            Object.entries(response.errors || {})
                .map((x) => x[1] as string)
                .flat()
                .join(', ') || defaultMessage
        );
    }
}
