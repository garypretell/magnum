import { TestBed } from '@angular/core/testing';

import { BigqueryService } from './bigquery.service';

describe('BigqueryService', () => {
  let service: BigqueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BigqueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
