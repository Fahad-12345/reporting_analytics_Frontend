import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianAddEditComponent } from './physician-add-edit.component';

describe('PhysicianAddEditComponent', () => {
  let component: PhysicianAddEditComponent;
  let fixture: ComponentFixture<PhysicianAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysicianAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicianAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
