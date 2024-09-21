import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-back-button',
    template: '<div></div>',
})
export class BackButtonStubComponent {
    @Output() buttonClick = new EventEmitter();
}
