import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	fakeAsync,
	tick,
	discardPeriodicTasks,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EorMockService } from '@appDir/shared/mock-services/EorMockService.service';
import { EORService } from '@appDir/eor/shared/eor.service';
import { BillListingComponent } from './bill-listing.component';
import { ActivatedRoute } from '@angular/router';
import { BillistingMockValues } from './bill-listing-mock-values/bill-listing-mock-values';
import { Validators } from '@angular/forms';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { CreateBillModalComponent } from '../shared-components/create-bill-modal/create-bill-modal.component';
import { MainService } from '@appDir/shared/services/main-service';
import { DenialMockService } from '@appDir/shared/mock-services/DenialMock.service';
import { DenialService } from '@appDir/denial/denial.service';
import { VerificationMockService } from '@appDir/shared/mock-services/VerificationMockService.service';
import { VerificationService } from '@appDir/verification/verification.service';
import { CustomDiallogMockService } from '@appDir/shared/mock-services/CustomDialog.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { Socket } from 'ngx-socket-io';
describe('BillListingComponent', () => { 
	let comp: BillListingComponent;
	let fixture: ComponentFixture<BillListingComponent>;
	let eorMockService = new EorMockService();
	let billistingGetMockValues = new BillistingMockValues();
	let requestMockService = new RequestMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let denial_MockService = new DenialMockService();
	let verification_MockService = new VerificationMockService();
	let custom_MockSerice = new CustomDiallogMockService();
	function setInitialPageValue() {
		let page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
		};
		return page;
	}
	function billFormInit() {
		comp.billform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
	}
	function openModal() {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('bill_listingModal', ngbModalOptions);
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BillListingComponent,CreateBillModalComponent],
			imports: [
				SharedModule,
				RouterTestingModule.withRoutes([]),
				ToastrModule.forRoot(),
				BrowserAnimationsModule,
				HttpClientTestingModule,
			],
			schemas: [NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA ],
			providers: [
				Config,
				
				LocalStorage,
				ToastrService,
				MainService,
				{
					provide: EORService,
					useValue: eorMockService,
				},
				{
					provide: RequestService,
					useValue: requestMockService,
				},
				{ provide: CustomDiallogService, useValue: custom_MockSerice },
				{ provide: DenialService, useValue: denial_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: VerificationService, useValue: verification_MockService },
				{ provide: Socket, useValue: {}},
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							data: {
								title: 'Title',
							},
							pathFromRoot: [null],
						},
						queryParams: of({ generate_packet: true, tabs: 'eor' }),
					},
				},
			],
		})
			.overrideModule(BrowserDynamicTestingModule, {
				set: {
					entryComponents: [CreateBillModalComponent],
				},
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BillListingComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should getFieldAction Test', () => {
		spyOn(comp['eorService'], 'updateFilterField');
		comp.getFieldAction(true, 'name');
		expect(comp['eorService'].updateFilterField).toHaveBeenCalled();
	});
	it('Should ngOnInit Test', () => {
		comp.page = setInitialPageValue();
		spyOn(comp, 'setTitle');
		spyOn(comp, 'setpage');
		spyOn(comp['updateGenertePacket'], 'emit');
		comp.ngOnInit();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.size).toBe(10);
		expect(comp.billform.value).toEqual({ id: '', name: '', description: '', comments: '' });
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.setpage).toHaveBeenCalled();
		expect(comp['updateGenertePacket'].emit).toHaveBeenCalled();
	});
	it('Should ngAfterViewInit function test if tab Eor', () => {
		spyOn(comp, 'goto');
		comp.ngAfterViewInit();
		expect(comp.removeQueryParam).toBe(false);
		expect(comp.showTable).toBe(true);
		expect(comp.tabsAction).toMatch('eor');
		expect(comp.tabsQueryParam).toEqual({ generate_packet: true, tabs: 'eor' });
		expect(comp.goto).toHaveBeenCalledWith(1);
	});
	it('Should initializeSearchForm Function Test That searchForm should return empty values and searchForm should initialize', () => {
		comp.searchForm = comp.initializeSearchForm();
		expect(comp.searchForm.value).toEqual(billistingGetMockValues.searchFormInitRespWithEmpty);
	});
	it('Should resetCase function Test in which searchForm Should Initialization, BillSelection should clear and bill form should create', () => {
		spyOn(comp['billSelection'], 'clear');
		spyOn(comp, 'setpage');
		comp.resetCase();
		expect(comp.searchForm).toBeDefined();
		expect(comp['billSelection'].clear).toHaveBeenCalled();
		expect(comp.setpage).toHaveBeenCalled();
		expect(comp.billform.value).toEqual(billistingGetMockValues.billFormInitializationEmtpy);
	});
	it('Should checkInputs function Test should return true', () => {
		comp.searchForm = comp.initializeSearchForm();
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs function Test When SearchForm have values and should return false', () => {
		comp.searchForm = comp.initializeSearchForm();
		comp.searchForm.controls.attorney_ids.setValue([10]);
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should Test isbillAllSelected Function & Should return true Because billSelection and coming values are equal', () => {
		comp.billSelection.selected.length = 1;
		comp.billComingData = [10];
		let result = comp.isbillAllSelected();
		expect(result).toBe(true);
	});
	it('Should Test billsmasterToggle when isSelected True Then BillSelection.Clear() method should be call', () => {
		spyOn(comp, 'isbillAllSelected').and.returnValue(of(true));
		spyOn(comp['billSelection'], 'clear');
		comp.billsmasterToggle();
		expect(comp.isbillAllSelected).toHaveBeenCalled();
		expect(comp['billSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test billsmasterToggle when isSelected False', () => {
		spyOn(comp, 'isbillAllSelected').and.returnValue(false);
		comp.billTotalRows = 5;
		comp.billsmasterToggle();
		comp.billComingData = [2];
		expect(comp.isbillAllSelected).toHaveBeenCalled();
	});
	it('Should setpage Function Test , Should addUrlQueryParams,dispalyUpdatedbill and billSelection.Clear() call and check BillQueryParams Values which is set in TypeScript File', () => {
		setInitialPageValue();
		spyOn(comp['billSelection'], 'clear');
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'dispalyUpdatedbill');
		comp.searchForm = comp.initializeSearchForm();
		comp.setpage({ offset: 0 }, false);
		expect(comp['billSelection'].clear).toHaveBeenCalled();
		expect(comp.page.pageNumber).toBe(0);
		expect(comp.removeQueryParam).toBe(true);
		expect(comp.billQueryParams.filter).toBe(false);
		expect(comp.billQueryParams.order).toMatch('ASC');
		expect(comp.billQueryParams.page).toBe(1);
		expect(comp.billQueryParams.pagination).toBe(true);
		expect(comp.billQueryParams.per_page).toBe(10);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.dispalyUpdatedbill).toHaveBeenCalled();
	});
	it('Should addUrlQueryParams Function Test Which is responsible for showing the params in Url . Now verify location.replaceState() should called', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams({ id: 10 });
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should pageLimit Function Test In Which We verify setPage, BillSelection.clear() method should be called and page size should set which is sending in test case', () => {
		spyOn(comp, 'setpage');
		spyOn(comp['billSelection'], 'clear');
		comp.pageLimit('10');
		expect(comp.page.size).toBe(10);
		expect(comp.setpage).toHaveBeenCalled();
		expect(comp['billSelection'].clear).toHaveBeenCalled();
	});
	it('Should dispalyUpdatedbill Function Test And will be verify that billComingData should equal to data which send from mock data and also check that setTimeOut called. Totalelements and totalPages checked.', fakeAsync(() => {
		comp.page.size = 1;
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(billistingGetMockValues.dispalyUpdatedbillResp).pipe(delay(1)),
		);
		spyOn(window, 'setTimeout');
		comp.dispalyUpdatedbill({});
		tick(15000);
		discardPeriodicTasks();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.billComingData.length).toBe(1);
		expect(comp.page.totalElements).toBe(1);
		expect(comp.page.totalPages).toBe(1);
	}));
	it('Should dispalyUpdatedbill Function Test When requestService get Error, We will verify loadspin shoudl false and toasterService Should display error message.', fakeAsync(() => {
		comp.page.size = 1;
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ message: 'Error Message' }),
		);
		spyOn(comp['toastrService'], 'error');
		comp.dispalyUpdatedbill({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should createbillFormSubmit Function Test When billForm Should valid and requestService Send Successfull responce with statas True.', fakeAsync(() => {
		openModal();
		billFormInit();
		comp.billform.controls.name.setValue('Mock_Name');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: true }).pipe(delay(1)));
		spyOn(comp['billSelection'], 'clear');
		spyOn(comp['toastrService'], 'success');
		spyOn(comp, 'setpage');
		comp.createbillFormSubmit(comp.billform);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.billSelection.clear).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setpage).toHaveBeenCalled();
	}));
	it('Should createbillFormSubmit Function Test When billForm Should valid and requestService Send Successfull responce with statas false.', fakeAsync(() => {
		openModal();
		billFormInit();
		comp.billform.controls.name.setValue('Mock_Name');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: false }).pipe(delay(1)));
		spyOn(comp['toastrService'], 'error');
		comp.createbillFormSubmit(comp.billform);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should createbillFormSubmit Function Test When requestService get Error, We will verify loadspin should false.', fakeAsync(() => {
		openModal();
		billFormInit();
		comp.billform.controls.name.setValue('Mock_Name');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ message: 'Error Message' }),
		);
		comp.createbillFormSubmit(comp.billform);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should patchEditValues Function Test and Checked that modelSubmit Text and ModleTitle also check billForm Value matched With Set in TS file.', () => {
		billFormInit();
		comp.billComingData = [
			{
				name: 'Mock_Name',
				description: 'Mock_Description',
				comments: 'Mock_Comments',
			},
		];
		comp.patchEditValues({ id: 10 }, 0);
		expect(comp.modelSubmit).toMatch('Update');
		expect(comp.modelTitle).toMatch('Edit');
		expect(comp.billform.value).toEqual({
			id: 10,
			name: 'Mock_Name',
			description: 'Mock_Description',
			comments: 'Mock_Comments'
		});
	});
	it('Should patchAddValues Function Test Where modelSubmit and modelTitle Texts verifyand and billForm Should be reset', () => {
		billFormInit();
		spyOn(comp.billform, 'reset');
		comp.patchAddValues();
		expect(comp.modelSubmit).toMatch('Save');
		expect(comp.modelTitle).toMatch('Add');
	});
	it('Should openbillModal Test In This We verify that patchAddValues method should be called If row values null or Undefined & also check Modal open funcion should be Run.', () => {
		spyOn(comp, 'patchAddValues');
		spyOn(comp['modalService'], 'open');
		comp.openbillModal('editablebillform', null, 1);
		expect(comp.patchAddValues).toHaveBeenCalled();
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should openbillModal Test In This We verify that patchEditValues method should be called If row values not null or Undefined & also check Modal open funcion should be Run.', () => {
		spyOn(comp, 'patchEditValues');
		spyOn(comp['modalService'], 'open');
		comp.openbillModal('editablebillform', 10, 1);
		expect(comp.patchEditValues).toHaveBeenCalled();
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should updatebillFormSubmit Function Test When billForm Should valid and requestService Send Successfull responce with statas false.', fakeAsync(() => {
		openModal();
		billFormInit();
		comp.billform.controls.name.setValue('Mock_Name');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: false }).pipe(delay(1)));
		spyOn(comp['toastrService'], 'error');
		comp.updatebillFormSubmit(comp.billform);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should updatebillFormSubmit Function Test When billForm Should valid and requestService Send Successfull responce with statas True.', fakeAsync(() => {
		openModal();
		billFormInit();
		comp.billform.controls.name.setValue('Mock_Name');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: true }).pipe(delay(1)));
		spyOn(comp['billSelection'], 'clear');
		spyOn(comp['toastrService'], 'success');
		spyOn(comp, 'setpage');
		comp.updatebillFormSubmit(comp.billform);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.billSelection.clear).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setpage).toHaveBeenCalled();
	}));
	it('Should onCaseSubmit Test Here We checked that If Model Title Add then craateBillFormSubmit Should be called.', () => {
		billFormInit();
		comp.modelTitle = 'Add';
		spyOn(comp, 'createbillFormSubmit');
		comp.onCaseSubmit(comp.billform.value);
		expect(comp.createbillFormSubmit).toHaveBeenCalled();
	});
	it('Should onCaseSubmit Test Here We checked that If Model Title Add then updatebillFormSubmit Should be called', () => {
		billFormInit();
		comp.modelTitle = 'Edit';
		spyOn(comp, 'updatebillFormSubmit');
		comp.onCaseSubmit(comp.billform.value);
		expect(comp.updatebillFormSubmit).toHaveBeenCalled();
	});
	it('Should closeModel Test If billForm Touched & Dirty & CanDeactivateModelComponentService Return Succesfully Responce with null or Not Truthy Values', fakeAsync(() => {
		billFormInit();
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of(null));
		comp.billform.markAsDirty();
		comp.billform.markAsTouched();
		let ReturnValue = comp.closeModel();
		tick(15000);
		discardPeriodicTasks();
		expect(ReturnValue).toBeFalsy();
	}));
	it('Should closeModel Test If billForm Touched & Dirty & CanDeactivateModelComponentService Return Succesfully Responce Truthy Values and Then Check billForm.reset and modalRef.close called.', fakeAsync(() => {
		billFormInit();
		openModal();
		spyOn(comp['billform'], 'reset');
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of(true));
		comp.billform.markAsDirty();
		comp.billform.markAsTouched();
		comp.closeModel();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['billform'].reset).toHaveBeenCalled();
	}));
	it('Should closeModel Test If billForm Invalid and Then Check billForm.reset and modalRef.close called.', () => {
		billFormInit();
		openModal();
		spyOn(comp['billform'], 'reset');
		comp.closeModel();
		expect(comp['billform'].reset).toHaveBeenCalled();
	});
	it('Should billstringfy Test which return json billstringfy', () => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status: true,
			result: [],
		};
		let JSON_String = comp.billstringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should getCommentsBilling Tesst In this we will verify commentComponent selectedCategories and addCategoryList values matched which set and also checked getComments function called.', () => {
		let obj:any = {
			emit:function() {
				return true;
			}
		}
		comp['socket'] = obj;
		spyOn(comp.commentComponent, 'getComments');
		spyOn(comp.caseCommentsModal, 'show');
		comp.getCommentsBilling({ id: 10, case_id: 20 });
		expect(comp.commentComponent.selectedCategories).toEqual([{ id: 4 }]);
		expect(comp.commentComponent.addCategoryList).toEqual([{ id: 4 }]);
		expect(comp.commentComponent.presentPage).toBe(1);
		expect(comp.commentComponent.showCategory).toBe(false);
		expect(comp.commentComponent.comments.length).toBe(0);
		expect(comp.currentCaseId).toBe(20);
		expect(comp.commentComponent.getComments).toHaveBeenCalled();
		expect(comp.caseCommentsModal.show).toHaveBeenCalled();
	});
	it('Should getSingleBill Function Test When action Edit as given In Real Time component Html. Then will checked If action exists then billEditModel method must be called.', fakeAsync(() => {
		spyOn(comp, 'billEditModel');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(billistingGetMockValues.singleBillResp).pipe(delay(1)),
		);
		comp.getSingleBill({ id: 10 }, null, 'edit');
		tick(15000);
		discardPeriodicTasks();
		expect(comp.billEditModel).toHaveBeenCalled();
	}));
	it('Should getSingleBill Function Test When Request Service Reponse Successfull But In responce status not 200 OR True.Then Checked loadSpin variable must be false and toaster will display Error Message.', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: false }).pipe(delay(1)));
		comp.getSingleBill({ id: 10 }, null, 'edit');
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should getBillDocuments Function Test In Which If Request Serice Reponse with Status Truethy openBillPdfListing method must be called and In responce label_id must included.', fakeAsync(() => {
		spyOn(comp, 'openBillPdfListing');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(billistingGetMockValues.singleBillResp).pipe(delay(1)),
		);
		comp.getBillDocuments({ id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.openBillPdfListing).toHaveBeenCalled();
	}));
	it('Should getBillDocuments Function Test When Request Service Reponse Successfull But In responce status not 200 OR True.Then Checked loadSpin variable must be false and toaster will display Error Message.', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: false }).pipe(delay(1)));
		comp.getBillDocuments({ id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should createBill Function Test In Which there is only verify modalService should open function run with CreateBillModalComponent', () => {
		spyOn(comp['modalService'], 'open').and.returnValue(billistingGetMockValues.createBillResp);
		comp.caseId = 1;
		comp.createBill([{id:10,visit_charges:200,cpt_fee_schedules:[]}], null);
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should openBillPdfListing Function Test In Which a function setTabs is checked that calling and also checked modalService open function had called.', () => {
		spyOn(comp, 'setTabs');
		spyOn(comp['modalService'], 'open');
		comp.openBillPdfListing(null);
		expect(comp.setTabs).toHaveBeenCalled();
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should setTabs Test If recipient_type_name Equal to patient and also verify that isPatient should true and patientDocuemnt should matched which given in params.', () => {
		comp.setTabs(billistingGetMockValues.givenSetTabPatientArray);
		expect(comp.ispatient).toBe(true);
		expect(comp.patienDocument).toEqual(billistingGetMockValues.givenSetTabPatientArray[0]);
	});
	it('Should setTabs Test If recipient_type_name Equal to employer and also verify that isEmployer should true and employerDocument should matched which given in params.', () => {
		comp.setTabs(billistingGetMockValues.givenSetTabemployerArray);
		expect(comp.isEmployer).toBe(true);
		expect(comp.employerDocument[0]).toEqual(billistingGetMockValues.givenSetTabemployerArray[0]);
	});
	it('Should setTabs Test If recipient_type_name Equal to attorney and also verify that isLawyer should true and AttorneyDocument should matched which given in params.', () => {
		comp.setTabs(billistingGetMockValues.givenSetTabattorneyArray);
		expect(comp.isLawyer).toBe(true);
		expect(comp.AttorneyDocument).toEqual(billistingGetMockValues.givenSetTabattorneyArray[0]);
	});
	it('Should setTabs Test If recipient_type_name Equal to insurance and also verify that isInsurance should true and InsuranceDocument should matched which given in params.', () => {
		comp.setTabs(billistingGetMockValues.givenSetTabinsuranceArray);
		expect(comp.isInsurance).toBe(true);
		expect(comp.InsuranceDocument).toEqual(billistingGetMockValues.givenSetTabinsuranceArray[0]);
	});
	it('Should billDetailsModel Test There We will check that modalService open function should call and allList,billingDetail and totalAmount variabled must be equal to param values. ', () => {
		spyOn(comp['modalService'], 'open');
		comp.billDetailsModel('Modal', [{ visit_charges: 10 }], null);
		expect(comp.alllist).toBe(null);
		expect(comp.billingDetails.length).toBe(1);
		expect(comp.totalAmount).toBe(10);
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should generateBillEnvelopePacketPom Function Test In Which Verify that actionNameOfGenrate matched and type not excel and billUpdateStatus also true.', () => {
		spyOn(comp, 'openListOfUpdateBillModalThroughGeneratePacket');
		let Result = comp.generateBillEnvelopePacketPom(
			billistingGetMockValues.generateBillEnvelopePacketPomFirstParam,
			true,
		);
		expect(Result).toBe(false);
		expect(comp.actionNameOfGenrate).toMatch('pdf');
		expect(comp.openListOfUpdateBillModalThroughGeneratePacket).toHaveBeenCalled();
	});
	it('Should generateBillEnvelopePacketPom Function Test In Which Verify that actionNameOfGenrate matched and type excel and billUpdateStatus also false.', () => {
		spyOn(comp, 'generteAfterBillProcess');
		comp.generateBillEnvelopePacketPom(
			billistingGetMockValues.generateBillEnvelopePacketPomFirstParamWithTypeExcel,
			true,
		);
		expect(comp.actionNameOfGenrate).toMatch('excel');
		expect(comp.generteAfterBillProcess).toHaveBeenCalled();
	});
	it('Should generateBillEnvelopePacketPom Function Test In Which Verify that First Params Is not object and alos type in not excel.', () => {
		spyOn(comp, 'generteAfterBillProcess');
		comp.generateBillEnvelopePacketPom('pdf', true);
		expect(comp.actionNameOfGenrate).toMatch('pdf');
		expect(comp.generteAfterBillProcess).toHaveBeenCalled();
	});
	it('Should generteAfterBillProcess Test If Type Envelop Then generteEnvelope method must call', () => {
		spyOn(comp, 'generteEnvelope');
		comp.generteAfterBillProcess('envelope', 14, 10, 11, 42, true, 12, 'test');
		expect(comp.generteEnvelope).toHaveBeenCalled();
	});
	it('Should generteAfterBillProcess Test If Type pom Then genertePom method must call', () => {
		spyOn(comp, 'genertePom');
		comp.generteAfterBillProcess('pom', 14, 10, 11, 42, true, 12, 'test');
		expect(comp.genertePom).toHaveBeenCalled();
	});
	it('Should generteAfterBillProcess Test If Type pom Then genertePacket method must call', () => {
		spyOn(comp, 'genertePacket');
		comp.generteAfterBillProcess('packet', 14, 10, 11, 42, true, 12, 'test');
		expect(comp.genertePacket).toHaveBeenCalled();
	});
	it('Should generteAfterBillProcess Test If Type pom Then generteExcel method must call', () => {
		spyOn(comp, 'generteExcel');
		comp.generteAfterBillProcess('excel', 14, 10, 11, 42, true, 12, 'test');
		expect(comp.generteExcel).toHaveBeenCalled();
	});
	it('Should generteAfterBillProcess Test If Type pom Then onDeleteBill method must call', () => {
		spyOn(comp, 'onDeleteBill');
		comp.generteAfterBillProcess('delete-bill', 14, 10, 11, 42, true, 12, 'test');
		expect(comp.onDeleteBill).toHaveBeenCalled();
	});
	it('Should generteExcel Test We will get url base token After Request service reponse success a Url will return which will be open by window.open() method.', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: false }).pipe(delay(1)));
		spyOn(window, 'open');
		let obj: any = {
			searchForm: {
				value: {
					case_ids: 10,
				},
			},
		};
		comp.billListFilterComponent = obj;
		comp.generteExcel();
		tick(15000);
		discardPeriodicTasks();
		expect(window.open).toHaveBeenCalled();
	}));
	it('Should openPaymentModal Test Wher We test ModalService should open modal , payment Service methods should called after call openpaymentModal and also verify currentCaseId should to equal which in parameter send.', () => {
		spyOn(comp['modalService'], 'open');
		spyOn(comp['paymentService'], 'pushReloadPayment');
		spyOn(comp['eorService'], 'pushResetPaymentForm');
		spyOn(comp['eorService'], 'pushPaymentId');
		comp.openPaymentModal({ case_id: 1, id: 12, label_id: 251 }, 'paymentContent');
		expect(comp.currentBill).toEqual({
			case_id: 1,
			id: 12,
			label_id: 251,
		});
		expect(comp.currentCaseId).toBe(1);
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp['paymentService'].pushReloadPayment).toHaveBeenCalled();
		expect(comp['eorService'].pushResetPaymentForm).toHaveBeenCalled();
		expect(comp['eorService'].pushPaymentId).toHaveBeenCalledWith(0);
	});
	it('Should openDenialModal Test Wher We test ModalService should open modal , denialService methods should called after call openDenialModal and also verify currentCaseId should to equal which in parameter send.', () => {
		spyOn(comp['modalService'], 'open');
		spyOn(comp['denialService'], 'pushReloadDenial');
		spyOn(comp['denialService'], 'pushDenialForm');
		spyOn(comp['denialService'], 'pushDenialId');
		comp.openDenialModal({ case_id: 1, id: 12, label_id: 251 }, 'paymentContent');
		expect(comp.currentBill).toEqual({
			case_id: 1,
			id: 12,
			label_id: 251,
		});
		expect(comp.currentCaseId).toBe(1);
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp['denialService'].pushReloadDenial).toHaveBeenCalled();
		expect(comp['denialService'].pushDenialForm).toHaveBeenCalled();
		expect(comp['denialService'].pushDenialId).toHaveBeenCalledWith(0);
	});
	it('Should openVerificationModal Test Wher We test ModalService should open modal , verificationService methods should called after call openVerificationModal and also verify currentCaseId should to equal which in parameter send.', () => {
		spyOn(comp['modalService'], 'open');
		spyOn(comp['verificationService'], 'pushReloadVerification');
		spyOn(comp['verificationService'], 'pushVerificationForm');
		spyOn(comp['verificationService'], 'pushVerificationId');
		comp.openVerificationModal({ case_id: 1, id: 12, label_id: 251 }, 'paymentContent');
		expect(comp.currentBill).toEqual({
			case_id: 1,
			id: 12,
			label_id: 251,
		});
		expect(comp.currentCaseId).toBe(1);
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp['verificationService'].pushReloadVerification).toHaveBeenCalled();
		expect(comp['verificationService'].pushVerificationForm).toHaveBeenCalled();
		expect(comp['verificationService'].pushVerificationId).toHaveBeenCalledWith(0);
	});
	it('Should openEorModal Test Wher We test ModalService should open modal , eorService methods should called after call openEorModal and also verify currentCaseId should to equal which in parameter send.', () => {
		spyOn(comp['modalService'], 'open');
		spyOn(comp['eorService'], 'pushReloadEor');
		spyOn(comp['eorService'], 'eorPushId');
		comp.openEorModal({ case_id: 1, id: 12, label_id: 251 }, 'paymentContent');
		expect(comp.currentBill).toEqual({
			case_id: 1,
			id: 12,
			label_id: 251,
		});
		expect(comp.currentCaseId).toBe(1);
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp['eorService'].pushReloadEor).toHaveBeenCalled();
		expect(comp['eorService'].eorPushId).toHaveBeenCalled();
	});
	it('Should selectPayments Test Will Verify tabsQueryParam and removeQueryParam Variables values and checked Eor Service function called When bill_id and removeQueryParams are set as truthy.', () => {
		comp.removeQueryParam = true;
		let obj: any = billistingGetMockValues.paymentFormComponentObj;
		comp.paymentFormComponent = obj;
		spyOn(comp['eorService'], 'pushFilterFormReset');
		spyOn(comp['eorService'], 'pushResetForm');
		comp.selectPayments(true);
		expect(comp.tabsQueryParam).toEqual({});
		expect(comp['eorService'].pushFilterFormReset).toHaveBeenCalled();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	});
	it('Should selectPayments Test In that Need to When Bill_id false and removeQueryParams is also set false Then Else part will verify. And Other some common properties values are checked.', fakeAsync(() => {
		comp.caseId = 45;
		let obj: any = {
			getPaymentInfo: function () {
				return;
			},
		};
		comp.paymentSplitList = obj;
		spyOn(comp['eorService'], 'pushResetForm');
		comp.selectPayments(false);
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	}));
	it('Should selectPayments Test In that Need to When Bill_id false and removeQueryParams is also set false Then Else part will verify. And Other some common properties values are checked.', fakeAsync(() => {
		comp.caseId = 45;
		let obj: any = {
			getPaymentInfo: function () {
				return;
			},
		};
		comp.paymentSplitList = obj;
		spyOn(comp['eorService'], 'pushResetForm');
		comp.selectPayments(false);
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	}));
	it('Should getChangePageDataEor Test In that we will verify eorFormComponent has values.', () => {
		comp.currentBill = {
			id: 10,
		};
		let obj: any = billistingGetMockValues.eorFormComponentObj;
		comp.eorFormComponent = obj;
		comp.getChangePageDataEor(2);
		expect(comp.eorFormComponent).toBeTruthy();
	});
	it('Should selectEor Test Will Verify tabsQueryParam and removeQueryParam Variables values and checked Eor Service function called When bill_id and removeQueryParams are set as truthy.', () => {
		comp.removeQueryParam = true;
		let obj: any = billistingGetMockValues.eorFormComponentObj;
		comp.eorFormComponent = obj;
		spyOn(comp['eorService'], 'pushFilterFormReset');
		comp.selectEor(true);
		expect(comp.tabsQueryParam).toEqual({});
		expect(comp.formFiledValue).toEqual({});
		expect(comp.formFiledListOfValue).toEqual({});
		expect(comp['eorService'].pushFilterFormReset).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	});
	it('Should getChangePageData Test In that we will verify eorFormComponent has values.', () => {
		comp.currentBill = {
			id: 10,
		};
		let obj: any = billistingGetMockValues.eorFormComponentObj;
		comp.eorFormComponent = obj;
		comp.getChangePageData(2);
		expect(comp.eorFormComponent).toBeTruthy();
	});
	it('Should onChangeDataDenial Test In that we will verify denailListComponent has values.', () => {
		comp.currentBill = {
			id: 10,
		};
		let obj: any = billistingGetMockValues.denailListComponentObj;
		comp.denailListComponent = obj;
		comp.onChangeDataDenial(2);
		expect(comp.denailListComponent).toBeTruthy();
	});
	it('Should onChangeDataVerification Test In that we will verify verificationListComponent has values.', () => {
		comp.currentBill = {
			id: 10,
		};
		let obj: any = billistingGetMockValues.verificationListComponentObj;
		comp.verificationListComponent = obj;
		comp.onChangeDataVerification(2);
		expect(comp.verificationListComponent).toBeTruthy();
	});
	it('Should changePaymentDataCase Test In that we will verify paymentSplitList has values.', () => {
		comp.currentBill = {
			id: 10,
		};
		let obj: any = billistingGetMockValues.paymentSplitListObj;
		comp.paymentSplitList = obj;
		comp.changePaymentDataCase(2);
		expect(comp.paymentSplitList).toBeTruthy();
	});
	it('Should changePaymentData Test In that we will verify paymentFormComponent has values.', () => {
		comp.currentBill = {
			id: 10,
		};
		let obj: any = billistingGetMockValues.paymentFormComponentObj;
		comp.paymentFormComponent = obj;
		comp.changePaymentData(2);
		expect(comp.paymentFormComponent).toBeTruthy();
	});
	it('Should getChangePageDataDenial Test In that we will verify denialFormComponent has values.', () => {
		comp.currentBill = {
			id: 10,
		};
		let obj: any = billistingGetMockValues.denialFormComponentObj;
		comp.denialFormComponent = obj;
		comp.getChangePageDataDenial(2);
		expect(comp.denialFormComponent).toBeTruthy();
	});
	it('Should selectVerification Test Will Verify tabsQueryParam and removeQueryParam Variables values and checked Eor Service function called When bill_id is set as false and removeQueryParams is set as truthy.', fakeAsync(() => {
		comp.removeQueryParam = true;
		// let obj: any = billistingGetMockValues.verificationListComponentObj;
		// comp.verificationListComponent = obj;
		spyOn(comp['eorService'], 'pushFilterFormReset');
		spyOn(comp['eorService'], 'pushResetForm');
		comp.selectVerification(false);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.tabsQueryParam).toEqual({});
		expect(comp['eorService'].pushFilterFormReset).toHaveBeenCalled();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	}));
	it('Should selectDenial Test Will Verify tabsQueryParam and removeQueryParam Variables values and checked Eor Service function called When bill_id and removeQueryParams are set as truthy.', () => {
		comp.removeQueryParam = true;
		let obj: any = billistingGetMockValues.denialFormComponentObj;
		comp.denialFormComponent = obj;
		spyOn(comp['eorService'], 'pushFilterFormReset');
		spyOn(comp['eorService'], 'pushResetForm');
		comp.selectDenial(true);
		expect(comp.tabsQueryParam).toEqual({});
		expect(comp['eorService'].pushFilterFormReset).toHaveBeenCalled();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	});
	it('Should selectDenial Test In that Need to When Bill_id false and removeQueryParams is also set false Then Else part will verify. And Other some common properties values are checked.', fakeAsync(() => {
		comp.caseId = 45;
		let obj: any = {
			getDenialInfo: function () {
				return;
			},
		};
		comp.denailListComponent = obj;
		spyOn(comp['eorService'], 'pushResetForm');
		comp.selectDenial(false);
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	}));
	it('Should selectDenial Test In that Need to When Bill_id false and removeQueryParams is also set false Then Else part will verify. And Other some common properties values are checked.', fakeAsync(() => {
		comp.caseId = 45;
		let obj: any = {
			getDenialInfo: function () {
				return;
			},
		};
		comp.denailListComponent = obj;
		spyOn(comp['eorService'], 'pushResetForm');
		comp.selectDenial(false);
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
		expect(comp.removeQueryParam).toBe(true);
	}));
	it('Should addManualAppeal Test Should check currentVerificationRecived equal those values which sending in parameter and modalservice open function must call.', () => {
		spyOn(comp['modalService'], 'open');
		comp.addManualAppeal({});
		expect(comp.currentVerificationRecived).toEqual({});
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should saveVerificationEmitter Function Test And will be verify that verificationService function and toaster Serivce and verification Modal function must be called after request responce successfull.', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.verificationModelClosed = comp['modalService'].open('bill_listingModal', ngbModalOptions);
		spyOn(comp['verificationService'], 'pushReloadVerification');
		spyOn(comp['toastrService'], 'success');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(billistingGetMockValues.saveVerificationEmitterResp).pipe(delay(1)),
		);
		comp.saveVerificationEmitter({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['verificationService'].pushReloadVerification).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		comp.verificationModelClosed.close();
	}));
	it('Should packetGeneration Function Test with Request Service reponce successfull and now verify that in success case should all statement run and function called.', fakeAsync(() => {
		spyOn(comp['billSelection'], 'clear');
		spyOn(comp['toastrService'], 'success');
		spyOn(comp, 'setpage');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: true }).pipe(delay(1)));
		comp.packetGeneration({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['billSelection'].clear).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setpage).toHaveBeenCalled();
	}));
	it('Should packetGeneration Function Test with Request Service reponce UnSuccessfull and now verify that in Fail case should all statement run and function called.', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Message Error' } }),
		);
		comp.packetGeneration({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should moveToBill Test', () => {
		spyOn(comp['router'], 'navigate');
		spyOn(comp['modalService'], 'dismissAll');
		comp.moveToBill({ label_id: 1, id: 1 });
		expect(comp['router'].navigate).toHaveBeenCalled();
		expect(comp['modalService'].dismissAll).toHaveBeenCalled();
	});
	it('Should moveToCaseInfo Test', () => {
		spyOn(comp['router'], 'navigate');
		spyOn(comp['modalService'], 'dismissAll');
		comp.moveToCaseInfo({ label_id: 1, id: 1 });
		expect(comp['router'].navigate).toHaveBeenCalled();
		expect(comp['modalService'].dismissAll).toHaveBeenCalled();
	});
	it('Should openListOfUpdateBillModalThroughGeneratePacket Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.openListOfUpdateBillModalThroughGeneratePacket(null, 'modal');
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp.updateBillListOfDetails).toBeNull();
	});
	it('Should goto Test', () => {
		let obj: any = {
			tabs: [
				{
					active: false,
				},
			],
		};
		comp.tabset = obj;
		comp.goto(0);
		expect(comp.tabset.tabs[0].active).toBe(true);
	});
	it('Should onDeleteBill When Subscribe successfull', fakeAsync(() => {
		spyOn(comp, 'setpage');
		spyOn(comp['toastrService'], 'success');
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Success' }).pipe(delay(1)),
		);
		comp.onDeleteBill({ ids: [20] });
		expect(custom_MockSerice.confirm).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setpage).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
		expect(comp['toastrService'].success);
		expect(comp.page.pageNumber).toBe(0);
	}));
	it('Should onDeleteBill When Subscribe successfull If responcse status false', fakeAsync(() => {
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(of({ status: false }).pipe(delay(1)));
		comp.onDeleteBill({ ids: [20] });
		expect(custom_MockSerice.confirm).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should onDeleteBill When Subscribe Unsuccessfull', fakeAsync(() => {
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.onDeleteBill({ ids: [20] });
		expect(custom_MockSerice.confirm).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should filterData Test', () => {
		spyOn(comp, 'setpage');
		comp.filterData({ bill_date: '2021-12-10', date_of_accident: '2020-10-10' });
		expect(comp.setpage).toHaveBeenCalled();
	});
	it('Should getRecipatentName Test', () => {
		let result = comp.getRecipatentName({
			recipient: {
				first_name: 'first_name',
				middle_name: 'middle_name',
				last_name: 'last_name',
			},
			bill_recipient_type_id: 1,
		});
		expect(result).toMatch('first_name middle_name last_name');
	});
	it('Should getRecipatentName Test', () => {
		let result = comp.getRecipatentName({
			recipient: {
				employer_name: 'Mock_Emloyer',
			},
			bill_recipient_type_id: 2,
		});
		expect(result).toMatch('Mock_Emloyer');
	});
	it('Should getRecipatentName Test', () => {
		let result = comp.getRecipatentName({
			recipient: {
				insurance_name: 'Insurance_Name',
			},
			bill_recipient_type_id: 5,
		});
		expect(result).toMatch('Insurance_Name');
	});
	it('Should getRecipatentIndex Test', () => {
		let result = comp.getRecipatentIndex([{ bill_recipient_type_id: 3 }]);
		expect(result).toBe(0);
	});
	it('Should selectBillsList Test', fakeAsync(() => {
		spyOn(comp['eorService'], 'pushBillFilterFormReset');
		let obj: any = {
			eventsSubject: {
				next: function () {
					return true;
				},
			},
		};
		comp.billListFilterComponent = obj;
		spyOn(comp, 'resetCase');
		comp.selectBillsList();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].pushBillFilterFormReset).toHaveBeenCalled();
		expect(comp.resetCase).toHaveBeenCalled();
	}));
	it('Should billApiHitForAllRecords When Subscribe Unsuccessfull', fakeAsync(() => {
		comp.currentBill.id = 1;
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: false, result: { data: [{ id: 1 }] } }).pipe(delay(1)),
		);
		comp.billApiHitForAllRecords();
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
	}));
	it('Should billListingRefreshOnPaymentAdd Test', () => {
		spyOn(comp, 'billApiHitForAllRecords');
		comp.billListingRefreshOnPaymentAdd(true);
		expect(comp.billApiHitForAllRecords).toHaveBeenCalled();
	});

	it('Should getLinkwithAuthToken Test If Token true', () => {
		spyOn(comp['storageData'], 'getToken').and.returnValue(true);
		let result = comp.getLinkwithAuthToken('link');
		expect(result).toMatch('link&token=true');
	});
	it('Should getLinkwithAuthToken Test If Token false', () => {
		spyOn(comp['storageData'], 'getToken').and.returnValue(false);
		let result = comp.getLinkwithAuthToken('link');
		expect(result).toMatch('link');
	});
	it('Should generteEnvelope When Subscribe successfull', fakeAsync(() => {
		spyOn(window, 'open');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of('Bill').pipe(delay(1)));
		comp.generteEnvelope({ bill_ids: [10] });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(window.open).toHaveBeenCalled();
	}));
	it('Should genertePom Function Test In Which a toaster will display Error If Facility,Speciality doctor ids does not same', () => {
		spyOn(comp['toastrService'], 'error');
		let result = comp.genertePom(null, [10, 45], [21, 56], [11, 41]);
		expect(result).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should genertePom Function Test In Which a requestService send responce successfull If Facility,Speciality doctor ids same and will verify After RequestService send Succesffull responce then tests all function and porpeties values.', fakeAsync(() => {
		spyOn(comp['billSelection'], 'clear');
		spyOn(comp, 'setpage');
		spyOn(window, 'open');
		spyOn(comp, 'getLinkwithAuthToken');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(billistingGetMockValues.genertePomResp).pipe(delay(1)),
		);
		comp.genertePom({ facility_id: 1, is_packet: 2 }, [10, 10], [56, 56], [11, 11]);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setpage).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalled();
		expect(comp.getLinkwithAuthToken).toHaveBeenCalled();
		expect(comp['billSelection'].clear).toHaveBeenCalled();
	}));
	it('Should genertePom Function Test In Which a requestService send responce UnSuccessfull and will verify When Request Service reponce UnSuccessfull then only the loadSpin variable will checked which should be false.', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError('Error')
		);
		comp.genertePom({ facility_id: 1, is_packet: 2 }, [10, 10], [56, 56], [11, 11]);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should genertePacket Function Test In Which a toaster will display Error If Facility,Speciality doctor ids does not same', () => {
		spyOn(comp['toastrService'], 'error');
		let result = comp.genertePacket(null, [10, 45], [21, 56], [11, 41],[21,32],'speciliaty_name');
		expect(result).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should genertePacket Function Test In Which a requestService send responce successfull with false and If Facility,Speciality doctor ids same and will verify After RequestService send Succesffull responce then tests all function and porpeties values.', fakeAsync(() => {
		spyOn(comp, 'packetGeneration');
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(false));
		comp.genertePacket({speciality_id:[],speciality_name:[],bill_status_id:[],facility_id:[],case_type_ids:[],recipients:[],is_cover_sheet:2}, [10, 10], [21, 21], [11, 11],[32,32],['speciliaty_name']);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(true);
		expect(comp.packetGeneration).toHaveBeenCalled();
	}));
	it('Should genertePacket Function Test In Which a requestService send responce successfull with true and If Facility,Speciality doctor ids same and will verify After RequestService send Succesffull responce then tests all function and porpeties values.', fakeAsync(() => {
		spyOn(comp, 'packetGeneration');
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		comp.genertePacket({speciality_id:[],speciality_name:[],bill_status_id:[],facility_id:[],case_type_ids:[],recipients:[],is_cover_sheet:2}, [10, 10], [21, 21], [11, 11],[32,32],['speciliaty_name']);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(true);
		expect(comp.packetGeneration).toHaveBeenCalled();
	}));
	it('Should genertePacket Function Test In Which a requestService send responce successfull But No True Or False and If Facility,Speciality doctor ids same and will verify After RequestService send Succesffull responce then tests all function and porpeties values.', fakeAsync(() => {
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(null));
		comp.genertePacket({speciality_id:[],speciality_name:[],bill_status_id:[],facility_id:[],case_type_ids:[],recipients:[],is_cover_sheet:2}, [10, 10], [21, 21], [11, 11],[32,32],['speciliaty_name']);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
