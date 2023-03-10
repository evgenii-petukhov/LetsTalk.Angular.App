import { Pipe, PipeTransform } from "@angular/core";
import { Many, orderBy } from 'lodash';

@Pipe({
    name: "orderBy"
})
export class OrderByPipe implements PipeTransform {
    transform(array: any, sortBy: string, order: Many<boolean | "asc" | "desc">): any[] {
        return orderBy(array, [sortBy], order);
    }
}