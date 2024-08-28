import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-logged-in-user',
    template: '<div></div>'
})
export class LoggedInUserStubComponent {
    @Input() isNavigationActive: string;
    @Output() backButtonClicked = new EventEmitter<void>();
}