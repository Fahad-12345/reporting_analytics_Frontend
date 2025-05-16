import { TestBed } from '@angular/core/testing';

import { DatePipeFormatService } from './datePipe-format.service';

describe('DatePipeFormatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatePipeFormatService = TestBed.get(DatePipeFormatService);
    expect(service).toBeTruthy();
  });
});

