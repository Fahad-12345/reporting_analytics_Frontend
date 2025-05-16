import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateInventoryFormComponent } from './add-update-inventory-form.component';

describe('AddUpdateInventoryFormComponent', () => {
  let component: AddUpdateInventoryFormComponent;
  let fixture: ComponentFixture<AddUpdateInventoryFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateInventoryFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateInventoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
