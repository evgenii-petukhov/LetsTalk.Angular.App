import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-media-toggle-button',
    templateUrl: './media-toggle-button.component.html',
    styleUrl: './media-toggle-button.component.scss',
    standalone: false,
})
export class MediaToggleButtonComponent {
    faMicrophoneSlash = faMicrophoneSlash;
    faMicrophone = faMicrophone;
    faVideoSlash = faVideoSlash;
    faVideo = faVideo;
    
    @Input() mode: 'audio' | 'video' = 'audio';
    @Input() isMuted = false;
    @Output() buttonClick = new EventEmitter<void>();

    get activeIcon() {
        return this.mode === 'audio' 
            ? (this.isMuted ? this.faMicrophoneSlash : this.faMicrophone)
            : (this.isMuted ? this.faVideoSlash : this.faVideo);
    }

    onButtonClicked(): void {
        this.buttonClick.emit();
    }
}
