import { TestBed } from '@angular/core/testing';

import { ChatMappingService } from './account-mapping.service';

describe('ChatMappingService', () => {
  let service: ChatMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
