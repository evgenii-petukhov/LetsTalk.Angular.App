import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineCountdownComponent } from './inline-countdown.component';
import { fakeAsync, tick, flush } from '@angular/core/testing';

describe('InlineCountdownComponent', () => {
    let component: InlineCountdownComponent;
    let fixture: ComponentFixture<InlineCountdownComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InlineCountdownComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InlineCountdownComponent);
        component = fixture.componentInstance;
        component.startValue = 5;
    });

    it('should emit expired event when countdown reaches zero', fakeAsync(() => {
        // Arrange
        spyOn(component.expired, 'emit');

        // Act
        component.ngOnInit();
        tick(5000);

        // Assert
        expect(component.value()).toBe(0);

        component.ngOnDestroy();
        flush();
    }));

    it('should decrement value every second', fakeAsync(() => {
        // Arrange

        // Act
        component.ngOnInit();
        tick(1000);

        // Assert
        expect(component.value()).toBe(4);

        tick(1000);
        expect(component.value()).toBe(3);

        component.ngOnDestroy();
        flush();
    }));

    it('should stop the timer when countdown reaches zero', fakeAsync(() => {
        // Arrange
        spyOn(window, 'clearInterval').and.callThrough();

        // Act
        component.ngOnInit();
        tick(5000);

        // Assert
        expect(component.value()).toBe(0);
        expect(window.clearInterval).toHaveBeenCalled();

        component.ngOnDestroy();
        flush();
    }));
});
