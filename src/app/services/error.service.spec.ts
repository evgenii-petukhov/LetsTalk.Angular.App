import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';
import { ToastrService } from 'ngx-toastr';

describe('ErrorService', () => {
    let service: ErrorService;
    let toastrService: jasmine.SpyObj<ToastrService>;

    beforeEach(() => {
        toastrService = jasmine.createSpyObj('ToastrService', ['error']);

        TestBed.configureTestingModule({
            providers: [
                ErrorService,
                { provide: ToastrService, useValue: toastrService },
            ],
        });

        service = TestBed.inject(ErrorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call toastr.error with comma-separated error messages', () => {
        // Arrange
        const errorResponse = {
            response: JSON.stringify({
                errors: {
                    field1: ['Error1', 'Error2'],
                    field2: ['Error3'],
                },
            }),
        };

        const defaultMessage = 'Default error message';

        // Act
        service.handleError(errorResponse, defaultMessage);

        // Assert
        const expectedMessage = 'Error1, Error2, Error3';
        expect(toastrService.error).toHaveBeenCalledOnceWith(
            expectedMessage,
            'Error',
        );
    });

    it('should call toastr.error with default message if no errors present', () => {
        // Arrange
        const errorResponse = {
            response: JSON.stringify({}),
        };

        const defaultMessage = 'Default error message';

        // Act
        service.handleError(errorResponse, defaultMessage);

        // Assert
        expect(toastrService.error).toHaveBeenCalledOnceWith(
            defaultMessage,
            'Error',
        );
    });
});
