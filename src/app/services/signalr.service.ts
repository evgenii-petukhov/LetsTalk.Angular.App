import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { IMessageDto } from '../api-client/api-client';
import { TokenStorageService } from './token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class SignalService {

    constructor(private tokenService: TokenStorageService) { }

    init(messageHandler: (message: IMessageDto) => void) {
        const hubConnectionBuilder = new HubConnectionBuilder()
            .withUrl(`${environment.apiBaseUrl}/messagehub`, {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets
            })
            .withAutomaticReconnect(Array.from({length: 100}, x => 5))
            .configureLogging(LogLevel.Information)
            .build();

        hubConnectionBuilder.start().then(async () => {
            await hubConnectionBuilder.invoke("Authorize", this.tokenService.getToken());
        }).catch(() => console.log('Error while connect with server'));

        hubConnectionBuilder.on('SendMessageNotification', (message: any) => {
            messageHandler?.(message);
        });
    }
}
