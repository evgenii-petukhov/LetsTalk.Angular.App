import { Component, Input, OnChanges } from '@angular/core';
import { faVk, faFacebook, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { AccountTypes } from 'src/app/constants/account-types';

@Component({
    selector: 'app-social-media-icon',
    templateUrl: './social-media-icon.component.html'
})
export class SocialMediaIconComponent implements OnChanges {
    @Input() iconTypeId: number;
    icon: IconDefinition;
    title: string;

    ngOnChanges(): void {
        switch (+this.iconTypeId) {
            case AccountTypes.facebook:
                this.icon = faFacebook;
                this.title = 'Facebook';
                break;

            case AccountTypes.vk:
                this.icon = faVk;
                this.title = 'VK';
                break;
        }
    }
}
