import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { IImagePreviewDto, ILinkPreviewDto, IMessageDto } from '../api-client/api-client';
import { ConstantRetryPolicy } from './constant-retry-policy';
import { TokenStorageService } from './token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private retryPolicy = new ConstantRetryPolicy(environment.notificationServiceReconnectInterval);
    private hubConnectionBuilder = new HubConnectionBuilder()
        .withUrl(`${environment.notificationServiceUrl}`, {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect(this.retryPolicy)
        .configureLogging(LogLevel.Information)
        .build();

    private isInitialized = false;
    private messageNotificationEventName = 'SendMessageNotificationAsync';
    private linkPreviewNotificationEventName = 'SendLinkPreviewNotificationAsync';
    private imagePreviewNotificationEventName = 'SendImagePreviewNotificationAsync';
    private connectionTimerId: number;

    constructor(private tokenService: TokenStorageService) { }

    init(messageHandler: (messageDto: IMessageDto) => void,
        linkPreviewHandler: (response: ILinkPreviewDto) => void,
        imagePreviewHandler: (response: IImagePreviewDto) => void): void {
        if (this.isInitialized) { return; }

        this.connectionTimerId = window.setInterval(() => {
            this.hubConnectionBuilder.start()
                .then(async () => {
                    this.isInitialized = true;
                    window.clearInterval(this.connectionTimerId);
                    this.hubConnectionBuilder.on(this.messageNotificationEventName, (messageDto: IMessageDto) => {
                        messageHandler?.(messageDto);
                    });
                    this.hubConnectionBuilder.on(this.linkPreviewNotificationEventName, (response: ILinkPreviewDto) => {
                        linkPreviewHandler?.(response);
                    });
                    this.hubConnectionBuilder.on(this.imagePreviewNotificationEventName, (response: IImagePreviewDto) => {
                        imagePreviewHandler?.(response);
                    });
                    await this.authorize();
                    console.log('Notification service: connected');
                })
                .catch(() => console.log('Notification service: unable to establish connection'));
        }, this.retryPolicy.nextRetryDelayInMilliseconds());

        this.hubConnectionBuilder.onreconnected(async () => {
            await this.authorize();
            console.log('Notification service: reconnected');
        });
    }

    removeHandlers(): void {
        this.hubConnectionBuilder.off(this.messageNotificationEventName);
        this.hubConnectionBuilder.off(this.linkPreviewNotificationEventName);
    }

    private async authorize(): Promise<void> {
        await this.hubConnectionBuilder.invoke('AuthorizeAsync', this.tokenService.getToken());
        console.log('Notification service: authorized');
    }
}
