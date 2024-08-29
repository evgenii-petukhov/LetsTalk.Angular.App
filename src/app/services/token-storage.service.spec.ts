import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';
import { LoginResponseDto } from '../api-client/api-client';

describe('TokenStorageService', () => {
    let service: TokenStorageService;
    let localStorageSpy: jasmine.SpyObj<Storage>;

    beforeEach(() => {
        localStorageSpy = jasmine.createSpyObj('Storage', [
            'getItem',
            'setItem',
            'removeItem',
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
            const token = 'sample-token';

            service.saveToken(token);

            expect(localStorageSpy.removeItem).toHaveBeenCalledWith(
                'auth-token',
            );
            expect(localStorageSpy.setItem).toHaveBeenCalledWith(
                'auth-token',
                token,
            );
        });
    });

    describe('saveUser', () => {
        it('should save the user to localStorage', () => {
            const user = new LoginResponseDto();
            user.token = 'sample-token';
            user.success = true;
            const userJson = JSON.stringify(user);

            service.saveUser(user);

            expect(localStorageSpy.removeItem).toHaveBeenCalledWith(
                'auth-user',
            );
            expect(localStorageSpy.setItem).toHaveBeenCalledWith(
                'auth-user',
                userJson,
            );
        });
    });

    describe('getToken', () => {
        it('should return the token from localStorage', () => {
            const token = 'sample-token';
            localStorageSpy.getItem.and.returnValue(token);

            const result = service.getToken();

            expect(localStorageSpy.getItem).toHaveBeenCalledWith('auth-token');
            expect(result).toBe(token);
        });
    });

    describe('isLoggedIn', () => {
        it('should return true if a token exists', () => {
            localStorageSpy.getItem.and.returnValue('sample-token');

            const result = service.isLoggedIn();

            expect(result).toBeTrue();
        });

        it('should return false if no token exists', () => {
            localStorageSpy.getItem.and.returnValue(null);

            const result = service.isLoggedIn();

            expect(result).toBeFalse();
        });
    });
});
