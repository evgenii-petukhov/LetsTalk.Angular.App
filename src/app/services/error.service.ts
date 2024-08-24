import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
    
    getCommaSeparatedErrorMessages(e: any): string {
        const response = JSON.parse(e.response || '{}');
        return Object.entries(response.errors || {})
            .map(x => x[1] as string)
            .flat()
            .reduce((acc, cur) => acc = (acc === '' ? acc : acc +', ') + cur, '');
    }
}
