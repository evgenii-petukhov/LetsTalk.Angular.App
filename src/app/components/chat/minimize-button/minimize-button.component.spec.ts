import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinimizeButtonComponent } from './minimize-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe(MinimizeButtonComponent.name, () => {
    let component: MinimizeButtonComponent;
    let fixture: ComponentFixture<MinimizeButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MinimizeButtonComponent],
            imports: [FontAwesomeModule],
        }).compileComponents();

        fixture = TestBed.createComponent(MinimizeButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the faDownLeftAndUpRightToCenter icon', () => {
        // Arrange
        const iconElement = fixture.debugElement.query(By.css('fa-icon'));

        // Act
        fixture.detectChanges();

        // Assert
        expect(iconElement).toBeTruthy();
        expect(iconElement.componentInstance.icon()).toEqual(component.icon);
    });

    it('should emit buttonClick with the mouse event when the button is clicked', () => {
        // Arrange
        vi.spyOn(component.buttonClick, 'emit');
        const buttonElement = fixture.debugElement.query(
            By.css('button'),
        ).nativeElement;

        // Act
        buttonElement.click();

        // Assert
        expect(component.buttonClick.emit).toHaveBeenCalledWith(
            expect.any(MouseEvent),
        );
    });

    it('should call onButtonClicked when the button is clicked', () => {
        // Arrange
        vi.spyOn(component, 'onButtonClicked');
        const buttonElement = fixture.debugElement.query(
            By.css('button'),
        ).nativeElement;

        // Act
        buttonElement.click();

        // Assert
        expect(component.onButtonClicked).toHaveBeenCalled();
    });
});
