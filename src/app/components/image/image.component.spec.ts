import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImageComponent } from './image.component';
import { StoreService } from 'src/app/services/store.service';
import { ImagePreview } from 'src/app/models/imagePreview';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ErrorService } from 'src/app/services/error.service';

describe('ImageComponent', () => {
    let component: ImageComponent;
    let fixture: ComponentFixture<ImageComponent>;
    let storeService: jasmine.SpyObj<StoreService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    beforeEach(waitForAsync(() => {
        storeService = jasmine.createSpyObj('StoreService', ['getImageContent', 'setViewedImageId']);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);

        TestBed.configureTestingModule({
            declarations: [ImageComponent],
            providers: [
                { provide: StoreService, useValue: storeService },
                { provide: ErrorService, useValue: errorService },
                ChangeDetectorRef
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set size based on imagePreview input', () => {
        component.imagePreview = {
            id: 'image1',
            width: 200,
            height: 200,
        };
    
        component.sizeLimit = {
            width: 100,
            height: 100,
        };
    
        component.ngOnInit();
    
        const expectedScale = Math.min(
            component.sizeLimit.width / component.imagePreview.width!,
            component.sizeLimit.height / component.imagePreview.height!
        );
        const expectedWidth = expectedScale * component.imagePreview.width!;
        const expectedHeight = expectedScale * component.imagePreview.height!;
    
        expect(component.width).toBe(expectedWidth);
        expect(component.height).toBe(expectedHeight);
    });    

    it('should handle unknown image size', () => {
        const imagePreview: ImagePreview = { id: '1', width: undefined, height: undefined };
        component.imagePreview = imagePreview;

        component.ngOnInit();

        expect(component.isSizeUnknown).toBeTrue();
        expect(component.width).toBe(environment.imageSettings.limits.picturePreview.width);
        expect(component.height).toBe(environment.imageSettings.limits.picturePreview.height);
    });

    it('should load image content on init if imagePreview is provided', async () => {
        const imagePreview: ImagePreview = { id: '1', width: 100, height: 200 };
        const imageContent = 'data:image/png;base64,someBase64Data';
        storeService.getImageContent.and.returnValue(Promise.resolve({ content: imageContent, width: 100, height: 200 }));

        component.imagePreview = imagePreview;
        component.ngOnInit();

        await fixture.whenStable();
        fixture.detectChanges();

        expect(storeService.getImageContent).toHaveBeenCalledWith(imagePreview.id);
        expect(component.url).toBe(imageContent);
        expect(component.isLoading).toBeFalse();
    });

    it('should set viewed image id on openImageViewer', () => {
        const event = new PointerEvent('click');
        spyOn(event, 'preventDefault');
    
        component.imageId = '1';
        component.openImageViewer(event);
    
        expect(event.preventDefault).toHaveBeenCalled();
        expect(storeService.setViewedImageId).toHaveBeenCalledWith('1');
    });    

    it('should not load image content if imagePreview is not provided', () => {
        component.imagePreview = undefined;

        component.ngOnInit();

        expect(storeService.getImageContent).not.toHaveBeenCalled();
    });

    it('should set scaled size if image dimensions exceed the limit', () => {
        const sizeLimit = { width: 100, height: 100 };
        component.sizeLimit = sizeLimit;
    
        component.imagePreview = new ImagePreview({ width: 200, height: 300 });
    
        component.ngOnInit();
    
        const expectedScale = Math.min(
            sizeLimit.width / 200,
            sizeLimit.height / 300
        );
    
        const expectedWidth = expectedScale * 200;
        const expectedHeight = expectedScale * 300;
    
        expect(component.width).toBe(expectedWidth);
        expect(component.height).toBe(expectedHeight);
    });    
});
