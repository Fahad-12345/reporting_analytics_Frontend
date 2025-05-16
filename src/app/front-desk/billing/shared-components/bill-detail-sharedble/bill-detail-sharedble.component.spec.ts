import { MainService } from '@appDir/shared/services/main-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BillDetailSharedbleComponent } from './bill-detail-sharedble.component';
describe('BillDetailSharedbleComponent', () => {
	let comp: BillDetailSharedbleComponent;
	let fixture: ComponentFixture<BillDetailSharedbleComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BillDetailSharedbleComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				BrowserAnimationsModule,
				ToastrModule.forRoot(),
				HttpClientTestingModule,
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				MainService
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(BillDetailSharedbleComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test',()=>{
		comp.ngOnInit();
		expect(comp.tabletWidth).toBe(1200);
		expect(comp.isTablet).toBe(false);
	});
	it('Should onWindowResize Test',()=>{
		comp.onWindowResize({target:{innerWidth:1000}});
		expect(comp.isTablet).toBe(true);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
