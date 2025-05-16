import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientsLocationsComponent } from './recipients-locations.component';

describe('RecipientsLocationsComponent', () => {
  let component: RecipientsLocationsComponent;
  let fixture: ComponentFixture<RecipientsLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipientsLocationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipientsLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
