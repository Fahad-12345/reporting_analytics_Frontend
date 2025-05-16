import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDatePickerSharedableComponent } from './mat-date-picker-sharedable.component';

xdescribe('MatDatePickerSharedableComponent', () => {
  let component: MatDatePickerSharedableComponent;
  let fixture: ComponentFixture<MatDatePickerSharedableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatDatePickerSharedableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatDatePickerSharedableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
