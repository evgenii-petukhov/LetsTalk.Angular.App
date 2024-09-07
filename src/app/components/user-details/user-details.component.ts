import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html',
    styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent {
    @Input() userName: string;
    @Input() unreadCount: number;
}
