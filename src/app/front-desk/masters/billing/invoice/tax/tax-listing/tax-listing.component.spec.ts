import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxListingComponent } from './tax-listing.component';

describe('TaxListingComponent', () => {
  let component: TaxListingComponent;
  let fixture: ComponentFixture<TaxListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
