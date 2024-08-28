import { TestBed } from '@angular/core/testing';
import { ListIteratee, Many } from 'lodash-es';
import { OrderByPipe } from './orderby';

describe('OrderByPipe', () => {
    let pipe: OrderByPipe<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [OrderByPipe]
        });
        pipe = TestBed.inject(OrderByPipe);
    });

    it('should be created', () => {
        expect(pipe).toBeTruthy();
    });

    describe('transform', () => {
        it('should sort an array of objects by multiple properties', () => {
            const array = [
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 30 }
            ];
            const sortBy: Many<ListIteratee<any>> = ['age', 'name'];
            const order: Many<'asc' | 'desc'> = ['desc', 'asc'];

            const result = pipe.transform(array, sortBy, order);

            expect(result).toEqual([
                { name: 'Bob', age: 30 },
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 25 }
            ]);
        });

        it('should sort an array of objects by a single property in ascending order', () => {
            const array = [
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 28 }
            ];
            const sortBy: Many<ListIteratee<any>> = ['age'];
            const order: Many<'asc'> = 'asc';

            const result = pipe.transform(array, sortBy, order);

            expect(result).toEqual([
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 28 },
                { name: 'Charlie', age: 30 }
            ]);
        });

        it('should sort an array of objects by a single property in descending order', () => {
            const array = [
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 28 }
            ];
            const sortBy: Many<ListIteratee<any>> = ['age'];
            const order: Many<'desc'> = 'desc';

            const result = pipe.transform(array, sortBy, order);

            expect(result).toEqual([
                { name: 'Charlie', age: 30 },
                { name: 'Bob', age: 28 },
                { name: 'Alice', age: 25 }
            ]);
        });

        it('should handle empty arrays', () => {
            const array: any[] = [];
            const sortBy: Many<ListIteratee<any>> = ['age'];
            const order: Many<'asc'> = 'asc';

            const result = pipe.transform(array, sortBy, order);

            expect(result).toEqual([]);
        });

        it('should handle arrays with no items to sort', () => {
            const array = [1, 2, 3];
            const sortBy: Many<ListIteratee<any>> = [value => value];
            const order: Many<'desc'> = 'desc';

            const result = pipe.transform(array, sortBy, order);

            expect(result).toEqual([3, 2, 1]);
        });
    });
});