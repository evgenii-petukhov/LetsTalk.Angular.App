import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'visibleOnly'
})
export class VisibleOnlyPipe<T> implements PipeTransform {
    transform(items: T[], callback: (item: T) => boolean): any[] {
        return items.filter(item => callback(item));
    }
}
