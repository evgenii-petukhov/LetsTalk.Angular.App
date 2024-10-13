import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'app-send-message-button',
    template: '<div></div>',
})
export class SendMessageButtonStubComponent {
    faPaperPlane = faPaperPlane;
    @Input() disabled = false;
    @Output() buttonClick = new EventEmitter();
}
