import { Injectable } from '@angular/core';
import { faVk, faFacebook, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { AccountTypes } from '../constants/accounttypes';

@Injectable({
    providedIn: 'root'
})
export class AccountTypeMappingService {
    constructor() {}

    faVk = faVk;

    faFacebook = faFacebook;

    map(input: number): IconDefinition {
        let output: IconDefinition;
        switch (+input) {
            case AccountTypes.FACEBOOK:
                output = faFacebook;
                break;

            case AccountTypes.VK:
                output = faVk;
                break;
        }

        return output;
    }
}
