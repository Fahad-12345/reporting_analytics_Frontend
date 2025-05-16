import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAppointmentsComponent } from './delete-appointments.component';

describe('DeleteAppointmentsComponent', () => {
  let component: DeleteAppointmentsComponent;
  let fixture: ComponentFixture<DeleteAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteAppointmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
