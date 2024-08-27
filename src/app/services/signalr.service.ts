import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { IImagePreviewDto, ILinkPreviewDto, IMessageDto } from '../api-client/api-client';
import { ConstantRetryPolicy } from './constant-retry-policy';
import { TokenStorageService } from './token-storage.service';

type TypeNames = 'MessageDto' | 'LinkPreviewDto' | 'ImagePreviewDto';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private retryPolicy = new ConstantRetryPolicy(environment.services.notifications.connectionInterval);
    private hubConnectionBuilder = new HubConnectionBuilder()
        .withUrl(environment.services.notifications.url, {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect(this.retryPolicy)
        .configureLogging(LogLevel.Information)
        .build();

    private isInitialized = false;
    private notificationEventName = 'SendNotificationAsync';
    private connectionTimerId: number;
    private handlerMapping: Record<TypeNames, <T extends IMessageDto | ILinkPreviewDto | IImagePreviewDto>(dto: T) => void>;

    constructor(private tokenStorageService: TokenStorageService) { }

    async init(messageHandler: (messageDto: IMessageDto) => void,
        linkPreviewHandler: (response: ILinkPreviewDto) => void,
        imagePreviewHandler: (response: IImagePreviewDto) => void): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        this.handlerMapping = {
            MessageDto: messageHandler,
            LinkPreviewDto: linkPreviewHandler,
            ImagePreviewDto: imagePreviewHandler
        };

        await this.setUpConnection();

        if (!this.isInitialized) {
            this.connectionTimerId = window.setInterval(async () => {
                await this.setUpConnection();
            }, this.retryPolicy.nextRetryDelayInMilliseconds());
        }

        this.hubConnectionBuilder.onreconnected(async () => {
            await this.authorize();
            console.log('Notification service: reconnected');
        });
    }

    removeHandlers(): void {
        this.hubConnectionBuilder.off(this.notificationEventName);
        this.hubConnectionBuilder.stop();
        this.isInitialized = false;
    }

    private async authorize(): Promise<void> {
        await this.hubConnectionBuilder.invoke('AuthorizeAsync', this.tokenStorageService.getToken());
        console.log('Notification service: authorized');
    }

    private async setUpConnection(): Promise<void> {
        try {
            await this.hubConnectionBuilder.start();
            this.isInitialized = true;
            window.clearInterval(this.connectionTimerId);
            this.hubConnectionBuilder.on(this.notificationEventName, (dto: any, typeName: TypeNames) => {
                this.handlerMapping[typeName]?.(dto);
            });
            await this.authorize();
            console.log('Notification service: connected');
        } catch {
            console.log('Notification service: unable to establish connection');
        }
    }
}
