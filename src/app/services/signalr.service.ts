import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { IMessageDto } from '../api-client/api-client';
import { ConstantRetryPolice } from './constant-retry-police';
import { TokenStorageService } from './token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private hubConnectionBuilder = new HubConnectionBuilder()
        .withUrl(`${environment.notificationServiceUrl}`, {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect(new ConstantRetryPolice(environment.notificationServiceReconnectInterval))
        .configureLogging(LogLevel.Information)
        .build();

    constructor(private tokenService: TokenStorageService) { }

    init(messageHandler: (message: IMessageDto) => void) {
        this.hubConnectionBuilder.start()
            .then(async () => {
                await this.authorize();
                console.log('Notification service: connected');
            })
            .catch(() => console.log('Notification service: unable to establish connection'));

        this.hubConnectionBuilder.on('SendMessageNotification', (message: IMessageDto) => {
            messageHandler?.(message);
        });

        this.hubConnectionBuilder.onreconnected(async () => {
            await this.authorize();
            console.log('Notification service: reconnected');
        });
    }

    private async authorize(): Promise<void> {
        await this.hubConnectionBuilder.invoke('Authorize', this.tokenService.getToken());
        console.log('Notification service: authorized');
    }
}
