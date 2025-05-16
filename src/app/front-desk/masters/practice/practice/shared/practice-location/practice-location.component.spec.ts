import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
// import { NgxMaskModule } from 'ngx-mask';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PracticeLocationComponent } from './practice-location.component';

describe('PracticeLocationComponent', () => {
	let comp: PracticeLocationComponent;
	let fixture: ComponentFixture<PracticeLocationComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PracticeLocationComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports:[
				SharedModule,
				ToastrModule.forRoot(),
				RouterTestingModule,
				BrowserAnimationsModule,
				HttpClientTestingModule 
			],
			providers:[
				Config,
				LocalStorage,
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PracticeLocationComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
