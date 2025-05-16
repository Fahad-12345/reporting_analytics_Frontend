import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDocFileComponent } from './view-doc-file.component';

describe('ViewDocFileComponent', () => {
  let component: ViewDocFileComponent;
  let fixture: ComponentFixture<ViewDocFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDocFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDocFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
