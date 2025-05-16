import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { Subject } from 'rxjs';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { BillingInsuranceBackendServicesService } from '../../services/billing-insurance-backend-services.service';
import { BillingInsuranceModel, LocationsModel } from '../../models/BillingInsurance.Model';
import { BillingInsuranceDataServiceService } from '../../services/billing-insurance-data-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationEditComponentComponent } from '../location-edit-component/location-edit-component.component';
import { ToastrService } from 'ngx-toastr';
import {
	unSubAllPrevious,
	parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import {
	OrderEnum,
	ParamQuery,
} from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { InsuranceUrlsEnum } from './Insurance-Urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Location, LocationStrategy } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { InsuranceFormComponent } from '../insurance-form/insurance-form.component';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
@Component({
	selector: 'app-insurance',
	templateUrl: './insurance.component.html',
	styleUrls: ['./insurance.component.scss'],
})
export class InsuranceComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	InsuranceShown: boolean = true;
	planNameShown: boolean = true;
	planTypeShown: boolean = true;
	loadSpin: boolean = false;
	currentTab = 'insurance';
	isCollapsed = false;
	lstInsurance: Array<BillingInsuranceModel> = [];
	insuranceData: [] = [];
	errorMessage: string;
	showform: boolean = false;
	hideAddButton: boolean = true;
	totalRows: number;
	sendPagination: any;
	EnumApiPath = EnumApiPath;
	requestServerpath = REQUEST_SERVERS;
	eventsSubject: Subject<any> = new Subject<any>();
	page: Page;
	queryParams: ParamQuery;
	hideShowUpdateInsuranceButton: boolean = false;
	selection = new SelectionModel<Element>(true, []);
	result = 'No data to display';
	planSelection = new SelectionModel<Element>(true, []); // for plan name selection
	primaryLocation: boolean = false;
	delMultiple: number;
	locationForm: FormGroup;
	modalRef: NgbModalRef;
	refresh: Subject<any> = new Subject();
	searchForm: FormGroup;
	exchangeData: any[] = [];
	searchPlanType: FormGroup;
	searchedRequestData: any[] = [];
	public id: any;
	insuranceFilterForm: FormGroup;
	insForm: FormGroup;
	insIndex: any;
	addbool: any;
	showAddbool: any;

	rows = [
		{ name: 'Austin', gender: 'Male', company: 'Swimlane' },
		{ name: 'Dany', gender: 'Male', company: 'KFC' },
		{ name: 'Molly', gender: 'Female', company: 'Burger King' },
	];
	columns = [
		// { prop: 'name' },
		// { name: 'Insurance Name' },
		// { name: 'Code' },
		// {name: 'Contact Person Name'},
		// {name: 'Phone Number'},
		// {name: 'Actions'}
	];

	form: FormGroup; // for insurance
	editForm: FormGroup; // for insurance


	@ViewChild('insu1') ChildInsuranceFormComponent: InsuranceFormComponent;
	constructor(
		private fdService: FDServices,
		aclService: AclService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		public datePipeService: DatePipeFormatService,
		private http: HttpService,
		private insuranceService: BillingInsuranceBackendServicesService,
		private insuranceDataService: BillingInsuranceDataServiceService,
		router: Router,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		private location: Location,
		private locationStratgy: LocationStrategy,
		titleService: Title,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		private _scrollToService: ScrollToService,
		private customDiallogService : CustomDiallogService
	) {

		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}

	public triggerScrollTo(target) {
		const config: ScrollToConfigOptions = {
			// container: 'ngx-scroll-to',
			target: target,
			duration: 200,
			easing: 'easeOutElastic',
			offset: 0
		};
		setTimeout(() => {
			this._scrollToService.scrollTo(config);
		}, 100);
	}
	getDefaultParams(object?) {
		return {
			filter: false,
			order: OrderEnum.ASC,
			per_page: 20,
			page: 1,
			pagination: true,
			...object,
		};
	}
	getAllInsurances() {
		this.subscription.push(
			this.insuranceService.getBillingInsurance(this.queryParams).subscribe(
				(data) => {
					this.lstInsurance = data['data'].docs;
				},
				(err) => {
					const str = parseHttpErrorResponseObject(err.error.message);
					this.toaster.error(str);
				},
			),
		);
	}
	selectionOnValueChange(e: any, Type?) {
		if (e && e.data) {
		 this.insuranceFilterForm.controls[Type].setValue(e.formValue);
		} else {
		  this.insuranceFilterForm.controls[Type].setValue(null)
		}
	  }
	ngOnInit() {
		this.addbool = false;
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.initInsuranceFilterForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.insuranceFilterForm.patchValue(params);
				this.page.size = parseInt(params.per_page) || 10;
				// alert(this.page.pageNumber+ '22');
				this.page.pageNumber = parseInt(params.page) || 1;
				// this.page.pageNumber = 1;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.initLocationForm();
		// ceate form of insurance starts here
		this.form = this.fb.group({
			insurance_name: ['', [Validators.required]],
			insurance_code: ['', [Validators.required]],
		}); // create form of insurance ends here

		// edit form insurance starts here
		this.editForm = this.fb.group({
			id: [''],
			insurance_name: ['', [Validators.required]],
			insurance_code: ['', [Validators.required]],

		}); // edit form of insurance

	}
	initLocationForm() {
		this.locationForm = this.fb.group({
			location_name: ['', Validators.required],
			street_address: [''],
			apartment_suite: [''],
			city: [''],
			state: [''],
			zip: [''],
			contact_person_firstName: [''],
			contact_person_middleName: [''],
			contact_person_lastName: [''],
			contact_person_phone_no: [''],
			contact_person_ext: ['', Validators.maxLength(6)],
			contact_person_cell_number: [''],
			contact_person_fax: [''],
			contact_person_email: ['', [Validators.email]],
			comments: [''],
			is_main_location: [''],
			location_code: ['']

		});
	}
	// ngOninit ends here
	onCloseLocationModal() {
		this.locationForm.reset();
		this.modalRef.close();
	}

	resetModel() {
		this.modalRef.close();
		this.page.pageNumber = 0;
	}

	// insurancePlus() {
	// 	this.InsuranceShown = !this.InsuranceShown;
	// }
	// insuranceMinus() {
	// 	this.InsuranceShown = !this.InsuranceShown;
	// }

	planNamePlus() {
		this.planNameShown = !this.planNameShown;
	}

	planNameMinus() {
		this.planNameShown = !this.planNameShown;
	}

	planTypePlus() {
		this.planTypeShown = !this.planTypeShown;
	}

	planTypeMinus() {
		this.planTypeShown = !this.planTypeShown;
	}

	insuranceOpenModal(addInsurance) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size:'xl',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.modalRef = this.modalService.open(addInsurance, ngbModalOptions);
	}

	isAllSelected() {
		this.totalRows = this.insuranceData.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: // this.patientRows.slice(0, this.totalRows).forEach(row => this.selection.select(row));
			this.insuranceData.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}
	onSubmit(form) {
		if (this.form.valid) {
			this.subscription.push(
				this.fdService.createInsurance(form).subscribe(
					(response) => {
						if (response.status === 200) {
							this.selection.clear();
							this.setPage({ offset: 0 });
						}
					},
					(err) => {
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toaster.error(str);
					},
				),
			);
			this.form.reset();
			this.modalRef.close();
		}
		this.form.reset();
	}

	deleteOneInsuranceRecord(row: any) {

		this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete it?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			// const index;
			this.fdService.deleteInsuranceRecordById(row).subscribe(
				// (data: void) => {
				//   index = this.insuranceData.findIndex(me => me.id == row.id)
				//   this.insuranceData.splice(index, 1),
				//     (err: any) => console.log(err + "err")
				// }
				(response) => {
					if (response.status === 200) {
						this.selection.clear();
						this.setPage({ offset: this.page.pageNumber });
					}
				},
				(err) => {
					const str = parseHttpErrorResponseObject(err.error.message);
					this.toaster.error(str);
				},
			);
			}
		})
		.catch();
	}
	deleteMultipleInsurance() {
		this.loadSpin = true;
		const selected = this.selection.selected;
		const arr: any = [];
		for (let p = 0; p < selected.length; p++) {
			arr[p] = selected[p].id;
		}

		this.customDiallogService.confirm('Delete Confirmation?', 'You want to delete all records','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.fdService.deleteInsuranceMultiplerecord(arr).subscribe(
					(response) => {
						if (response.status === 200) {
							this.setPage({ offset: this.page.pageNumber });
							this.selection.clear();
							this.loadSpin = false;
						}
					},
					(err) => {
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toaster.error(str);
					},
				);
			}
		})
		.catch();
	}
	pageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}
	setPage(pageInfo, extendreord?) {
		if (extendreord) { this.insIndex = null }
		this.allInsuranceChecked = false;
		this.selection.clear();
	
		this.page.pageNumber = pageInfo.offset;						
		const pageNumber = this.page.pageNumber + 1;
		// this.page.pageNumber = 1;
		this.page.pageNumber = pageNumber;
		// alert(this.page.pageNumber + '33');
		const filters = checkReactiveFormIsEmpty(this.insuranceFilterForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
			order_by: "insurance_name"
		};
	
		let insurance_name = this.insuranceFilterForm.value.insurance_name;
		let insurance_code = this.insuranceFilterForm.value.insurance_code;
		let email = this.insuranceFilterForm.value.email;
		let fax = this.insuranceFilterForm.value.fax;
		let phone_no = this.insuranceFilterForm.value.phone_no;
		let location_name = this.insuranceFilterForm.value.location_name;
		let per_page = this.page.size;
		let queryParams = { insurance_name, insurance_code, email, phone_no, fax, location_name, per_page, page: pageNumber, }
		this.addUrlQueryParams(queryParams);
	
		this.displayUpdated({ ...this.queryParams, ...filters });
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	displayUpdated(queryParams) {
		// for insurance
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					InsuranceUrlsEnum.Insurance_list_GET,
					'GET',
					REQUEST_SERVERS.billing_api_url,
					queryParams,
				)
				.subscribe(
					(resp: any) => {
						this.loadSpin = false;
						this.lstInsurance =
							resp && resp['result'] && resp['result']['data'] ? resp['result']['data'] : [];
						this.page.totalElements =
							resp && resp['result'] && resp['result']['total'] ? resp['result']['total'] : 0;
						//to extend locations of insurance
						if (this.insIndex || this.insIndex == 0) {
							this.toggleInsuranceCardDetail(this.insIndex);
						}
						//to extend new record
						// else if (this.addbool) {
						// 	this.toggleInsuranceCardDetail(0);
						// }
					},
					(err) => {
						this.loadSpin = false;
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toaster.error(str);
					},
				),
		);
	}
	stringfy(obj) {
		return JSON.stringify(obj);
	}
	/**
	 * extend single record
	 * @param index 
	 */
	toggleInsuranceCardDetail(index) {
		// var that = this;

		if (!this.lstInsurance[index]['isOpen']) {
			//setTimeout(function () {
			this.lstInsurance[index]['isOpen'] = true;
			//}, 50);
		} else {
			this.lstInsurance[index]['isOpen'] = false;
		}
	}

	selectInsurance(insurance) {
		if (!insurance['isSelected']) {
			insurance['isSelected'] = true;
		} else {
			insurance['isSelected'] = false;
		}
		this.allInsuranceChecked = false;
		var arr = this.lstInsurance.filter((insurance) => {
			if (insurance['isSelected']) {
				return insurance;
			}
		});
		if (arr.length == this.lstInsurance.length) {
			this.allInsuranceChecked = true;
		}
	}

	getSelectedInsurances() {
		var arr = this.lstInsurance.filter((insurance) => {
			if (insurance['isSelected']) {
				return insurance;
			}
		});

		return arr;
	}
	deleteInsurance(insurance) {
		this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.insuranceService.deleteBullingInsurance(insurance.id).subscribe(
					(data) => {
						if (data['status'] == 200) {
							var index = this.lstInsurance.findIndex((_insurance) => {
								return _insurance.id == insurance.id;
							});
							this.lstInsurance.splice(index, 1);
							this.toaster.success(data['message']);
						}
					},
					(err) => {
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toaster.error(str);
					},
				);	
			}
		})
		.catch();
	}
	allInsuranceChecked: boolean = false;
	checkAllInsurance($event) {
		this.lstInsurance.map((insurance) => {
			insurance['isSelected'] = $event.checked;
		});
		this.allInsuranceChecked = $event.checked;
	}

	deleteMultipleInsurances() {
		var lstIds = [];

		this.customDiallogService.confirm('Are you sure?', 'Are you sure you want to delete these insurances','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.lstInsurance.forEach((insurance) => {
					if (insurance['isSelected']) {
						lstIds.push(insurance['id']);
					}
				});
				if (lstIds.length == 0) {
					return 0;
				}
				this.insuranceService.deleteMultipleBillingInsurance(lstIds).subscribe(
					(data) => {
						if (data['status'] == 200) {
							this.lstInsurance = this.lstInsurance.filter((insurance) => {
								return !lstIds.includes(insurance.id);
							});
							this.toaster.success(data['message']);
						}
					},
					(err) => {
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toaster.error(str);
					},
				);
			}
		})
		.catch();
	
	}

	initInsuranceFilterForm() {
		this.insuranceFilterForm = this.fb.group({
			insurance_name: ['', [Validators.required]],
			insurance_code: ['', [Validators.required]],
			email: ['', [Validators.required]],
			phone_no: ['', [Validators.required]],
			fax: ['', [Validators.required]],
			location_name: ['', [Validators.required]],
			clearing_house_ids: [[]],
			payer_ids: [[]]
		});
	}
	resetInsuranceFilterForm() {
		this.addbool = null;
		this.insIndex = null;
		this.closeAlltoggle();
		this.addUrlQueryParams();
		this.insuranceFilterForm.reset();
		this.insuranceFilterForm.markAsTouched();
		this.setPage({ offset: 0 });
		this.eventsSubject.next(true);
	}
	submitInsuranceFilterForm() {
		var queryParams = this.getDefaultParams() as ParamQuery;
		queryParams.filter = true;
		this.subscription.push(
			this.insuranceService
				.getBillingInsurance({ ...queryParams, ...this.insuranceFilterForm.value })
				.subscribe(
					(data) => {
						this.lstInsurance = data['data'].docs;
					},
					(err) => {
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toaster.error(str);
					},
				),
		);
	}
	getInsuranceWithoutMainLocation(insurance: BillingInsuranceModel) {
		return insurance.insurance_locations;
	}
	deleteMultipleLocations(insurance: BillingInsuranceModel) {

		this.customDiallogService.confirm('Are you sure', 'Are you sure you want to delete these locations?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				insurance.insurance_locations = insurance.insurance_locations.filter((location) => {
					if (location['isChecked']) {
					} else {
						return location;
					}
				});
				this.insuranceService.updateInsurance(insurance).subscribe((data) => {
				});
			}
		})
		.catch();
	}
	deleteLocations(insurance: BillingInsuranceModel, locationIndex) {

		this.customDiallogService.confirm('Are you sure?', 'Are you sure you want to delete this location?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				insurance.insurance_locations.splice(locationIndex, 1);
				this.insuranceService.updateInsurance(insurance).subscribe((data) => {
				});
			}
		})
		.catch();
	}
	checkInsuranceAllLocation(insurance: BillingInsuranceModel, event) {
		insurance.insurance_locations.map((location, index) => {
			// if (location.is_main_location) {
			// 	return;
			// }
			location['isChecked'] = event.checked;
		});
	}
	setInsurancePageLimit(insurance, event) {
		insurance['pageLimit'] = Number(event.target.value);
	}

	insurancePageLimit($num, $event) {
		this.page.pageNumber = 0
		this.page.totalElements = 0;
		this.page.totalPages = 0;
		this.page.size = Number($num);
		this.selection.clear();
		// this.setPage({ offset: 0 });
		this.pageChanged($event, 'insurance')
	}
	checkLocation(location: LocationsModel, event) {
		location['isChecked'] = event.checked;
	}
	getCheckedLocationsFromInsurance(index) {
		return this.lstInsurance[index].insurance_locations.filter((location) => {
			if (location['isChecked']) {
				return location;
			}

		});
	}
	editLocation(location, insurance, insuranseIndex?,hideShowUpdateInsurance?) {
		this.insIndex = insuranseIndex;
		this.hideShowUpdateInsuranceButton = hideShowUpdateInsurance;
	
		console.log(this.insIndex);
		var modalRef = this.modalService.open(LocationEditComponentComponent, {
			size: 'xl',
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll',
		});

		modalRef.componentInstance.insurance = insurance;
	
		if (location) {
			modalRef && modalRef.componentInstance? modalRef.componentInstance.hideShowUpdateInsuranceButton = this.hideShowUpdateInsuranceButton:null;
			modalRef.componentInstance.location = location;
		}

		modalRef.result
			.then((result) => {
				this.setPage({ offset: this.page.pageNumber-1 });
			})
			.catch((error) => {
				console.error(error);
			});
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	pageChanged(event, param?) {
		this.selection.clear();
		if (param == 'insurance') {
			this.setPage({ offset: 0 },true);
			// this.page.pageNumber = 1;
			// alert(this.page.pageNumber + '11');
		} else {
			event.itemsPerPage = this.page.size;
			this.setPage({ offset: event.page - 1 });
		}

	}
	/**
	 * popup in case of any change in form
	 * @param insurance 
	 * @param index 
	 */
	updateInsurance(insurance: BillingInsuranceModel, index?) {
		this.hideAddButton = true;
		this.addbool = false;
		this.insIndex = index;
		if (this.showform) {
			let childdata = this;
			this.insForm = childdata.ChildInsuranceFormComponent.insuranceForm;
			if (this.insForm.dirty && this.insForm.touched) {
				this.CanDeactivateModelComponentService.canDeactivate().then(res => {
					if (res) {
						this.forUpdateChanges(insurance, index);
					}
					else {
						return true;
					}
				});
			}
			else {
				this.forUpdateChanges(insurance, index);
			}
		}
		else {
			this.forUpdateChanges(insurance, index);
		}
		//this.router.navigate(['/front-desk/masters/billing/insurance/edit']);
		// this.router.navigate([`front-desk/masters/billing/insurance/edit/${this.id}`]);
	}
	/**
	 * setup to update Insurance record
	 */
	forUpdateChanges(insurance, index?) {
		this.id = insurance ? insurance.id : null;
		this.insuranceDataService.setBillingInsurance(insurance);
		if (!this.showform) {
			this.showform = true;
		}
		this.closeAlltoggle()
		// this.toggleInsuranceCardDetail(index);
	}
	/**
	 * close all extended records
	 */
	closeAlltoggle() {
		this.lstInsurance.forEach(element => {
			element['isOpen'] = false;
		});
	}
	/**
	 * popup in case of any change for Add form
	 */
	addInsuranceModal() {
		this.hideAddButton = false;
		this.insIndex = null;

		if (this.showform) {
			let childdata = this;
			this.insForm = childdata.ChildInsuranceFormComponent.insuranceForm;
			if (this.insForm.dirty && this.insForm.touched) {
				this.CanDeactivateModelComponentService.canDeactivate().then(res => {
					if (res) {
						this.forAddChanges();
					}
					else { return true; }
				});
			}
			else {
				this.forAddChanges();
			}
		}
		else {
			this.forAddChanges();
		}
	}
	/**
	 * setup to add new Record for insurance
	 */
	forAddChanges() {

		this.hideAddButton = false;
		this.id = null;
		this.closeAlltoggle();
		if (this.showform) {
			this.showform = !this.showform;
			setTimeout(() => {
				this.showform = !this.showform;
			}, 100);
		}
		else { this.showform = !this.showform; }
	}
	/**
	 * when location is added or updated form child component
	 * @param $event 
	 */
	getDataFromChild($event) {
		if ($event) { this.addbool = true; this.insIndex = null }
		this.hideAddButton = true;
		this.showform = false;
		//this.insIndex = null;
		this.closeAlltoggle();
		this.insuranceFilterForm.reset()
		this.setPage({ offset: this.page.pageNumber ?  (this.page.pageNumber - 1) : 0 });
	}
	/**
	 * to check the child form changes
	 */
	ngAfterViewInit() {
		if (this.showform) {
			this.insForm = this.ChildInsuranceFormComponent.insuranceForm;
		}
	}

	checkInputs(){
		if (isEmptyObject(this.insuranceFilterForm.value)) {
			return true;
		  }
		  return false;
	}

	insuranceHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}

}
