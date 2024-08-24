import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginByEmailComponent } from './login-by-email.component';

describe('LoginByEmailComponent', () => {
  let component: LoginByEmailComponent;
  let fixture: ComponentFixture<LoginByEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginByEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginByEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
