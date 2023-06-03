import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { ILinkPreviewDto, IMessageDto } from '../api-client/api-client';
import { ConstantRetryPolicy } from './constant-retry-policy';
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
        .withAutomaticReconnect(new ConstantRetryPolicy(environment.notificationServiceReconnectInterval))
        .configureLogging(LogLevel.Information)
        .build();

    private isInitialized = false;

    constructor(private tokenService: TokenStorageService) { }

    init(): void {
        if (this.isInitialized) { return; }

        this.hubConnectionBuilder.start()
            .then(async () => {
                this.isInitialized = true;
                await this.authorize();
                console.log('Notification service: connected');
            })
            .catch(() => console.log('Notification service: unable to establish connection'));

        this.hubConnectionBuilder.onreconnected(async () => {
            await this.authorize();
            console.log('Notification service: reconnected');
        });
    }

    removeHandlers(): void {
        this.hubConnectionBuilder.off('SendMessageNotification');
        this.hubConnectionBuilder.off('SendLinkPreviewNotification');
    }

    setMessageNotificationHandler(messageHandler: (messageDto: IMessageDto) => void): void {
        this.hubConnectionBuilder.off('SendMessageNotification');
        this.hubConnectionBuilder.on('SendMessageNotification', (messageDto: IMessageDto) => {
            messageHandler?.(messageDto);
        });
    }

    setLinkPreviewNotificationHandler(linkPreviewHandler: (response: ILinkPreviewDto) => void): void {
        this.hubConnectionBuilder.off('SendLinkPreviewNotification');
        this.hubConnectionBuilder.on('SendLinkPreviewNotification', (response: ILinkPreviewDto) => {
            linkPreviewHandler?.(response);
        });
    }

    private async authorize(): Promise<void> {
        await this.hubConnectionBuilder.invoke('Authorize', this.tokenService.getToken());
        console.log('Notification service: authorized');
    }
}
