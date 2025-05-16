import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceFormatLoadComponent } from './invoice-format-load.component';

describe('InvoiceFormatLoadComponent', () => {
  let component: InvoiceFormatLoadComponent;
  let fixture: ComponentFixture<InvoiceFormatLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceFormatLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceFormatLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
