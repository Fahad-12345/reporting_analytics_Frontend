import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingListingComponent } from './shipping-listing.component';

describe('ShippingListingComponent', () => {
  let component: ShippingListingComponent;
  let fixture: ComponentFixture<ShippingListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShippingListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
