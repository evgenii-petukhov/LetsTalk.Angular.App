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
    private retryPolicy = new ConstantRetryPolicy(environment.services.notifications.connectionInterval);
    private hubConnectionBuilder = new HubConnectionBuilder()
        .withUrl(`${environment.services.notifications.url}`, {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect(this.retryPolicy)
        .configureLogging(LogLevel.Information)
        .build();

    private isInitialized = false;
    private notificationEventName = 'SendNotificationAsync';
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
                    this.hubConnectionBuilder.on(this.notificationEventName, (dto: any, typeName: string) => {
                        switch (typeName) {
                            case 'MessageDto':
                                messageHandler?.(dto);
                                break;
                            case 'LinkPreviewDto':
                                linkPreviewHandler?.(dto);
                                break;
                            case 'ImagePreviewDto':
                                imagePreviewHandler?.(dto);
                                break;
                        }                      
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
        this.hubConnectionBuilder.off(this.notificationEventName);
    }

    private async authorize(): Promise<void> {
        await this.hubConnectionBuilder.invoke('AuthorizeAsync', this.tokenService.getToken());
        console.log('Notification service: authorized');
    }
}
