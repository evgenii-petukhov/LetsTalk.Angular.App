import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoWithAvatarFallbackComponent } from './video-with-avatar-fallback.component';

describe('VideoWithAvatarFallbackComponent', () => {
  let component: VideoWithAvatarFallbackComponent;
  let fixture: ComponentFixture<VideoWithAvatarFallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoWithAvatarFallbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoWithAvatarFallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
