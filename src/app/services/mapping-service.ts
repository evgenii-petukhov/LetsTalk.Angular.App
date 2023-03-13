import { Injectable } from '@angular/core';
import { IMessageDto } from '../api-client/api-client';
import { Message } from '../models/message';

@Injectable({
    providedIn: 'root'
})
export class MappingService {
    mapMessage(source: IMessageDto): Message {
        const destin = this.map(source, Message);
        destin.created = new Date(0);
        destin.created.setUTCSeconds(source.created);
        return destin;
    }

    private map<T>(source: any, targetType: { new(): T}): T {
        const destin = new targetType();
        for (var property in source) {
            if (source.hasOwnProperty(property))
                (<any>destin)[property] = (<any>source)[property];
        }
        return destin;
    };
}
