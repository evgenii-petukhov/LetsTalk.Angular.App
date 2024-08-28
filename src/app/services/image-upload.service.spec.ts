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
        const imageServiceSpy = jasmine.createSpyObj('ImageService', ['resizeBase64Image']);
        const fileStorageServiceSpy = jasmine.createSpyObj('FileStorageService', ['uploadImageAsBlob']);

        TestBed.configureTestingModule({
            providers: [
                ImageUploadService,
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: FileStorageService, useValue: fileStorageServiceSpy }
            ]
        });
        
        service = TestBed.inject(ImageUploadService);
        imageService = TestBed.inject(ImageService) as jasmine.SpyObj<ImageService>;
        fileStorageService = TestBed.inject(FileStorageService) as jasmine.SpyObj<FileStorageService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resizeAndUploadImage', () => {
        it('should resize image and upload', async () => {
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

            imageService.resizeBase64Image.and.returnValue(Promise.resolve(blob));
            fileStorageService.uploadImageAsBlob.and.returnValue(Promise.resolve(uploadResponse));

            const result = await service.resizeAndUploadImage(photoUrl, width, height, imageRole);

            expect(imageService.resizeBase64Image).toHaveBeenCalledWith(photoUrl, width, height);
            expect(fileStorageService.uploadImageAsBlob).toHaveBeenCalledWith(blob, imageRole);
            expect(result).toEqual(uploadResponse);
        });

        it('should handle empty photoUrl', async () => {
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

            fileStorageService.uploadImageAsBlob.and.returnValue(Promise.resolve(uploadResponse));

            const result = await service.resizeAndUploadImage(photoUrl, width, height, imageRole);

            expect(imageService.resizeBase64Image).not.toHaveBeenCalled();
            expect(fileStorageService.uploadImageAsBlob).toHaveBeenCalledWith(null, imageRole);
            expect(result).toEqual(uploadResponse);
        });
    });

    describe('resizeAvatar', () => {
        it('should call imageService.resizeBase64Image with correct parameters', async () => {
            const photoUrl = 'data:image/png;base64,...';
            const maxWidth = 100;
            const maxHeight = 100;
            const blob = new Blob();

            imageService.resizeBase64Image.and.returnValue(Promise.resolve(blob));

            const result = await service['resizeAvatar'](photoUrl, maxWidth, maxHeight);

            expect(imageService.resizeBase64Image).toHaveBeenCalledWith(photoUrl, maxWidth, maxHeight);
            expect(result).toEqual(blob);
        });

        it('should return null if photoUrl is empty', async () => {
            const result = await service['resizeAvatar']('', 100, 100);
            expect(result).toBeNull();
        });
    });
});
