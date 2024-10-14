import { TestBed } from '@angular/core/testing';
import { ImageUploadService } from './image-upload.service';
import { ImageService } from './image.service';
import { FileStorageService } from './file-storage.service';
import { ImageRoles, UploadImageResponse } from '../protos/file_upload_pb';

describe('ImageUploadService', () => {
    let service: ImageUploadService;
    let imageService: jasmine.SpyObj<ImageService>;
    let fileStorageService: jasmine.SpyObj<FileStorageService>;

    beforeEach(() => {
        imageService = jasmine.createSpyObj('ImageService', [
            'resizeBase64Image',
        ]);
        fileStorageService = jasmine.createSpyObj('FileStorageService', [
            'uploadImageAsBlob',
        ]);

        TestBed.configureTestingModule({
            providers: [
                ImageUploadService,
                { provide: ImageService, useValue: imageService },
                { provide: FileStorageService, useValue: fileStorageService },
            ],
        });

        service = TestBed.inject(ImageUploadService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resizeAndUploadImage', () => {
        it('should resize image and upload', async () => {
            // Arrange
            const photoUrl = 'data:image/png;base64,...';
            const width = 100;
            const height = 100;
            const imageRole = ImageRoles.AVATAR;

            const blob = new Blob();
            const uploadResponse = new UploadImageResponse();
            uploadResponse.setId('123');
            uploadResponse.setWidth(width);
            uploadResponse.setHeight(height);
            uploadResponse.setImageFormat(1);
            uploadResponse.setSignature('signature');

            imageService.resizeBase64Image.and.resolveTo(blob);
            fileStorageService.uploadImageAsBlob.and.resolveTo(uploadResponse);

            // Act
            const result = await service.resizeAndUploadImage(
                photoUrl,
                width,
                height,
                imageRole,
            );

            // Assert
            expect(imageService.resizeBase64Image).toHaveBeenCalledOnceWith(
                photoUrl,
                width,
                height,
            );
            expect(
                fileStorageService.uploadImageAsBlob,
            ).toHaveBeenCalledOnceWith(blob, imageRole);
            expect(result).toEqual(uploadResponse);
        });

        it('should handle empty photoUrl', async () => {
            // Arrange
            const photoUrl = '';
            const width = 100;
            const height = 100;
            const imageRole = ImageRoles.AVATAR;

            const uploadResponse = new UploadImageResponse();
            uploadResponse.setId('123');
            uploadResponse.setWidth(width);
            uploadResponse.setHeight(height);
            uploadResponse.setImageFormat(1);
            uploadResponse.setSignature('signature');

            fileStorageService.uploadImageAsBlob.and.resolveTo(uploadResponse);

            // Act
            const result = await service.resizeAndUploadImage(
                photoUrl,
                width,
                height,
                imageRole,
            );

            // Assert
            expect(imageService.resizeBase64Image).not.toHaveBeenCalled();
            expect(
                fileStorageService.uploadImageAsBlob,
            ).toHaveBeenCalledOnceWith(null, imageRole);
            expect(result).toEqual(uploadResponse);
        });
    });
});
