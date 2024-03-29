import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private isServiceWorkerRegistered = false;

    constructor(private toastr: ToastrService) {
        navigator.serviceWorker.register('notification_sw.js').then(() => {
            this.isServiceWorkerRegistered = true;
            console.log('serviceWorker success');
        }).catch(() => {
            console.log('serviceWorker error');
        });
    }

    showNotification(title: string, message: string, isWindowActive: boolean): void {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                if (this.isServiceWorkerRegistered) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification(title, {
                            body: message
                        });
                    });
                    return;
                } else if (Notification) {
                    new Notification(title, {
                        body: message
                    });
                    return;
                }
            }

            if (isWindowActive) {
                this.toastr.info(message, title);
            }
        });
    }
}
