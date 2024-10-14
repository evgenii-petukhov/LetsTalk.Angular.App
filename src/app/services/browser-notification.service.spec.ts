import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { BrowserNotificationService } from './browser-notification.service';

describe('BrowserNotificationService', () => {
    let service: BrowserNotificationService;
    let toastrService: jasmine.SpyObj<ToastrService>;

    const mockServiceWorkerRegistration = {
        showNotification: jasmine.createSpy('showNotification'),
    };

    beforeEach(async () => {
        toastrService = jasmine.createSpyObj('ToastrService', ['info']);

        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                register: jasmine
                    .createSpy('register')
                    .and.returnValue(Promise.resolve()),
                ready: Promise.resolve(mockServiceWorkerRegistration),
            },
        });

        await TestBed.configureTestingModule({
            providers: [
                BrowserNotificationService,
                { provide: ToastrService, useValue: toastrService },
            ],
        }).compileComponents();

        service = TestBed.inject(BrowserNotificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register service worker on init and set isServiceWorkerRegistered to true', async () => {
        // Arrange
        spyOn(console, 'log');

        // Act
        await service.init();

        // Assert
        expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
            'notification_sw.js',
        );
        expect(console.log).toHaveBeenCalledWith('serviceWorker success');
        expect(service['isServiceWorkerRegistered']).toBeTrue();
    });

    it('should log error if service worker registration fails', async () => {
        // Arrange
        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                register: jasmine
                    .createSpy('register')
                    .and.returnValue(Promise.reject()),
            },
        });

        spyOn(console, 'log');

        // Act
        await service.init();

        // Assert
        expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
            'notification_sw.js',
        );
        expect(console.log).toHaveBeenCalledWith('serviceWorker error');
        expect(service['isServiceWorkerRegistered']).toBeFalse();
    });

    it('should show notification if permission is granted and service worker is registered', async () => {
        // Arrange
        spyOn(Notification, 'requestPermission').and.returnValue(
            Promise.resolve('granted'),
        );
        spyOn(console, 'log');

        // Act
        await service.init();
        await service.showNotification('Test Title', 'Test Message', false);

        // Assert
        expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
            'notification_sw.js',
        );
        expect(console.log).toHaveBeenCalledWith('serviceWorker success');
        expect(service['isServiceWorkerRegistered']).toBeTrue();
        expect(
            mockServiceWorkerRegistration.showNotification,
        ).toHaveBeenCalledWith('Test Title', {
            body: 'Test Message',
        });
    });

    it('should fallback to window notification if service worker is not registered', async () => {
        // Arrange
        spyOn(Notification, 'requestPermission').and.returnValue(
            Promise.resolve('granted'),
        );
        const notificationSpy = spyOn(window, 'Notification');

        // Act
        await service.showNotification('Test Title', 'Test Message', false);

        // Assert
        expect(notificationSpy).toHaveBeenCalledWith('Test Title', {
            body: 'Test Message',
        });
    });

    it('should use Toastr if permission is denied and window is active', async () => {
        // Arrange
        spyOn(Notification, 'requestPermission').and.returnValue(
            Promise.resolve('denied'),
        );

        // Act
        await service.showNotification('Test Title', 'Test Message', true);

        // Assert
        expect(toastrService.info).toHaveBeenCalledWith(
            'Test Message',
            'Test Title',
        );
    });

    it('should not show anything if permission is denied and window is not active', async () => {
        // Arrange
        spyOn(Notification, 'requestPermission').and.returnValue(
            Promise.resolve('denied'),
        );

        // Act
        await service.showNotification('Test Title', 'Test Message', false);

        // Assert
        expect(toastrService.info).not.toHaveBeenCalled();
    });
});
