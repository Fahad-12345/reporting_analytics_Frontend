import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppoinmentReportComponent } from './appoinment-report.component';

describe('AppoinmentReportComponent', () => {
  let component: AppoinmentReportComponent;
  let fixture: ComponentFixture<AppoinmentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppoinmentReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppoinmentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
