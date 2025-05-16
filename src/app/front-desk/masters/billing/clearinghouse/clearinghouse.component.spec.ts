import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearinghouseComponent } from './clearinghouse.component';

describe('ClearinghouseComponent', () => {
  let component: ClearinghouseComponent;
  let fixture: ComponentFixture<ClearinghouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClearinghouseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearinghouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
