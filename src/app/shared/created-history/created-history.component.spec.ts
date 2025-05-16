import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedHistoryComponent } from './created-history.component';

describe('CreatedHistoryComponent', () => {
  let component: CreatedHistoryComponent;
  let fixture: ComponentFixture<CreatedHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatedHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatedHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
