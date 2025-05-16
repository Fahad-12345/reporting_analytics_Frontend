import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailShareableComponent } from './invoice-detail-shareable.component';

describe('InvoiceDetailShareableComponent', () => {
  let component: InvoiceDetailShareableComponent;
  let fixture: ComponentFixture<InvoiceDetailShareableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDetailShareableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDetailShareableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
