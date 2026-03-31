import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimizeButtonComponent } from './minimize-button.component';

describe('MinimizeButtonComponent', () => {
  let component: MinimizeButtonComponent;
  let fixture: ComponentFixture<MinimizeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimizeButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinimizeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
