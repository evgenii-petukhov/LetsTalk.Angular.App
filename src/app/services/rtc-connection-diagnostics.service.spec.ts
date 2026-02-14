import { TestBed } from '@angular/core/testing';

import { RtcConnectionDiagnosticsService } from './rtc-connection-diagnostics.service';

describe('RtcConnectionDiagnosticsService', () => {
  let service: RtcConnectionDiagnosticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RtcConnectionDiagnosticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
