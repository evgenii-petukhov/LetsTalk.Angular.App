import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private toastr: ToastrService) { }

    showNotification(title: string, message: string, isToastAllowed: boolean): void {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, {
                    body: message
                });
            } else if (isToastAllowed) {
                this.toastr.info(message, title);
            }
        });
    }
}
