import { LoggerMockService } from '@appDir/shared/mock-services/LoggerMock.service';
import { NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
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
import { of, throwError } from 'rxjs';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Logger } from '@nsalaun/ng-logger';
// import { NgxMaskModule } from 'ngx-mask';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { FDMockService } from '@appDir/shared/mock-services/FDMockService.service';
import { SignatureMockService } from '@appDir/shared/mock-services/SignatureMock.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { TimePlanComponent } from './time-plan.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('TimePlanComponent', () => {
	let comp: TimePlanComponent;
	let fixture: ComponentFixture<TimePlanComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let logger_MockService = new LoggerMockService();
	let fd_MockService = new FDMockService();
	let signatureMockService = new SignatureMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TimePlanComponent],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{ provide: RequestService, useValue: request_MockService },
				// { provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: FDServices, useValue: fd_MockService },
				{ provide: SignatureServiceService, useValue: signatureMockService },
				{ provide: Logger, useValue: logger_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						parent: {
							snapshot: { params: { id: 123 } },
							parent: { parent: 123 },
						},
						snapshot: {
							pathFromRoot: [{ params: { id: 123 } }],
						},
						params: of({ id: 123 }),
					},
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TimePlanComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should getTimingForm Test', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		let Result = comp['getTimingForm']();
		
		expect(Result.length).toBe(3);
	});
	it('Should selectDays Test If checked false', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.selectedDays.add(1);
		comp.selectedDays.add(2);
		comp.selectedDays.add(3);
		comp.selectedDays.add(4);
		comp.selectedDays.add(5);
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		comp['getTimingForm']();
		comp.selectDays({ id: 1, name: 'Monday' });
		expect(comp.childValues.isValid).toBe(true);
	});
	it('Should selectDays Test If checked true', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		comp['getTimingForm']();
		comp.selectDays({ id: 1, name: 'Monday' });
		expect(comp.childValues.isValid).toBe(true);
	});
	it('Should formChange Test If start_time and end_time exists', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		let form = comp['getTimingForm']();
		
		comp.formChange(form[0]);
		expect(comp).toBeTruthy();
	});
	it('Should formChange Test If start_time and end_time does not exists', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		let form = comp['getTimingForm']();
		
		form[0].controls.start_time.setValue(null);
		comp.formChange(form[0]);
		expect(comp).toBeTruthy();
	});
	it('Should showTimeZoneComment Test If childValues.timeRange', () => {
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		let Result = comp.showTimeZoneComment();
		
		expect(Result).toMatch("This time scheduler is according to 'undefined'");
	});
	it('Should showTimeZoneComment Test If !childValues.timeRange & update true', () => {
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: null,
			timeZoneConverted: false,
		};
		comp.update = true;
		let Result = comp.showTimeZoneComment();
		
		expect(Result).toMatch(
			`You are viewing this schedule according to "undefined" timezone. On update your schedule will be according to 'Asia/Karachi' timezone.`,
		);
	});
	it('Should showTimeZoneComment Test If !childValues.timeRange & update false', () => {
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: null,
			timeZoneConverted: false,
		};
		comp.update = false;
		let Result = comp.showTimeZoneComment();
		
		expect(Result).toMatch(`You are saving this time according to "Asia/Karachi" timezone`);
	});
	it('Should createTimingsArray Test', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		let Result = comp['createTimingsArray']();
		
		expect(Result.length).toBe(3);
	});
	it('Should hasDays Test If Time Range has values', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [
				{
					time_zone_string: 'Asia/karachi',
					start_time: new Date().getTime().toString(),
					end_time: new Date().getTime().toString(),
					day_id: 0,
					checked: true,
				},
			],
			timeZoneConverted: false,
		};
		let Result: any = comp.hasDays(0);
		
		expect(Result.checked).toBe(true);
	});
	it('Should hasDays Test If time range invalid', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: null,
			timeZoneConverted: false,
		};
		let Result = comp.hasDays(0);
		
		expect(Result).toBe(true);
	});
	it('Should createTiming Test If childValues.timeRange', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [
				{
					time_zone_string: 'Asia/karachi',
					start_time: new Date().getTime().toString(),
					end_time: new Date().getTime().toString(),
					day_id: 0,
					checked: true,
				},
			],
			timeZoneConverted: false,
		};
		let Result = comp['createTiming'](0, 'Sunday');
		
		expect(Result.valid).toBe(true);
	});
	// fit('Should InvalidBoundries Test', fakeAsync(() => {
	// 	let Result = comp['InvalidBoundries']();
	// 	tick(15000);
	// 	discardPeriodicTasks();
	// 	
	// 	expect(Result).toBe(0);
	// }));
	it('Should validateMinBoundries Test If min_time & max_time empty', () => {
		let form = comp['fb'].group({
			min_time: [''],
			max_time: [''],
			start_time: [''],
			end_time: [''],
		});
		let Result = comp['validateMinBoundries'](form);
		
		expect(Result).toBe(null);
	});
	it('Should validateMinBoundries Test If min_time & max_time empty', () => {
		let form = comp['fb'].group({
			min_time: [''],
			max_time: [''],
			start_time: [''],
			end_time: [''],
		});
		form.controls.min_time.setValue(new Date().getTime() + ':' + new Date().getTime());
		form.controls.max_time.setValue(new Date().getTime() + ':' + new Date().getTime());
		form.controls.start_time.setValue(new Date().getTime() + ':' + new Date().getTime());
		form.controls.end_time.setValue(new Date().getTime() + ':' + new Date().getTime());
		let Result = comp['validateMinBoundries'](form);
		
		expect(Result).toBe(null);
	});
	// fit('Should createTimingsArray Test',()=>{
	// 	comp.weekday = [
	// 		{
	// 			id: 0,
	// 			name: 'Sunday',
	// 		},
	// 		{
	// 			id: 1,
	// 			name: 'Monday',
	// 		},
	// 		{
	// 			id: 2,
	// 			name: 'Tuesday',
	// 		},
	// 	];
	// 	comp.childValues = {
	// 		isValid: true,
	// 		selectedTimings: [],
	// 		timeRange: [],
	// 		timeZoneConverted: false,
	// 	};
	// 	let Result = comp['invalidTiming']('start_time', 'end_time')
	// 	
	// 	expect(Result.length).toBe(3);
	// })
	// fit('Should invalidTiming Test',()=>{
	// 	let Result = comp['invalidTiming']('start_time', 'end_time')
	// });
	it('Should matchRelation Test If locationStartTime > locationEndTime & selectedStartTime > selectedEndTime', () => {
		let Result = comp.matchRelation(10, 8, 10, 8);
		expect(Result).toBe(true);
	});
	it('Should matchRelation Test If locationStartTime > locationEndTime & selectedStartTime < selectedEndTime', () => {
		let Result = comp.matchRelation(10, 8, 8, 10);
		expect(Result).toBe(false);
	});
	it('Should matchRelation Test If locationStartTime < locationEndTime & selectedStartTime > selectedEndTime', () => {
		let Result = comp.matchRelation(8, 10, 8, 10);
		expect(Result).toBe(true);
	});
	it('Should matchRelation Test If locationStartTime > locationEndTime & selectedStartTime < selectedEndTime', () => {
		let Result = comp.matchRelation(10, 8, 8, 10);
		expect(Result).toBe(false);
	});
	it('Should replicate Test If all', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		comp['getTimingForm']();
		comp.replicate('all', 1);
		
		expect(comp.form.get('timing')['controls'][1].value.replicate).toBe('');
	});
	it('Should replicate Test If below', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		comp['getTimingForm']();
		comp.replicate('below', 1);
		
		expect(comp.form.get('timing')['controls'][1].value.replicate).toBe('');
	});
	it('Should replicate Test If above', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [],
			timeZoneConverted: false,
		};
		comp.form = comp['fb'].group({
			timing: comp['createTimingsArray'](),
		});
		comp['getTimingForm']();
		comp.replicate('above', 1);
		
		expect(comp.form.get('timing')['controls'][1].value.replicate).toBe('');
	});
	it('Should isSameLoginUser Test', () => {
		let form = comp['fb'].group({
			name: [''],
		});
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		comp.isSameLoginUser(form);
		expect(comp).toBeTruthy();
	});
	it('Should newValidation Test If control has value', () => {
		let form = comp['fb'].group({
			control: [''],
		});
		form.controls.control.setValue('control mock value');
		let Result = comp.newValidation(form);
		expect(Result).toBe(null);
	});
	it('Should newValidation Test If control has no value', () => {
		let form = comp['fb'].group({
			value: [''],
		});
		// form.controls.value.setValue(false);
		let Result = comp.newValidation(form.controls['value']);
		expect(Result).toEqual({ newerr: true });
	});
	it('Should validateOpeningDate Test', () => {
		let Result = comp.validateOpeningDate(new Date().toString());
		
		expect(comp).toBeTruthy();
	});
	it('Should validateClosingDate Test', () => {
		let Result = comp.validateClosingDate(new Date());
		
		expect(comp).toBeTruthy();
	});
	it('Should convertTimeToDate Test If string not send', () => {
		let Result = comp.convertTimeToDate(null);
		
		expect(Result).toBe(null);
	});
	it('Should convertTimeToDate Test If string not send', () => {
		let Result = comp.convertTimeToDate('20:2021:23');
		
		expect(Result.getDate().toString()).toBeTruthy();
	});
	it('Should ngOnChanges Test If childValues.selectedTimings have values', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		// comp.childValues = {
		// 	isValid: true,
		// 	// selectedTimings: [
		// 	// 	{
		// 	// 		name: 'time',
		// 	// 		time_zone_string: 'Asia/Karachi',
		// 	// 		checked: true,
		// 	// 		replicate: true,
		// 	// 		start_time: new Date().getTime().toString(),
		// 	// 		end_time: new Date().getTime().toString(),
		// 	// 		day_id: 0,
		// 	// 	},
		// 	// ],
		// 	timeRange: [
		// 		{
		// 			time_zone_string: 'Asia/karachi',
		// 			start_time: new Date().getTime().toString(),
		// 			end_time: new Date().getTime().toString(),
		// 			day_id: 0,
		// 			checked: true,
		// 		},
		// 	],
		// 	timeZoneConverted: false,
		// };
		comp.disableForm = true;
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		comp.ngOnChanges({});
		
		expect(comp).toBeTruthy();
	});
	it('Should ngOnChanges Test If childValues.selectedTimings have no values', () => {
		comp.weekday = [
			{
				id: 0,
				name: 'Sunday',
			},
			{
				id: 1,
				name: 'Monday',
			},
			{
				id: 2,
				name: 'Tuesday',
			},
		];
		comp.childValues = {
			isValid: true,
			selectedTimings: [],
			timeRange: [
				{
					time_zone_string: 'Asia/karachi',
					start_time: new Date().getTime().toString(),
					end_time: new Date().getTime().toString(),
					day_id: 0,
					checked: true,
				},
			],
			timeZoneConverted: false,
		};
		comp.disableForm = true;
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		comp.ngOnChanges({});
		
		expect(comp).toBeTruthy();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
