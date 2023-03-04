import { Component, Input, OnInit } from '@angular/core';
import { faVk, faFacebook, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { AccountTypes } from 'src/app/constants/account-types';

@Component({
    selector: 'app-social-media-icon',
    templateUrl: './social-media-icon.component.html',
    styleUrls: ['./social-media-icon.component.scss']
})
export class SocialMediaIconComponent implements OnInit {
    ngOnInit(): void {
        switch (+this.iconTypeId) {
            case AccountTypes.FACEBOOK:
                this.icon = faFacebook;
                this.title = 'Facebook';
                break;

            case AccountTypes.VK:
                this.icon = faVk;
                this.title = 'VK';
                break;
        }
    }

    icon: IconDefinition;
    title: string;
    @Input() iconTypeId: number;
}
