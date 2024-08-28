import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-social-media-icon',
    template: '<div></div>'
})
export class SocialMediaIconStubComponent {
    @Input() iconTypeId: number;
}
