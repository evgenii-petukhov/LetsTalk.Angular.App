import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-avatar',
    template: '<div></div>',
})
export class AvatarStubComponent {
    @Input() urlOptions: string[];
}
