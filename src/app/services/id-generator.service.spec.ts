import { TestBed } from '@angular/core/testing';

import { IdGeneratorService } from './id-generator.service';

describe('ChatIdService', () => {
  let service: IdGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
