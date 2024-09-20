import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerComponent } from './image-viewer.component';
import { StoreService } from 'src/app/services/store.service';
import { ErrorService } from 'src/app/services/error.service';
import { By } from '@angular/platform-browser';
import { errorMessages } from 'src/app/constants/errors';

describe('ImageViewerComponent', () => {
    let component: ImageViewerComponent;
    let fixture: ComponentFixture<ImageViewerComponent>;
    let storeService: jasmine.SpyObj<StoreService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'getImageContent',
            'setViewedImageId',
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

    it('should call getImageContent and display the image when imageId is provided', async () => {
        // Arrange
        component.imageId = 'test-image-id';
        storeService.getImageContent.and.resolveTo({ content: 'image-url' });

        // Act
        await component.ngOnChanges();
        fixture.detectChanges();

        // Assert
        expect(component.backgroundImage).toBe("url('image-url')");
        expect(component.isVisible).toBeTrue();

        const imageView = fixture.debugElement.query(By.css('.image-view'));
        expect(imageView.styles['background-image']).toBe('url("image-url")');

        expect(storeService.getImageContent).toHaveBeenCalledWith(
            'test-image-id',
        );
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should handle error and close when getImageContent fails', async () => {
        // Arrange
        const error = new Error('Sample error');
        storeService.getImageContent.and.rejectWith(error);
        component.imageId = 'test-image-id';

        // Act
        await component.ngOnChanges();

        // Assert
        expect(component.isVisible).toBeFalse();
        expect(storeService.getImageContent).toHaveBeenCalledWith(
            'test-image-id',
        );
        expect(storeService.setViewedImageId).not.toHaveBeenCalled();
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
        expect(storeService.setViewedImageId).not.toHaveBeenCalled();
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should hide the image when close is called', () => {
        // Arrange

        // Act
        component.close();

        // Assert
        expect(component.isVisible).toBeFalse();
        expect(storeService.setViewedImageId).toHaveBeenCalledWith(null);
        expect(errorService.handleError).not.toHaveBeenCalled();
    });
});
