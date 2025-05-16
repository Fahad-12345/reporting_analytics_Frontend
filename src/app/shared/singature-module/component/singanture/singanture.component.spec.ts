import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingantureComponent } from './singanture.component';

describe('SingantureComponent', () => {
  let component: SingantureComponent;
  let fixture: ComponentFixture<SingantureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingantureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingantureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
