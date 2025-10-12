import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImageComponent } from './image.component';
import { StoreService } from 'src/app/services/store.service';
import { ImagePreview } from 'src/app/models/imagePreview';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ErrorService } from 'src/app/services/error.service';
import { errorMessages } from 'src/app/constants/errors';
import { IImageDto } from 'src/app/api-client/api-client';

describe('ImageComponent', () => {
    let component: ImageComponent;
    let fixture: ComponentFixture<ImageComponent>;
    let storeService: jasmine.SpyObj<StoreService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    const imageKey: IImageDto = {
        id: 'image-id',
        fileStorageTypeId: 1,
    };

    const imagePreview = {
        id: 'imagePreview1',
        width: 200,
        height: 200,
    };

    const sizeLimit = {
        width: 100,
        height: 100,
    };

    beforeEach(waitForAsync(() => {
        storeService = jasmine.createSpyObj('StoreService', [
            'getImageContent',
            'setViewedImageKey',
        ]);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);

        TestBed.configureTestingModule({
            declarations: [ImageComponent],
            providers: [
                { provide: StoreService, useValue: storeService },
                { provide: ErrorService, useValue: errorService },
                ChangeDetectorRef,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageComponent);
        component = fixture.componentInstance;
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set size based on imagePreview input', async () => {
        // Arrange
        component.imagePreview = imagePreview;
        component.sizeLimit = sizeLimit;

        // Act
        await component.ngOnInit();

        // Assert
        const expectedScale = Math.min(
            sizeLimit.width / imagePreview.width!,
            sizeLimit.height / imagePreview.height!,
        );
        const expectedWidth = expectedScale * imagePreview.width!;
        const expectedHeight = expectedScale * imagePreview.height!;

        expect(component.width).toBe(expectedWidth);
        expect(component.height).toBe(expectedHeight);

        expect(storeService.getImageContent).toHaveBeenCalledOnceWith(
            imagePreview,
        );
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should handle unknown image size', async () => {
        // Arrange
        const imagePreviewUnknownSize = {
            id: 'imagePreview1',
        };

        component.imagePreview = imagePreviewUnknownSize;

        // Act
        await component.ngOnInit();

        // Assert
        expect(component.isSizeUnknown).toBeTrue();
        expect(component.width).toBe(
            environment.imageSettings.limits.picturePreview.width,
        );
        expect(component.height).toBe(
            environment.imageSettings.limits.picturePreview.height,
        );
        expect(storeService.getImageContent).toHaveBeenCalledOnceWith(
            imagePreviewUnknownSize,
        );
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should load image content on init if imagePreview is provided', async () => {
        // Arrange
        const imageContent = 'data:image/png;base64,someBase64Data';
        storeService.getImageContent.and.resolveTo({
            content: imageContent,
            width: 200,
            height: 200,
        });

        component.imagePreview = imagePreview;
        component.imagePreview.width = 100;

        // Act
        await component.ngOnInit();
        await fixture.whenStable();

        // Assert
        expect(component.url).toBe(imageContent);
        expect(component.isLoading).toBeFalse();
        expect(storeService.getImageContent).toHaveBeenCalledWith(
            imagePreview,
        );
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should handle error if getImageContent failed to download the image', async () => {
        // Arrange
        component.imagePreview = imagePreview;
        component.imagePreview.width = 100;

        const error = new Error('Sample error');
        storeService.getImageContent.and.rejectWith(error);

        // Act
        await component.ngOnInit();
        await fixture.whenStable();

        // Assert
        expect(component.url).toBeNull();
        expect(component.isLoading).toBeTrue();
        expect(storeService.getImageContent).toHaveBeenCalledWith(
            imagePreview,
        );
        expect(errorService.handleError).toHaveBeenCalledOnceWith(
            error,
            errorMessages.downloadImage,
        );
    });

    it('should set viewed image id on openImageViewer', async () => {
        // Arrange
        const event = new PointerEvent('click');
        spyOn(event, 'preventDefault');
        component.imageKey = imageKey;

        // Act
        component.openImageViewer(event);

        // Assert
        expect(event.preventDefault).toHaveBeenCalled();
        expect(storeService.setViewedImageKey).toHaveBeenCalledWith(imageKey);
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should not load image content if imagePreview is not provided', async () => {
        // Arrange

        // Act
        await component.ngOnInit();

        // Assert
        expect(storeService.getImageContent).not.toHaveBeenCalled();
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should set scaled size if image dimensions exceed the limit', async () => {
        // Arrange
        component.sizeLimit = sizeLimit;

        component.imagePreview = new ImagePreview({ width: 200, height: 300 });

        // Act
        await component.ngOnInit();

        // Assert
        const expectedScale = Math.min(
            sizeLimit.width / 200,
            sizeLimit.height / 300,
        );

        const expectedWidth = Math.round(expectedScale * 200);
        const expectedHeight = Math.round(expectedScale * 300);

        expect(component.width).toBe(expectedWidth);
        expect(component.height).toBe(expectedHeight);
        expect(storeService.getImageContent).not.toHaveBeenCalled();
        expect(errorService.handleError).not.toHaveBeenCalled();
    });
});
