import {
    Component,
    ElementRef,
    Input,
    ViewChild,
} from '@angular/core';

@Component({
    selector: 'app-video-with-avatar-fallback',
    templateUrl: './video-with-avatar-fallback.component.html',
    styleUrl: './video-with-avatar-fallback.component.scss',
    standalone: false,
})
export class VideoWithAvatarFallbackComponent {
    @ViewChild('video', { static: false })
    video!: ElementRef<HTMLVideoElement>;

    @Input() urlOptions: string[] = [];
    @Input() isVideoMuted: boolean;
    @Input() isAudioMuted: boolean;
    @Input() videoElementClass: string;   

    getVideoElement(): HTMLVideoElement {
        return this.video.nativeElement;
    }

    resetVideoElement(): HTMLVideoElement {
        return this.video.nativeElement.srcObject = null;
    }
}
