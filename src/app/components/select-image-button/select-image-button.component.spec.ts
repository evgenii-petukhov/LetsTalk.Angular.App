import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectImageButtonComponent } from './select-image-button.component';

describe('SelectImageButtonComponent', () => {
  let component: SelectImageButtonComponent;
  let fixture: ComponentFixture<SelectImageButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectImageButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectImageButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
