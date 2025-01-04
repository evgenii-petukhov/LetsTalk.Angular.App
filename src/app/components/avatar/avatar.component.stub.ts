import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-avatar',
    template: '<div></div>',
    standalone: false,
})
export class AvatarStubComponent {
    @Input() urlOptions: string[];
}
