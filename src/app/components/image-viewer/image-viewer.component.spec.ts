import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerComponent } from './image-viewer.component';
import { Store, StoreModule } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { ErrorService } from 'src/app/services/error.service';

describe('ImageViewerComponent', () => {
    let component: ImageViewerComponent;
    let fixture: ComponentFixture<ImageViewerComponent>;
    let store: Store;
    let storeService: jasmine.SpyObj<StoreService>;
    let unsubscribe$: Subject<void>;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', ['getImageContent', 'setViewedImageId']);
        const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleError']);

        await TestBed.configureTestingModule({
            declarations: [ImageViewerComponent],
            imports: [StoreModule.forRoot({})],
            providers: [
                { provide: StoreService, useValue: storeService },
                { provide: ErrorService, useValue: errorServiceSpy },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ImageViewerComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        unsubscribe$ = component['unsubscribe$'];
        spyOn(store, 'select').and.returnValue(of(null));
        fixture.detectChanges();
    });

    afterEach(() => {
        unsubscribe$.next();
        unsubscribe$.complete();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set background image correctly', () => {
        const urls = ['url1', 'url2'];
        component['setBackgroundImage'](...urls);
        expect(component.backgroundImage).toBe(`url('url1'), url('url2')`);
    });

    it('should clear the viewed image ID on close', () => {
        component.close();
        expect(storeService.setViewedImageId).toHaveBeenCalledWith(null);
    });

    it('should unsubscribe on destroy', () => {
        spyOn(unsubscribe$, 'next').and.callThrough();
        spyOn(unsubscribe$, 'complete').and.callThrough();

        component.ngOnDestroy();

        expect(unsubscribe$.next).toHaveBeenCalled();
        expect(unsubscribe$.complete).toHaveBeenCalled();
    });

    it('should not call getImageContent when imageId is null', () => {
        component.ngOnInit();

        expect(storeService.getImageContent).not.toHaveBeenCalled();
    });
});
