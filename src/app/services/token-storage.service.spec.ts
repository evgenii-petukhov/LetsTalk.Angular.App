import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
    let service: TokenStorageService;
    let localStorageSpy: jasmine.SpyObj<Storage>;

    beforeEach(() => {
        localStorageSpy = jasmine.createSpyObj('Storage', [
            'getItem',
            'setItem',
        ]);

        spyOnProperty(window, 'localStorage').and.returnValue(localStorageSpy);

        TestBed.configureTestingModule({
            providers: [TokenStorageService],
        });
        service = TestBed.inject(TokenStorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('saveToken', () => {
        it('should save the token to localStorage', () => {
            // Arrange
            const token = 'sample-token';

            // Act
            service.saveToken(token);

            // Assert
            expect(localStorageSpy.setItem).toHaveBeenCalledWith(
                'auth-token',
                token,
            );
        });
    });

    describe('getToken', () => {
        it('should return the token from localStorage', () => {
            // Arrange
            const token = 'sample-token';
            localStorageSpy.getItem.and.returnValue(token);

            // Act
            const result = service.getToken();

            // Assert
            expect(localStorageSpy.getItem).toHaveBeenCalledWith('auth-token');
            expect(result).toBe(token);
        });
    });

    describe('isLoggedIn', () => {
        it('should return true if a token exists', () => {
            // Arrange
            localStorageSpy.getItem.and.returnValue('sample-token');

            // Act
            const result = service.isLoggedIn();

            // Assert
            expect(result).toBeTrue();
        });

        it('should return false if no token exists', () => {
            // Arrange
            localStorageSpy.getItem.and.returnValue(null);

            // Act
            const result = service.isLoggedIn();

            // Assert
            expect(result).toBeFalse();
        });
    });
});
