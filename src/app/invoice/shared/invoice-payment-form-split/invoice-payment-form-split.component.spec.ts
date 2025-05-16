import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePaymentFormSplitComponent } from './invoice-payment-form-split.component';

describe('InvoicePaymentFormSplitComponent', () => {
  let component: InvoicePaymentFormSplitComponent;
  let fixture: ComponentFixture<InvoicePaymentFormSplitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicePaymentFormSplitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePaymentFormSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
