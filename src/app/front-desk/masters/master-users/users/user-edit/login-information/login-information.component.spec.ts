import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	fakeAsync,
	tick,
	discardPeriodicTasks,
	flush,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskModule } from 'ngx-mask';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { LoginInformationComponent } from './login-information.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('LoginInformationComponent', () => {
	let comp: LoginInformationComponent;
	let fixture: ComponentFixture<LoginInformationComponent>;
	let request_MockService = new RequestMockService();
	// let routeActivated_MockService = new MockActivatedRoute();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LoginInformationComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				ToastrModule.forRoot(),
				BrowserAnimationsModule,
				NgxMaskModule.forRoot(),
				HttpClientTestingModule
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				MainService,
				{ provide: RequestService, useValue: request_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							parent:{
								params: of({ id: 123 })
							}	
						}
					},
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LoginInformationComponent);
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
		expect(comp.loginForm.value).toEqual({
			password:'',
			password_confirmation:''
		})
	});
	it('Should generatePassword Test',()=>{		
		comp.loginForm = comp['fb'].group({	
			password: ['', Validators.required],
			password_confirmation: ['', Validators.required]
		  })
		spyOn(comp.loginForm,'patchValue');
		comp.generatePassword();
		expect(comp.loginForm.patchValue).toHaveBeenCalled();
	});
	it('Should copyToClipBoard Test',()=>{
		let row = {
			select:function(){
				return true
			},
			setSelectionRange:function(){
				return true
			}
		}
		comp.copyToClipBoard(row);
		expect(comp).toBeTruthy();
	});
	it('Should passwordToggle Test If value not include',()=>{
		let result = comp.passwordToggle({value:null});
		expect(result).toBe(undefined);
	});
	it('Should passwordToggle Test If value & type password include',()=>{
		let result = comp.passwordToggle({value:123,type:'password'});
		expect(result).toBe(undefined);
	});
	it('Should passwordToggle Test If value & password_confirm include',()=>{
		let result = comp.passwordToggle({value:123,type:'password_confirm'});
		expect(result).toBe(undefined);
	});
	it('should disableBtn Test When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [
						{
							medical_license: '',
							medical_license_expiration_date: '',
							state_issuing_the_medical_license: '',
							degree_listed_on_the_license: '',
							medical_license_issue_date: '',
						},
					],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.submit({password:'123',password_confirmation:'123'},'submit');
		expect(comp.disableBtn).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
