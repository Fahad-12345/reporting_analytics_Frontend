import { FormBuilder } from '@angular/forms';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicFormComponent } from './dynamic-form.component';
import { DynamicFieldDirective } from '../../directives/dynamic-field.directive';
import { dynamicFormMockValues } from './dynamic-form-mock-values';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DynamicFormComponent', () => {
	let comp: DynamicFormComponent;
	let fixture: ComponentFixture<DynamicFormComponent>;
	let request_MockService = new RequestMockService();
	let dynamicFormSetMockValues = new dynamicFormMockValues();
	let mockFields: any = dynamicFormSetMockValues.fields;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DynamicFormComponent, DynamicFieldDirective],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, BrowserAnimationsModule,HttpClientTestingModule],
			providers: [
				Config,
				LocalStorage,
				FormBuilder,
				{ provide: RequestService, useValue: request_MockService },
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(DynamicFormComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnChanges Test', () => {
		spyOn(comp, 'createControl');
		comp.fields = mockFields;
		comp.ngOnChanges();
		expect(comp.createControl).toHaveBeenCalled();
		expect(comp.formReady).toBe(true);
	});
	it('should ngOnInit Test', fakeAsync(() => {
		comp.form = comp.createControl(mockFields);
		spyOn(comp['onValueChange'], 'emit');
		comp.ngOnInit();
		fixture.detectChanges();
		tick();
		expect(comp['onValueChange'].emit).toHaveBeenCalled();
	}));
	it('Should disableHiddenControlsPublic Test', () => {
		spyOn(comp, 'disableHiddenControls');
		spyOn(comp, 'validateAllFormFields');
		comp.disableHiddenControlsPublic();
		expect(comp.disableHiddenControls).toHaveBeenCalled();
		expect(comp.validateAllFormFields).toHaveBeenCalled();
	});
	it('Should enableHiddenControlsPublic Test', () => {
		spyOn(comp, 'enableHiddenControls');
		comp.enableHiddenControlsPublic();
		expect(comp.enableHiddenControls).toHaveBeenCalled();
	});
	it('Should onSubmit Test If form valid', () => {
		var e = jasmine.createSpyObj('e', ['preventDefault', 'stopPropagation']);
		comp.form = comp.createControl(mockFields);
		spyOn(comp, 'disableHiddenControls');
		spyOn(comp, 'enableHiddenControls');
		spyOn(comp['submit'], 'emit');
		comp.onSubmit(e);
		expect(comp['submit'].emit).toHaveBeenCalled();
		expect(comp.enableHiddenControls).toHaveBeenCalled();
		expect(comp.disableHiddenControls).toHaveBeenCalled();
	});
	it('Should onSubmit Test If form Invalid', () => {
		comp.form = comp.createControl(mockFields);
		var e = jasmine.createSpyObj('e', ['preventDefault', 'stopPropagation']);
		spyOn(comp, 'disableHiddenControls');
		spyOn(comp, 'enableHiddenControls');
		spyOn(comp, 'validateAllFormFields');
		comp.form.controls.id.setErrors({ incorrect: true });
		comp.onSubmit(e);
		expect(comp.validateAllFormFields).toHaveBeenCalled();
		expect(comp.enableHiddenControls).toHaveBeenCalled();
		expect(comp.disableHiddenControls).toHaveBeenCalled();
	});
	it('Should getFormControlByNameFromForm Test', () => {
		let form = comp.createControl(mockFields);
		let Result = comp.getFormControlByNameFromForm(form, 'id');
		expect(Result.value).toBe('');
	});
	it('Should findFormControl Test', () => {
		let form = comp.createControl(mockFields);
		let Result = comp.findFormControl('id', form);
		expect(Result.value).toBe('');
	});
	it('Should disableFormControl Test', () => {
		let form = comp.createControl(mockFields);
		comp.disableFormControl('id', form);
		expect(comp).toBeTruthy();
	});
	it('Should enableControl Test', () => {
		comp.enableControl(mockFields);
		expect(comp).toBeTruthy();
	});
	it('Should enableHiddenControls Test', () => {
		spyOn(comp, 'enableControl');
		comp.enableHiddenControls(mockFields);
		expect(comp.enableControl).toHaveBeenCalled();
	});
	it('Should disableHiddenControls Test', () => {
		spyOn(comp, 'disableControl');
		comp.disableHiddenControls(mockFields);
		expect(comp.disableControl).toHaveBeenCalled();
	});
	it('Should disableControl Test', () => {
		let mockFields: any = dynamicFormSetMockValues.disabledControlFiels;
		spyOn(comp, 'findFormControl');
		comp.disableControl(mockFields);
		expect(comp.findFormControl).toHaveBeenCalled();
		expect(comp).toBeTruthy();
	});
	it('Should getInvalidFormControls Test', () => {
		comp.form = comp.createControl(mockFields);
		let Result = comp.getInvalidFormControls();
		expect(Result.length).toBe(0);
	});
	it('Should getInvalidFormControlRecursive Test', () => {
		let InnerForm = comp['fb'].group({
			id: [''],
			controls: comp['fb'].group({
				id: [''],
			}),
		});
		InnerForm.controls.id.setErrors({ incorrect: true });
		let Result = comp.getInvalidFormControlRecursive(InnerForm);
		expect(Result.length).toBe(1);
	});
	it('Should ngAfterViewInit Test', () => {
		comp.form = comp.createControl(mockFields);
		spyOn(comp['onReady'], 'emit');
		comp.ngAfterViewInit();
		expect(comp['onReady'].emit).toHaveBeenCalled();
	});
	it('Should createControl Test', () => {
		spyOn(comp, 'createChildControls');
		let Result = comp.createControl(mockFields);
		expect(comp.createChildControls).toHaveBeenCalled();
		expect(Result.value).toEqual({});
	});
	it('Should validateAllFormFields Test', () => {
		let InnerForm = comp['fb'].group({
			id: [''],
		});
		comp.validateAllFormFields(InnerForm);
		expect(comp).toBeTruthy();
	});
	it('Should bindValidations Test If validation not null', () => {
		let validations = [
			{
				name: 'max_date',
				message: 'Max date should be 8/25/2021',
				validator: true,
			},
		];
		let Result = comp.bindValidations(validations);
		expect(Result).toBeTruthy();
	});
	it('Should bindValidations Test If validation null', () => {
		let validations = [];
		let Result = comp.bindValidations(validations);
		expect(Result).toBe(null);
	});
	it('Should createChildControls Test', () => {
		let fields: any = dynamicFormSetMockValues.createChildControlsFields;
		const group = comp['fb'].group({});
		let result = comp.createChildControls(fields, group);
		expect(result).toBeUndefined();
	});
	it('Should validateFormFields Test', () => {
		const group = comp['fb'].group({
			name: [''],
		});
		group.controls.name.setErrors({ incorrect: true });
		comp.fields = mockFields;
		comp.validateFormFields(group);
		expect(comp).toBeTruthy();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
