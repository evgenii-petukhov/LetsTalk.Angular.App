import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoResizeTextArea } from './auto-resize-text-area';

describe('AutoResizeTextArea', () => {
  let component: AutoResizeTextArea;
  let fixture: ComponentFixture<AutoResizeTextArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoResizeTextArea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoResizeTextArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
