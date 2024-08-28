import { TestBed } from '@angular/core/testing';
import { RequestLoggingService } from './request-logging.service';

describe('RequestLoggingService', () => {
    let service: RequestLoggingService;
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RequestLoggingService]
        });
        service = TestBed.inject(RequestLoggingService);

        consoleSpy = spyOn(console, 'log').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('log', () => {
        it('should log request details with download and upload sizes', () => {
            const protocol = 'HTTP';
            const url = 'https://example.com';
            const time = 123.456;
            const downloaded = 2048; // 2MB
            const uploaded = 1024; // 1MB

            service.log(protocol, url, time, downloaded, uploaded);

            expect(consoleSpy).toHaveBeenCalledWith(
                `[${protocol}] ${url} ${time.toFixed()}ms ▼${Math.ceil(downloaded / 1024)}kB ▲${Math.ceil(uploaded / 1024)}kB`
            );
        });

        it('should log request details with no download or upload sizes if values are zero', () => {
            const protocol = 'HTTP';
            const url = 'https://example.com';
            const time = 123.456;
            const downloaded = 0;
            const uploaded = 0;

            service.log(protocol, url, time, downloaded, uploaded);

            expect(consoleSpy).toHaveBeenCalledWith(
                `[${protocol}] ${url} ${time.toFixed()}ms`
            );
        });
    });

    describe('getDownloadString', () => {
        it('should return the download size string with ▼ icon', () => {
            const volume = 2048; // 2MB

            const result = (service as any).getDownloadString(volume);

            expect(result).toBe(` ▼${Math.ceil(volume / 1024)}kB`);
        });

        it('should return an empty string if volume is zero', () => {
            const volume = 0;

            const result = (service as any).getDownloadString(volume);

            expect(result).toBe('');
        });
    });

    describe('getUploadString', () => {
        it('should return the upload size string with ▲ icon', () => {
            const volume = 1024; // 1MB

            const result = (service as any).getUploadString(volume);

            expect(result).toBe(` ▲${Math.ceil(volume / 1024)}kB`);
        });

        it('should return an empty string if volume is zero', () => {
            const volume = 0;

            const result = (service as any).getUploadString(volume);

            expect(result).toBe('');
        });
    });

    describe('getDataVolumeString', () => {
        it('should return the data volume string with the correct icon', () => {
            const volume = 4096; // 4MB
            const icon = '▼';

            const result = (service as any).getDataVolumeString(volume, icon);

            expect(result).toBe(` ${icon}${Math.ceil(volume / 1024)}kB`);
        });

        it('should return an empty string if volume is zero', () => {
            const volume = 0;
            const icon = '▼';

            const result = (service as any).getDataVolumeString(volume, icon);

            expect(result).toBe('');
        });
    });
});
