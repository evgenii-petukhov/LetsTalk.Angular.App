import { TestBed } from '@angular/core/testing';
import { IdGeneratorService } from './id-generator.service';

describe('IdGeneratorService', () => {
    let service: IdGeneratorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [IdGeneratorService]
        });
        service = TestBed.inject(IdGeneratorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getNextFakeId', () => {
        it('should return a negative number that decrements with each call', () => {
            const firstId = service.getNextFakeId();
            const secondId = service.getNextFakeId();
            const thirdId = service.getNextFakeId();

            expect(firstId).toBe(-1);
            expect(secondId).toBe(-2);
            expect(thirdId).toBe(-3);
        });
    });

    describe('isFake', () => {
        it('should return true for negative numbers in string form', () => {
            expect(service.isFake('-1')).toBeTrue();
            expect(service.isFake('-123')).toBeTrue();
        });

        it('should return false for positive numbers in string form', () => {
            expect(service.isFake('1')).toBeFalse();
            expect(service.isFake('123')).toBeFalse();
        });

        it('should return false for non-numeric strings', () => {
            expect(service.isFake('abc')).toBeFalse();
            expect(service.isFake('')).toBeFalse();
        });

        it('should return false for zero', () => {
            expect(service.isFake('0')).toBeFalse();
        });
    });
});
