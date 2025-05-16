import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixture, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { Page } from '@appDir/front-desk/models/page';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PracticeListingComponent } from './practice-listing.component';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { of, throwError } from 'rxjs';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PracticeListingComponent', () => {
	let comp: PracticeListingComponent;
	let fixture: ComponentFixture<PracticeListingComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PracticeListingComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{ provide: RequestService, useValue: request_MockService },
	
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PracticeListingComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('should ngOnInit function test', () => {
		spyOn(comp, 'seachingData');
		spyOn(comp, 'setPage');
		spyOn(comp, 'weekdays');
		spyOn(comp, 'editFacilityForm');
		spyOn(comp, 'regionDropDown');
		comp.ngOnInit();
		expect(comp.seachingData).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.weekdays).toHaveBeenCalled();
		expect(comp.weekdays).toHaveBeenCalled();
		expect(comp.editFacilityForm).toHaveBeenCalled();
		expect(comp.regionDropDown).toHaveBeenCalled();
	});
	it('Should onLocationPageChange test and check getFacilityLocation is calling', () => {
		spyOn(comp, 'getFacilityLocation');
		const page: Page = {
			size: 10,
			totalElements: 1,
			totalPages: 0,
			pageNumber: 10,
			offset: 0,
		};
		comp.onLocationPageChange(page, 1);
		expect(comp.getFacilityLocation).toHaveBeenCalled();
	});
	it('Should toggle test and isOpenedUndefined return true', () => {
		spyOn(comp, 'getFacilityLocation');
		comp.toggle(1, 215);
		expect(comp.opened[1]).toBeTruthy();
		expect(comp.getFacilityLocation).toHaveBeenCalled();
	});
	it('Should icon test and isOpenedUndefined return true', () => {
		let iconRes = comp.icon(1);
		expect(iconRes).toBe('plus');
	});
	it('Should icon test and isOpenedUndefined return false', () => {
		comp.opened[1] = 'minus';
		let iconRes = comp.icon(1);
		expect(iconRes).toBe('minus');
	});
	it('Should hidden test and isOpenedUndefined return true', () => {
		let hiddenRes = comp.hidden(1);
		expect(hiddenRes).toBeTruthy();
	});
	it('Should hidden test and isOpenedUndefined return false', () => {
		comp.opened[1] = 'minus';
		let iconRes = comp.hidden(1);
		expect(iconRes).toBeFalsy();
	});
	it('Should Test pageLimit function', () => {
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'setPage');
		comp.pageLimit(1);
		expect(comp.facilityPage.size).toBe(1);
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should isOpenedUndefined test ', () => {
		let Result = comp.isOpenedUndefined(1);
		expect(Result).toBeTruthy();
	});
	it('Should iconClasses test and opened false', () => {
		let ResultClasses = comp.iconClasses(1);
		let ExpectedClass = {
			btn: true,
			'btn-primary': true,
			'slide-btn': true,
		};
		expect(ResultClasses).toEqual(ExpectedClass);
	});
	it('Should iconClasses test and opened true', () => {
		comp.opened[1] = 'green';
		let ResultClasses = comp.iconClasses(1);
		let ExpectedClass = {
			btn: true,
			'bg-green': true,
			'slide-btn': true,
		};
		expect(ResultClasses).toEqual(ExpectedClass);
	});
	it('Should onEdit test', () => {
		spyOn(comp['router'], 'navigate');
		comp.onEdit(undefined, { id: 1 });
		expect(comp.id).toBe(1);
		expect(comp['router'].navigate).toHaveBeenCalledWith([
			`front-desk/masters/practice/practice/edit/${comp.id}`,
		]);
	});
	it('Should facilityPlus test', () => {
		comp.facilityPlus();
		expect(comp.bools).toBeFalsy();
	});
	it('Should facilityMinus test', () => {
		comp.facilityMinus();
		expect(comp.bools).toBeFalsy();
	});
	it('Should seachingData test and check form returning empty control fields', () => {
		let FormResult = comp.seachingData();
		let ExpectResult = {
			name: '',
			phone: '',
		};
		expect(FormResult.value).toEqual(ExpectResult);
	});
	it('Should resetFilters test', () => {
		comp.searchForm = comp['fb'].group({
			name: [''],
			phone: [''],
		});
		spyOn(comp.searchForm, 'reset');
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'setPage');
		comp.facilities = [1];
		comp.resetFilters();
		expect(comp.checkboxvisibility).toBeTruthy();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should initializeLocationForm test and check form returning empty control fields', () => {
		let FormResult = comp['initializeLocationForm']();
		let ExpectResult = {
			name: '',
			address: '',
			city: '',
			state: '',
			zip: '',
			floor: '',
			phone: '',
			fax: '',
			email: '',
			region: '',
			dayList: '',
			lat: '',
			long: '',
			facility_locations_id: '',
			office_hours_end: '',
			office_hours_start: '',
		};
		expect(FormResult.value).toEqual(ExpectResult);
	});
	it('Should weekdays test and return corresponding result', () => {
		comp.weekdays();
		expect(comp.weekday[0]).toEqual([{ id: 0, name: 'Sun', isColor: 'false' }]);
		expect(comp.weekday[1]).toEqual([{ id: 1, name: 'Mon', isColor: 'false' }]);
		expect(comp.weekday[2]).toEqual([{ id: 2, name: 'Tue', isColor: 'false' }]);
		expect(comp.weekday[3]).toEqual([{ id: 3, name: 'Wed', isColor: 'false' }]);
		expect(comp.weekday[4]).toEqual([{ id: 4, name: 'Thur', isColor: 'false' }]);
		expect(comp.weekday[5]).toEqual([{ id: 5, name: 'Fri', isColor: 'false' }]);
		expect(comp.weekday[6]).toEqual([{ id: 6, name: 'Sat', isColor: 'false' }]);
	});
	function address_Data() {
		return {
			address_components: [],
			adr_address: 'abd',
			formatted_address: 'abd',
			formatted_phone_number: 'abd',
			geometry: {
				location: {
					lat: function () {
						return 123;
					},
					lng: function () {
						return 123;
					},
				},
				viewport: '',
			},
			html_attributions: [],
			icon: 'abc',
			id: '1',
			international_phone_number: 'abc',
			name: 'abc',
			opening_hours: { open_now: false, periods: [], weekday_text: [] },
			permanently_closed: false,
			photos: [],
			place_id: 'abc',
			price_level: 1,
			rating: 1,
			reviews: [],
			types: [],
			url: 'abc',
			utc_offset: 1,
			vicinity: 'abc',
			website: 'abc',
		};
	}
	it('Should handleAddressChange test if type region', () => {
		comp.locationForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		spyOn(comp.locationForm, 'patchValue');
		let address: any = address_Data();
		comp.handleAddressChange(address, 'region');
		expect(comp.locationForm.patchValue).toHaveBeenCalled();
	});
	it('Should handleAddressChange test if type location', () => {
		comp.locationForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		spyOn(comp.locationForm, 'patchValue');
		let address: any = address_Data();
		comp.handleAddressChange(address, 'location');
		expect(comp.locationForm.patchValue).toHaveBeenCalled();
	});
	it('Should handleAddressChange test if type location', () => {
		comp.editForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		spyOn(comp.editForm, 'patchValue');
		let address: any = address_Data();
		comp.handleAddressChange(address, 'updateLocation');
		expect(comp.editForm.patchValue).toHaveBeenCalled();
	});
	it('Should sendId Test', () => {
		comp.sendId(1);
		expect(comp.id).toBe(1);
	});
	it('Should openModal Test', () => {
		spyOn(comp, 'weekdays');
		comp.openModal(1, 'facilityModal');
		expect(comp.id).toBe(1);
		expect(comp.office_hours_end).toBe(null);
		expect(comp.office_hours_start).toBe(null);
		expect(comp.weekdays).toHaveBeenCalled();
		expect(comp.dayRestrication.length).toBe(0);
	});
	it('Should setPage Test', () => {
		comp.searchForm = comp['fb'].group({
			name: [''],
			phone: [''],
		});
		let pageInfo = {
			offset: 0,
		};
		let ExpectedQueryParams = {
			filter: false,
			order: 'ASC',
			page: 1,
			pagination: true,
			per_page: 10,
		};
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'getMethod');
		comp.setPage(pageInfo);
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.facilityPage.pageNumber).toBe(0);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getMethod).toHaveBeenCalled();
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should fullAddress Test', () => {
		let row = {
			address: 'abc',
			floor: 'abc',
		};
		let fullAddress_Result = comp.fullAddress(row);
		expect(fullAddress_Result).toBe('abc, abc');
	});
	it('Should isAllSelectedLocations Test', () => {
		comp.selecting.selected.length = 2;
		let isAllLocations_Result = comp.isAllSelectedLocations(2, undefined);
		expect(isAllLocations_Result).toBe(true);
		expect(comp.totalLocRows).toBe(comp.selecting.selected.length);
	});
	it('Should Test masterLocationsToggle when isAllSelectedLocations True', () => {
		// spyOn(comp, 'isAllSelectedLocations').and.returnValue(of(true));
		spyOn(comp['selecting'], 'clear');
		comp.masterLocationsToggle(10, undefined);
		expect(comp['selecting'].clear).toHaveBeenCalled();
	});
	it('Should isAllSelected Test', () => {
		comp.facilities.length = 2;
		comp.selection.selected.length = 2;
		let isAllSelected_Result = comp.isAllSelected();
		expect(isAllSelected_Result).toBe(true);
		expect(comp.totalRows).toBe(comp.selection.selected.length);
	});
	it('Should Test masterToggle when isAllSelected True', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp['selection'], 'clear');
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp['selection'].clear).toHaveBeenCalled();
	});
	it('Should Test editFacilityForm and form return empty values', () => {
		let Expected = {
			name: '',
			address: '',
			city: '',
			state: '',
			zip: '',
			floor: '',
			phone: '',
			fax: '',
			email: '',
			region: '',
			dayList: '',
			lat: '',
			long: '',
			facility_locations_id: '',
			office_hours_end: '',
			office_hours_start: '',
		};
		comp.editForm = comp.editFacilityForm();
		expect(comp.editForm.value).toEqual(Expected);
	});
	it('Should Test editFacilityForm when isColor true', () => {
		let obj = {
			isColor: true,
			id: 1,
		};
		comp.dayRestrication = [1];
		comp.daysvalidation = 1;
		comp.selectDays(obj);
		expect(comp.dayRestrication.length).toBe(0);
	});
	it('Should Test editFacilityForm when isColor False', () => {
		let obj = {
			isColor: false,
			id: 1,
		};
		comp.locationForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		spyOn(comp.dayRestrication, 'push');
		comp.dayRestrication = [1,1];
		comp.daysvalidation = 1;
		comp.selectDays(obj);
		expect(comp.locationForm.value.dayList).toBe(comp.dayRestrication);
	});
	it('Should Test updateFacility ', () => {
		let get_hours = new Date();
		let row = {
			facility_id: 1,
			id: 1,
			office_hours_start: get_hours,
			office_hours_end: get_hours,
			facility_locations_id: 1,
			name: 'Mock name',
			address: 'address mock',
			city: 'mock city',
			state: 'mock state',
			zip: 'mock zip',
			floor: 'mock floor',
			phone: 'mock phone',
			fax: 'mock fax',
			email: 'mock email',
			region: 'mock region',
			lat: 'mock lat',
			long: 'mock long',
		};
		row['dayList'] = JSON.stringify([]);
		comp.editForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		let facility = {
			locations: [],
		};
		spyOn(comp, 'weekdays');
		spyOn(comp.editForm, 'patchValue');
		comp.dayRestrication = [1];
		comp.daysvalidation = 1;
		comp.weekday = [{ id: 0, name: 'Sun', isColor: 'false' }];
		comp.updateFacility('facilityEdit', facility, 0, row);
		expect(comp.weekdays).toHaveBeenCalled();
		expect(comp.editForm.patchValue).toHaveBeenCalled();
		expect(comp.submitText).toBe('Update');
	});
	it('Should Test getTime ', () => {
		let return_DateTime = comp.getTime(new Date());
		expect(return_DateTime).toBe(return_DateTime);
	});
	it('Should stringfy Test', () => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status: true,
			result: [],
		};
		let JSON_String = comp.stringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should closeAddModal Test', () => {
		comp.locationForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		spyOn(comp.locationForm, 'reset');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		comp.closeAddModal();
		expect(comp.locationForm.reset).toHaveBeenCalled();
	});
	it('Should closeUpdateModal Test', () => {
		comp.editForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		spyOn(comp.editForm, 'reset');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		comp.closeUpdateModal();
		expect(comp.editForm.reset).toHaveBeenCalled();
	});
	it('Should closeUpdateModal Test', () => {
		spyOn(comp, 'weekdays');
		spyOn(comp, 'setPage');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		comp.closeModel([]);
		expect(comp.submitText).toBe('Save');
		expect(comp.dayRestrication).toBe(null);
		expect(comp.weekdays).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.locations.length).toBe(0);
	});
	it('Should formatPhoneNumber Test', () => {
		let result = comp.formatPhoneNumber('123456');
		expect(result).toBe('123-456-56');
	});
	it('Should pageChanged Test', () => {
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'setPage');
		comp.pageChanged({ itemsPerPage: 'abc' });
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should checkInputs Test when isEmptyobject return true', () => {
		comp.searchForm = comp.seachingData();
		let result = comp.checkInputs();
		expect(result).toBe(true);
	});
	it('Should checkInputs Test when isEmptyobject return false', () => {
		comp.searchForm = comp.seachingData();
		comp.searchForm.controls.name.setValue('Dummy');
		let result = comp.checkInputs();
		expect(result).toBe(false);
	});
	it('Should getFacilityLocation When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
		};
		comp.facilities = [{ id: 2,total:0 }];

		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		let result = comp.getFacilityLocation(2);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(result).toBeUndefined();
	}));
	it('Should onEditLocation When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
		};
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'getFacilityLocation');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.onEditLocation({facility_id:2},{id:2},{size:10,pageNumber:1,totalElements:0,totalPages:10});
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.getFacilityLocation).toHaveBeenCalled();
	}));
	it('Should addLocation When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
		};
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'getFacilityLocation');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.addLocation({facility_id:2},{id:2});
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.getFacilityLocation).toHaveBeenCalled();
	}));
	it('Should onLocation When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
		};
		comp.locationForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		spyOn(comp['toastrService'],'success');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.onLocation();
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.forDisable).toBeFalsy();
		comp.modalRef.close();
	}));
	it('Should onLocation When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.locationForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
	    spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.onLocation();
	    expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should OnEditSubmit When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
		};
		comp.editForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		spyOn(comp['toastrService'],'success');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.OnEditSubmit();
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.forDisable).toBeFalsy();
		comp.modalRef.close();
	}));
	it('Should OnEditSubmit When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.editForm = comp['fb'].group({
			name: [''],
			address: [''],
			city: [''],
			state: [''],
			zip: [''],
			floor: [''],
			phone: [''],
			fax: [''],
			email: [''],
			region: [''],
			dayList: [''],
			lat: [''],
			long: [''],
			facility_locations_id: [''],
			office_hours_end: [''],
			office_hours_start: [''],
		});
	    spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.OnEditSubmit();
	    expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should getMethod When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getMethod({});
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should getMethod When Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.getMethod({});
	    expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should deleteOneLocation When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
			status:true
		};
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(comp['toastrService'],'success');
		spyOn(comp.selecting,'clear');
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.deleteOneLocation({locations:[],facility_id:2},{facility_locations_id:2});
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.selecting.clear).toHaveBeenCalled();
	}));
	it('Should deleteOneLocation When Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(confirm_MockService, 'create').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteOneLocation({locations:[],facility_id:2},{facility_locations_id:2});
	    expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should deleteOneLocation and confrim true and request When Subscribe UnSuccessfull', fakeAsync(() => {
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteOneLocation({locations:[],facility_id:2},{facility_locations_id:2});
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should deleteMultipleLocations When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
			status:true
		};
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'setPage');
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.deleteMultipleLocations({});
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	}));
	it('Should deleteMultipleLocations and confirm When Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(confirm_MockService, 'create').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteMultipleLocations({});
	    expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should deleteMultipleLocations and confrim true and request When Subscribe UnSuccessfull', fakeAsync(() => {
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteMultipleLocations({});
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));

	it('Should deleteMultipleFacility When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
			status:true
		};
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'setPage');
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.deleteMultipleFacility();
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	}));
	it('Should deleteMultipleFacility and confirm When Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(confirm_MockService, 'create').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteMultipleFacility();
	    expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should deleteMultipleFacility and confrim true and request When Subscribe UnSuccessfull', fakeAsync(() => {
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteMultipleFacility();
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));

	it('Should deleteFacility When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
			status:true
		};
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'setPage');
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.deleteFacility(2);
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	}));
	it('Should deleteFacility and confirm When Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(confirm_MockService, 'create').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteFacility(2);
	    expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should deleteFacility and confrim true and request When Subscribe UnSuccessfull', fakeAsync(() => {
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		spyOn(comp['toastrService'],'error');
		comp.deleteFacility(2);
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		flush();
	}));
	it('Should regionDropDown When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
			status:200
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.regionDropDown();
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.dropDownRegion).toEqual(formValue.result.data);
	}));
	it('Should regionDropDown When Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}) );
		comp.regionDropDown();
	    expect(request_MockService.sendRequest).toHaveBeenCalled();
		flush();
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
