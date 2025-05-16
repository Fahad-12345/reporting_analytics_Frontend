import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyVerificationComponent } from './reply-verification.component';

describe('ReplyVerificationComponent', () => {
  let component: ReplyVerificationComponent;
  let fixture: ComponentFixture<ReplyVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplyVerificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
