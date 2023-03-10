import { Pipe, PipeTransform } from "@angular/core";
import { List, ListIteratee, Many, orderBy } from 'lodash';

@Pipe({
    name: "orderBy"
})
export class OrderByPipe<T> implements PipeTransform {
    transform(array: List<T>, sortBy: Many<ListIteratee<T>>, order: Many<boolean | "asc" | "desc">): any[] {
        return orderBy(array, sortBy, order);
    }
}