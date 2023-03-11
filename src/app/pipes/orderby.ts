import { Pipe, PipeTransform } from "@angular/core";
import { get, List, Many, orderBy } from 'lodash';

@Pipe({
    name: "orderBy"
})
export class OrderByPipe<T> implements PipeTransform {
    transform(array: List<T>, sortBy: string[], order: Many<boolean | "asc" | "desc">): any[] {
        return orderBy(array, (item) => sortBy.map(x => get(item, x, 0)), order);
    }
}