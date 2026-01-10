/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { FileStorageService } from './file-storage.service';
import { TokenStorageService } from './token-storage.service';
import {
    DownloadImageRequest,
    DownloadImageResponse,
    ImageRoles,
    UploadImageRequest,
    UploadImageResponse,
} from '../protos/file_upload_pb';
import { IImageDto } from '../api-client/api-client';

describe('FileStorageService', () => {
    let service: FileStorageService;
    let tokenStorageService: jasmine.SpyObj<TokenStorageService>;

    const mockToken = 'Bearer mock-token';
    const mockImageKey: IImageDto = {
        id: 'test-image-id',
        fileStorageTypeId: 1,
    };

    beforeEach(() => {
        tokenStorageService = jasmine.createSpyObj('TokenStorageService', [
            'getToken',
        ]);

        TestBed.configureTestingModule({
            providers: [
                FileStorageService,
                { provide: TokenStorageService, useValue: tokenStorageService },
            ],
        });

        tokenStorageService.getToken.and.returnValue(mockToken);
        service = TestBed.inject(FileStorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('uploadImageAsBlob', () => {
        it('should convert blob to Uint8Array and call upload', async () => {
            const mockBlob = new Blob(['test content'], { type: 'image/png' });
            const mockUploadResponse = new UploadImageResponse();
            const imageRole = ImageRoles.AVATAR;

            spyOn(service, 'upload').and.resolveTo(mockUploadResponse);
            spyOn(mockBlob, 'arrayBuffer').and.resolveTo(
                new ArrayBuffer(12), // 'test content' length
            );

            const result = await service.uploadImageAsBlob(mockBlob, imageRole);

            expect(mockBlob.arrayBuffer).toHaveBeenCalled();
            expect(service.upload).toHaveBeenCalledWith(
                jasmine.any(Uint8Array),
                imageRole,
            );
            expect(result).toBe(mockUploadResponse);
        });
    });

    describe('upload', () => {
        it('should upload image successfully', async () => {
            const mockContent = new Uint8Array([1, 2, 3, 4]);
            const imageRole = ImageRoles.AVATAR;
            const mockResponse = new UploadImageResponse();

            // Mock the private fileUploadService
            const mockFileUploadService = jasmine.createSpyObj(
                'FileUploadGrpcEndpointClient',
                ['uploadImageAsync'],
            );
            (service as any).fileUploadService = mockFileUploadService;

            mockFileUploadService.uploadImageAsync.and.callFake(
                (request: any, metadata: any, callback: any) => {
                    expect(request).toBeInstanceOf(UploadImageRequest);
                    expect(request.getContent()).toEqual(mockContent);
                    expect(request.getImageRole()).toBe(imageRole);
                    expect(metadata.authorization).toBe(mockToken);
                    callback(null, mockResponse);
                },
            );

            const result = await service.upload(mockContent, imageRole);

            expect(result).toBe(mockResponse);
            expect(mockFileUploadService.uploadImageAsync).toHaveBeenCalled();
        });

        it('should reject on upload error', async () => {
            const mockContent = new Uint8Array([1, 2, 3, 4]);
            const imageRole = ImageRoles.AVATAR;
            const mockError = {
                code: 1,
                message: 'Upload failed',
                metadata: {},
            };

            const mockFileUploadService = jasmine.createSpyObj(
                'FileUploadGrpcEndpointClient',
                ['uploadImageAsync'],
            );
            (service as any).fileUploadService = mockFileUploadService;

            mockFileUploadService.uploadImageAsync.and.callFake(
                (_request: any, _metadata: any, callback: any) => {
                    callback(mockError, null);
                },
            );

            await expectAsync(
                service.upload(mockContent, imageRole),
            ).toBeRejectedWith(mockError);
        });

        it('should create request with correct parameters', async () => {
            const mockContent = new Uint8Array([5, 6, 7, 8]);
            const imageRole = ImageRoles.MESSAGE;
            const mockResponse = new UploadImageResponse();

            const mockFileUploadService = jasmine.createSpyObj(
                'FileUploadGrpcEndpointClient',
                ['uploadImageAsync'],
            );
            (service as any).fileUploadService = mockFileUploadService;

            mockFileUploadService.uploadImageAsync.and.callFake(
                (request: any, _metadata: any, callback: any) => {
                    expect(request.getContent()).toEqual(mockContent);
                    expect(request.getImageRole()).toBe(imageRole);
                    callback(null, mockResponse);
                },
            );

            await service.upload(mockContent, imageRole);

            expect(mockFileUploadService.uploadImageAsync).toHaveBeenCalled();
        });
    });

    describe('download', () => {
        it('should download image successfully', async () => {
            const mockResponse = new DownloadImageResponse();

            const mockFileUploadService = jasmine.createSpyObj(
                'FileUploadGrpcEndpointClient',
                ['downloadImageAsync'],
            );
            (service as any).fileUploadService = mockFileUploadService;

            mockFileUploadService.downloadImageAsync.and.callFake(
                (request: any, metadata: any, callback: any) => {
                    expect(request).toBeInstanceOf(DownloadImageRequest);
                    expect(request.getImageId()).toBe(mockImageKey.id);
                    expect(request.getFileStorageTypeId()).toBe(
                        mockImageKey.fileStorageTypeId,
                    );
                    expect(metadata.authorization).toBe(mockToken);
                    callback(null, mockResponse);
                },
            );

            const result = await service.download(mockImageKey);

            expect(result).toBe(mockResponse);
            expect(mockFileUploadService.downloadImageAsync).toHaveBeenCalled();
        });

        it('should reject on download error', async () => {
            const mockError = {
                code: 1,
                message: 'Download failed',
                metadata: {},
            };

            const mockFileUploadService = jasmine.createSpyObj(
                'FileUploadGrpcEndpointClient',
                ['downloadImageAsync'],
            );
            (service as any).fileUploadService = mockFileUploadService;

            mockFileUploadService.downloadImageAsync.and.callFake(
                (_request: any, _metadata: any, callback: any) => {
                    callback(mockError, null);
                },
            );

            await expectAsync(service.download(mockImageKey)).toBeRejectedWith(
                mockError,
            );
        });

        it('should create request with correct image key parameters', async () => {
            const customImageKey: IImageDto = {
                id: 'custom-image-id',
                fileStorageTypeId: 2,
            };
            const mockResponse = new DownloadImageResponse();

            const mockFileUploadService = jasmine.createSpyObj(
                'FileUploadGrpcEndpointClient',
                ['downloadImageAsync'],
            );
            (service as any).fileUploadService = mockFileUploadService;

            mockFileUploadService.downloadImageAsync.and.callFake(
                (request: any, metadata: any, callback: any) => {
                    expect(request.getImageId()).toBe(customImageKey.id);
                    expect(request.getFileStorageTypeId()).toBe(
                        customImageKey.fileStorageTypeId,
                    );
                    callback(null, mockResponse);
                },
            );

            await service.download(customImageKey);

            expect(mockFileUploadService.downloadImageAsync).toHaveBeenCalled();
        });

        it('should use correct authorization token', async () => {
            const customToken = 'Bearer custom-token';
            tokenStorageService.getToken.and.returnValue(customToken);
            const mockResponse = new DownloadImageResponse();

            const mockFileUploadService = jasmine.createSpyObj(
                'FileUploadGrpcEndpointClient',
                ['downloadImageAsync'],
            );
            (service as any).fileUploadService = mockFileUploadService;

            mockFileUploadService.downloadImageAsync.and.callFake(
                (_: any, metadata: any, callback: any) => {
                    expect(metadata.authorization).toBe(customToken);
                    callback(null, mockResponse);
                },
            );

            await service.download(mockImageKey);

            expect(tokenStorageService.getToken).toHaveBeenCalled();
        });
    });
});
