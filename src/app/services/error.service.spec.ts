import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';
import { ToastrService } from 'ngx-toastr';
import { MockToastrService } from './mocks/toastr.service';

describe('ErrorService', () => {
    let service: ErrorService;
    let toastrService: MockToastrService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ErrorService,
                { provide: ToastrService, useClass: MockToastrService }
            ]
        });

        service = TestBed.inject(ErrorService);
        toastrService = TestBed.inject(ToastrService) as unknown as MockToastrService;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call toastr.error with comma-separated error messages', () => {
        const errorResponse = {
            response: JSON.stringify({
                errors: {
                    field1: ['Error1', 'Error2'],
                    field2: ['Error3']
                }
            })
        };

        const defaultMessage = 'Default error message';

        const toastrSpy = spyOn(toastrService, 'error');

        service.handleError(errorResponse, defaultMessage);

        const expectedMessage = 'Error1, Error2, Error3';
        expect(toastrSpy).toHaveBeenCalledWith(expectedMessage, 'Error');
    });

    it('should call toastr.error with default message if no errors present', () => {
        const errorResponse = {
            response: JSON.stringify({})
        };

        const defaultMessage = 'Default error message';
        const toastrSpy = spyOn(toastrService, 'error');
        service.handleError(errorResponse, defaultMessage);
        expect(toastrSpy).toHaveBeenCalledWith(defaultMessage, 'Error');
    });
});
