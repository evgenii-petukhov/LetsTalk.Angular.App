import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-user-details',
    template: '<div></div>',
})
export class UserDetailsStubComponent {
    @Input() value: string;
}