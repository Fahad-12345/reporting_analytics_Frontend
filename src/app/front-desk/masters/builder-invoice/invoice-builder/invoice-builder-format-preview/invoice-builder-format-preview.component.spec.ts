import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceBuilderFormatPreviewComponent } from './invoice-builder-format-preview.component';

describe('InvoiceBuilderFormatPreviewComponent', () => {
  let component: InvoiceBuilderFormatPreviewComponent;
  let fixture: ComponentFixture<InvoiceBuilderFormatPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceBuilderFormatPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceBuilderFormatPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
