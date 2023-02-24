import { Injectable, Type } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MappingService {
    map<T>(sourceObject: any, targetType: { new(): T}): T {
        const result = new targetType();
        for (var property in sourceObject) {
            if (sourceObject.hasOwnProperty(property))
                (<any>result)[property] = (<any>sourceObject)[property];
        }
        return result;
    };
}
