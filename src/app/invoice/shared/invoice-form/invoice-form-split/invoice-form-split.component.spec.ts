import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceFormSplitComponent } from './invoice-form-split.component';

describe('InvoiceFormSplitComponent', () => {
  let component: InvoiceFormSplitComponent;
  let fixture: ComponentFixture<InvoiceFormSplitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceFormSplitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceFormSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
