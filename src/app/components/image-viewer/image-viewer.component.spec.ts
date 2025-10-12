import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerComponent } from './image-viewer.component';
import { StoreService } from 'src/app/services/store.service';
import { ErrorService } from 'src/app/services/error.service';
import { By } from '@angular/platform-browser';
import { errorMessages } from 'src/app/constants/errors';
import { IImageDto } from 'src/app/api-client/api-client';

describe('ImageViewerComponent', () => {
    let component: ImageViewerComponent;
    let fixture: ComponentFixture<ImageViewerComponent>;
    let storeService: jasmine.SpyObj<StoreService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    const imageKey: IImageDto = {
        id: 'image-id',
        fileStorageTypeId: 1,
    };

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'getImageContent',
            'setViewedImageKey',
        ]);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);

        await TestBed.configureTestingModule({
            declarations: [ImageViewerComponent],
            providers: [
                { provide: StoreService, useValue: storeService },
                { provide: ErrorService, useValue: errorService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageViewerComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call getImageContent and display the image when image key is provided', async () => {
        // Arrange
        storeService.getImageContent.and.resolveTo({ content: 'image-url' });

        // Act
        component.imageKey = imageKey;
        await component.ngOnChanges();
        fixture.detectChanges();

        // Assert
        expect(component.backgroundImage).toBe("image-url");
        expect(component.isVisible).toBeTrue();

        const imageElement = fixture.debugElement.query(By.css('img'));
        expect(imageElement.nativeElement.src).toContain('image-url');

        expect(storeService.getImageContent).toHaveBeenCalledWith(imageKey);
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should handle error and close when getImageContent fails', async () => {
        // Arrange
        const error = new Error('Sample error');
        storeService.getImageContent.and.rejectWith(error);

        // Act
        component.imageKey = imageKey;
        await component.ngOnChanges();

        // Assert
        expect(component.isVisible).toBeFalse();
        expect(storeService.getImageContent).toHaveBeenCalledWith(imageKey);
        expect(storeService.setViewedImageKey).not.toHaveBeenCalled();
        expect(errorService.handleError).toHaveBeenCalledWith(
            error,
            errorMessages.downloadImage,
        );
    });

    it('should hide the image is undefined', async () => {
        // Arrange

        // Act
        await component.ngOnChanges();

        // Assert
        expect(component.isVisible).toBeFalse();
        expect(storeService.getImageContent).not.toHaveBeenCalled();
        expect(storeService.setViewedImageKey).not.toHaveBeenCalled();
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should hide the image when close is called', () => {
        // Arrange

        // Act
        component.close();

        // Assert
        expect(component.isVisible).toBeFalse();
        expect(storeService.setViewedImageKey).toHaveBeenCalledWith(null);
        expect(errorService.handleError).not.toHaveBeenCalled();
    });
});
