import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpInsuLinkageComponent } from './emp-insu-linkage.component';

describe('EmpInsuLinkageComponent', () => {
  let component: EmpInsuLinkageComponent;
  let fixture: ComponentFixture<EmpInsuLinkageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmpInsuLinkageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpInsuLinkageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
