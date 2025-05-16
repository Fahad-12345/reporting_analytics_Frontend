import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateShippingComponent } from './add-update-shipping.component';

describe('AddUpdateShippingComponent', () => {
  let component: AddUpdateShippingComponent;
  let fixture: ComponentFixture<AddUpdateShippingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateShippingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
