import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class BrowserNotificationService {

    private isServiceWorkerRegistered = false;

    constructor(private toastr: ToastrService) {
        navigator.serviceWorker.register('notification_sw.js').then(() => {
            this.isServiceWorkerRegistered = true;
            console.log('serviceWorker success');
        }).catch(() => {
            console.log('serviceWorker error');
        });
    }

    async showNotification(title: string, message: string, isWindowActive: boolean): Promise<void> {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (this.isServiceWorkerRegistered) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification(title, {
                    body: message
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
    }
}
