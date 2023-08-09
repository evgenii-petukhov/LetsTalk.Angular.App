import { TestBed } from '@angular/core/testing';

import { RequestLoggingService } from './request-logging.service';

describe('RequestLoggingService', () => {
  let service: RequestLoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestLoggingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
