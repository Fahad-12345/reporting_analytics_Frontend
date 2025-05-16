import { LocalStorage } from '@shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSelectShareableComponent } from './ng-select-shareable.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../shared.module';
import { MappingFilterShareableObject } from '../filter/model/mapping-filter-object';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NgSelectShareableComponent', () => {
	let component: NgSelectShareableComponent;
	let fixture: ComponentFixture<NgSelectShareableComponent>;
	let showListID = 2;
	let showListSlug = 'cpt';
	let showListName = 'CPT';
	let getchangeLabelName = 'name';
	let getchangeLabelID = 1;
	let getchangeName = 'WC';
	let getchangeParameterSec = 'case_type_ids';
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, ReactiveFormsModule, SharedModule, RouterTestingModule,HttpClientTestingModule ],
			providers: [Config, LocalStorage],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NgSelectShareableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
	it('should searchForm declare when component intialize', () => {
		component.ngOnInit();
		expect(component.searchForm).toBeDefined();
	});
	it('should initializeSearchForm() call on ngOnInit', () => {
		const InitSpyOn = spyOn(component, 'initializeSearchForm');
		component.ngOnInit();
		expect(InitSpyOn).toHaveBeenCalled();
	});
	it('should searchForm must be null when call on ngOnInit', () => {
		component.initializeSearchForm();
		expect(component.searchForm.value).toEqual({ common_ids: null });
	});
	it('should searchForm patchValue on ngOnInit', () => {
		spyOn(component.searchForm, 'patchValue');
		component.initializeSearchForm();
		component.ngOnInit();
		let showSelectFieldOnRefresh = 10;
		component.searchForm.patchValue({ common_ids: showSelectFieldOnRefresh });
		expect(component.searchForm.value).toEqual({ common_ids: 10 });
	});
	it('should check eventSubscriptions call on ngOnInit', () => {
		spyOn(component, 'eventSubscriptions');
		component.ngOnInit();
		expect(component.eventSubscriptions).toHaveBeenCalled();
	});
	it('should check typingSearch call on ngOnInit', () => {
		spyOn(component, 'typingSearch');
		component.ngOnInit();
		expect(component.typingSearch).toHaveBeenCalled();
	});
	it('should check typingSearch call on ngOnInit', () => {
		spyOn(component, 'typingSearch');
		component.ngOnInit();
		expect(component.typingSearch).toHaveBeenCalled();
	});
	// it('should lists after mapping on ngOnInit', () => {
	// 	component.showSelectFieldList = [
	// 		{
	// 			comments: null,
	// 			description: null,
	// 			id: showListID,
	// 			name: showListName,
	// 			slug: showListSlug,
	// 		},
	// 	];
	// 	let list = new MappingFilterShareableObject(
	// 		false,
	// 		showListID,
	// 		showListName,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 		undefined,
	// 	);
	// 	fixture.detectChanges();
	// 	component.ngOnInit();
	// 	expect(component.lists[0]).toEqual(list);
	// });
	it('should getChange emit valueChange', () => {
		spyOn(component.valueChange, 'emit');
		let list = [
			{
				bindlabelName: getchangeLabelName,
				employer_name: undefined,
				facility_full_name: undefined,
				first_name: undefined,
				full_name: undefined,
				id: getchangeLabelID,
				insurance_name: undefined,
				label_id: undefined,
				last_name: undefined,
				middle_name: undefined,
				name: getchangeName,
				plan_name: undefined,
				realObj: undefined,
			},
		];
		component.searchForm.controls.common_ids.setValue([7]);
		component.getChange(list, getchangeParameterSec);
		expect(component.valueChange.emit).toHaveBeenCalledWith({
			data: list,
			label: getchangeParameterSec,
			formValue: component.searchForm.get('common_ids').value,
		});
	});
	it('should clear method emit valueChange', () => {
		spyOn(component.valueChange, 'emit');
		let list = [];
		component.searchForm.controls.common_ids.setValue([7]);
		component.getChange(list, getchangeParameterSec);
		expect(component.valueChange.emit).toHaveBeenCalledWith({
			data: list,
			label: getchangeParameterSec,
			formValue: component.searchForm.get('common_ids').value,
		});
	});
	it('should fetchRecordOnScroll method call on next scroll with pagination and also check with empty', () => {
		spyOn(component,'selectedItemAPICall');
		component.searchedKeys.commonSearch.page = 1;
		component.searchedKeys.commonSearch.lastPage = 5;
		component.fetchRecordOnScroll();
		expect(component.selectedItemAPICall).toHaveBeenCalled();
		expect(component.selectedItemAPICall).toHaveBeenCalledWith('',2,'scroll');
	});
	it('should getFieldAction method call another function controlTouched when status false', () => {
		spyOn(component,'controlTouched');
		component.getFieldAction(false);
		expect(component.controlTouched).toHaveBeenCalled();
	});
	it('should controlTouched method call for notify control has touched', () => {
		spyOn(component.touched,'emit');
		component.controlTouched();
		expect(component.touched.emit).toHaveBeenCalledWith({
			is_touched: true
		});
	});
});
