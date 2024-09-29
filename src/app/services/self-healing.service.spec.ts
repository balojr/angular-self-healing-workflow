import { TestBed } from '@angular/core/testing';

import { SelfHealingService } from './self-healing.service';

describe('SelfHealingService', () => {
  let service: SelfHealingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelfHealingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
