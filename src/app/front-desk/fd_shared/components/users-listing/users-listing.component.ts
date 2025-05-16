import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Location } from '@angular/common';
import {
	ChangeDetectorRef,
	Component,
	OnChanges,
	OnDestroy,
	OnInit,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import {
	ActivatedRoute,
	Router,
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import {
	UserRolesUrlsEnum,
} from '@appDir/front-desk/masters/master-users/user-roles/UserRoles-Urls-Enum';
import { UsersUrlsEnum, UsersChangeStatusEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { Logger } from '@nsalaun/ng-logger';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { FDServices } from '../../services/fd-services.service';

import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { CommonFunctionService } from '../../services/datePipe-format.service';
import { UserFilterModel } from '../../models/userFilterModel';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
	selector: 'app-users-listing',
	templateUrl: './users-listing.component.html',
	styleUrls: ['./users-listing.component.scss']
})
export class UsersListingComponent
	extends PermissionComponent
	implements OnChanges, OnDestroy, OnInit {

	environment= environment;
	isCollapsed:boolean= false;
	subscription: Subscription[] = [];
	@ViewChild(DatatableComponent) table: DatatableComponent;
	@ViewChildren('slideToggle') slideToggle :any
	selection = new SelectionModel<Element>(true, []);
	public selectedRowsString: string;
	userRows: any[];
	roles: any = [];
	filteredData = [];
	public loadSpin: boolean = false;
	// @Input() rows: any[];
	// @Output() getUsers = new EventEmitter();
	filterForm: FormGroup;
	public capabilities: any;
	searchForm: FormGroup;
	limitPerPage = 10;
	count = 0;
	page: Page;
	public users: any = [];
	id: number;
	epcsValue:string;
	epcsStatus:any;
	epcsStatusData:any=[];
	epcsStatusDataTemp:any=[];
	userId:any;
	epcsTooltipData:string;
	//spi history
	hid: number;
  	public spiHistory: any = [];
  	limitPerPageHistory = 10;
	hcount = 0;
	hpage: Page;

	@ViewChild('contentSpi') private contentSpi: any;
	//
	selectedRole: string = 'All Roles';
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('usersList') usersListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	userListingTable: any;

	constructor(
		aclService: AclService,
		private fb: FormBuilder,
		private logger: Logger,
		private fd_servies: FDServices,
		private toastrService: ToastrService,
		private route: ActivatedRoute,
		requestService: RequestService,
		titleService: Title,
		private customDiallogService: CustomDiallogService,
		router: Router,
		private location: Location,
		public datePipeService:DatePipeFormatService,
		private authService: AuthService, protected storageData: StorageData,
		private modalService: NgbModal,
		private localStorage: LocalStorage
	) {
		super(aclService, router, route, requestService, titleService);
		this.subscription.push(
			this.fd_servies.current_UserCapabilities.subscribe((cap) => (this.capabilities = cap)),
		);
		//spi history 
		this.hpage = new Page();
		this.hpage.pageNumber = 1;
		this.hpage.size = 10;
		this.hpage.totalElements=0;
		//
		this.getAllRoles();
		this.filterForm = this.fb.group({
			name: '',
			email: [''],
			role_id: '',
		});
		this.datePipeService.DATE_FORMAT_WITHTIME()
	}

	ngOnChanges() {
		this.logger.log('capability', this.capabilities);
		this.logger.log('user data came', this.users);
		// this.count = this.rows.length;
	}
	ngAfterViewInit() {
		if (this.usersListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.usersListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.userListingTable?.length) {
					let obj = this.userListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.userListingTable?.length) {
				const nameToIndexMap = {};
				this.userListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}
	getEpcsStatusList() {
		let body={
			is_action:1
		}
		this.requestService
			.sendRequest(
				UsersUrlsEnum.get_epcs_status,
				'GET',
				REQUEST_SERVERS.erx_fd_api,
				body
			)
			.subscribe(
				(res1: HttpSuccessResponse) => {
					this.epcsStatus=res1?.result?.data;
					if(this.users && this.users.length > 0){
						for(let i=0;i<this.users.length;i++)
						{	this.epcsStatusDataTemp[i]=this.epcsStatus;
							this.epcsStatusData[i]=this.epcsStatus.filter(e=>e.id==this.users[i].epcs_status_id);
							if(this.users[i].epcs_status_id!=5){
							this.epcsStatusData[i][1]=this.epcsStatusData[i][0].next[0];
							}
							this.epcsStatusData[i].forEach(x => {
								x['epcs_status'] = x?.name;
							})
						}
					}
				},
				(err) => { },
			);
	}
	changeEpcsStatus(event,row)
	{
		// this.epcsStatus=this.epcsStatustemp;
		this.loadSpin=true;
			let body={
				id: row.id,
				slug: event.slug
			}
			this.requestService
				.sendRequest(
					UsersUrlsEnum.updateEpcs,
					'PUT',
					REQUEST_SERVERS.erx_fd_api,
					body
				)
				.subscribe(
					(res1: HttpSuccessResponse) => {
						this.toastrService.success(res1.message,'Success');
						this.loadSpin=false;
						this.prescLogsActionRecords(1,17,row.id);
						this.getFilteredUsers({ offset: this.page.pageNumber - 1 || 0 });
					},
					(err) => { 
						this.getFilteredUsers({ offset: this.page.pageNumber - 1 || 0 });
					},
				);
		

	}
	prescLogsActionRecords(status,action,user_id)
	{
		let tempData = JSON.parse(localStorage.getItem('cm_data'));
				let body = {
					"status_id": status,
					"user_id": tempData.basic_info.id,
					"action_id": action,
					"prescriber_id":user_id
				}
				this.requestService
				.sendRequest(
          		'prescription-events-log',
					'POST',
					REQUEST_SERVERS.erx_api_url,
					body,
				).subscribe(res=>{
					console.log('res',res);
				})
	}

	onLimitChange(event) {
		this.limitPerPage = event.target.value;
	}

	onResetFilters() {
		// this.getUsers.emit();
		this.filterForm.reset();
		// this.filterForm.controls['role_id'].setValue(0);
		this.initFilters();
	}

	onDeleteUser(row) {
		this.logger.log('userid is:', row);
		 //this.subscription.push(

		// 	this.customDiallogService.confirm(,'Yes','No')
		// .then((confirmed) => {

		this.customDiallogService.confirm('Delete User?', 'Do you really want to delete this User.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				if (row.is_doctor === 1) {

					this.customDiallogService.confirm('Appointments',
					`Do you want to reschedule or cancel the appointments 
							 of this user `,'Reschedule Apt.','Cancel Apt.').
							 then((confirmed) => {

								if (confirmed){
									this.deleteUserMethod(row.user_id, confirmed);
								}else if(confirmed === false){
									this.deleteUserMethod(row.user_id, confirmed);
								
								}else{
					
								}
							})
							.catch();
				}
				if (row.is_doctor === 0) {
					this.deleteUserMethod(row.user_id, null);
				}
	
			}else if(confirmed === false){
			
			}else{

			}
		})
		.catch();
			
		// );
	}

	deleteUserMethod(id, answer) {
		this.subscription.push(
			this.fd_servies.deleteUser(id, answer).subscribe(
				(res) => {
					if (res.status) {
						this.subscription.push(
							// this.fd_servies.getUsers()
							this.requestService
								.sendRequest(
									UsersUrlsEnum.UserListing_list_GET,
									'GET',
									REQUEST_SERVERS.fd_api_url,
									{},
								)
								.subscribe(
									(res1: HttpSuccessResponse) => {
										this.users = [...res1.result.data];
										this.filteredData = res1.result.data;
									},
									(err) => {},
								),
						);
					}
				},
				(err) => {
					this.toastrService.error('Please try again! Something went wrong', 'Error');
				},
			),
		);
	}

	stringify(obj) {
		return JSON.stringify(obj);
	}

	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.users.forEach((row) => this.selection.select(row));
	}

	isAllSelected() {
		this.selectedRowsString = JSON.stringify(this.selection.selected);
		const numSelected = this.selection.selected.length;
		const numRows = this.users.length;
		return numSelected === numRows;
	}

	edit(row) {
		// localStorage.setItem('URL_id', row.user_id);
		// console.log(row)
		// this.requestService
		// 	.sendRequest(
		// 		UserListingUrlsEnum.UserListing_list_Update_GET + '?' + row.id,
		// 		'GET',
		// 		REQUEST_SERVERS.fd_api_url,
		// 	)
		// 	.subscribe((response: any) => {});
		// const Id = this.route.snapshot.params['id'];
		// localStorage.setItem('URL_id', Id);
	}

	getAllRoles() {
		this.subscription.push(
			this.requestService
				.sendRequest(UserRolesUrlsEnum.UserRoles_list_GET, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe(
					(res: HttpSuccessResponse) => {
						this.roles = res.result.data;
					},
					(err) => {},
				),
		);
	}

	deleteSelected(row?) {
		// ;
		let ids: any = [];
		let shiftAppointment = false;
		if (row) {
			ids.push(row.user_id);
			if (row['is_doctor'] == 1) {
				docttorFound = true;
			}
		} else {
			var docttorFound = false;
			this.selection.selected.forEach(function (obj) {
				ids.push(obj['user_id']);
				if (obj['is_doctor'] == 1) {
					docttorFound = true;
				}
			});
		}
		if (docttorFound) {
			// this.subscription.push(

			this.customDiallogService.confirm(
				'Appointments',
						`Do you want to reschedule or cancel the appointments 
			of this user `,'Reschedule Apt.','Cancel Apt.')
		.then((confirmed) => {
		
			if (confirmed){
				shiftAppointment = true;
							let requestData = {
								id: ids,
								shiftAppointment: shiftAppointment,
							};
							this.deleteShiftCancel(requestData);
	
			}else if(confirmed === false){
				let requestData = {
					id: ids,
					shiftAppointment: shiftAppointment,
				};
				this.deleteShiftCancel(requestData);
			}else{

			}
		})
		.catch();
				
					
				
			//);
		} else {
			let requestData = {
				id: ids,
				shiftAppointment: shiftAppointment,
			};
			this.deleteShiftCancel(requestData);
		}
	}

	deleteShiftCancel(requestData) {
		this.subscription.push(
			this.fd_servies.deleteUsers(requestData).subscribe(
				(res) => {
					if (res.status == true) {
						this.selection.clear();
						this.getFilteredUsers({ offset: this.page.pageNumber });
						this.toastrService.success('User deleted successfully.', 'Success');
					} else {
						this.toastrService.error(res.message, 'Error');
					}
				},
				(err) => {
					this.toastrService.error(err.statusText, 'Error');
				},
			),
		);
	}

	confirmDel(id?: number) {
		// this.subscription.push(
			this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.deleteSelected(id);
			}else if(confirmed === false){
			
			}else{

			}
		})
		.catch();
	}

	changeUserStatuses(e:MatSlideToggleChange, row: any) {
		// row['status'] = e.checked ? 1 : 0;
		const STATUS_CHECK = (row.status == 0) ? UsersChangeStatusEnum.ACTIVE_STATUS : UsersChangeStatusEnum.INACTIVE_STATUS;
		this.customDiallogService.confirm('Status Change Confirmation?', 'Do you really want to change user status.','Yes','No')
		.then((confirmed) => {	
					if (confirmed) {
						if (row.status != 0) {
							if (row.id) {
								this.requestService
									.sendRequest(
										UsersUrlsEnum.getDoctorAppointments,
										'POST',
										REQUEST_SERVERS.fd_api_url,
										{
											doctor_id: row.id
										},
									)
									.subscribe(
										(res: any) => {
											if (res.result.data.length > 0) {
												debugger
												

this.customDiallogService.confirm(
	'Appointments',
	`Changing the user status to “Inactive” will cancel all appointments of this user. Do you still want to proceed?`,'Cancel Apt.','Close')
.then((confirmed) => {

	if (confirmed){
		var ids : number[] = res.result.data.map(({ id }) => id);
		var aids : number[] = res.result.data.map(({ available_doctor_id }) => available_doctor_id);
		debugger;
		this.ChangeUserStatus(row.id, STATUS_CHECK, true,ids,aids);

	}else if(confirmed === false){
	
	}else{

	}
})
.catch();
}
											else {
												this.ChangeUserStatus(row.id, STATUS_CHECK);
											}
										});
							} else {
								// HARD CODED SET INACTIVE_STATUS FOR FALSE
								this.ChangeUserStatus(row.id, UsersChangeStatusEnum.INACTIVE_STATUS);
							}
						} else {
							this.ChangeUserStatus(row.id, STATUS_CHECK);
						}
					}else{
						console.log(this.slideToggle);
						if(e.checked) {
							this.users.find(res=> res.id == row.id).status = false;
						}
						if(!e.checked) {
							this.users.find(res=> res.id == row.id).status = true;
						}
					}
				});
		
}
	
	// FOR SET THE STATUS OF USER AND CALL FUNCTION (changeUserActStatus)
	ChangeUserStatus(ID : number, USER_STAUS : number, SHIF_APPOINTMENT : boolean = false,ids : number[] = [],aids : number[] = []) {
		debugger
		let requestData = {
			id: ID,  // Integer
			status: USER_STAUS,  // Interger ( 0 or 1 )
			shiftAppointment: SHIF_APPOINTMENT,  // boolean 
			appointment_ids: ids,  // array of ids e.g [123,456,789],
			available_doctor_id: aids //  array of ids e.g [123,456,789],
		};
		this.changeUserActStatus(requestData);
	}
	changeUserActStatus(requestData) {
		debugger;
		console.log('before request');
		console.log(this.users)
		this.subscription.push(
			this.requestService
				.sendRequest(
					UsersUrlsEnum.Update_User_Status_GET,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					requestData,
				)
				.subscribe(
					(res: any) => {
						if (res.status == true) {
							this.selection.clear();
							this.getFilteredUsers({ offset: this.page.pageNumber });
							this.toastrService.success('User status successfully.', 'Success');
						} else {
							// this.toastrService.error(res.message, 'Error');
						}
					},
					(err) => {
						// this.toastrService.error(err.statusText, 'Error');
					},
				),
		);

		// this.subscription.push(
		// 	this.fd_servies.updateUserStatus(requestData).subscribe(
		// 		(res) => {
		// 			if (res.status == true) {
		// 				this.selection.clear();
		// 				this.getFilteredUsers({ offset: this.page.pageNumber });
		// 				this.toastrService.success('User status successfully.', 'Success');
		// 			} else {
		// 				this.toastrService.error(res.message, 'Error');
		// 			}
		// 		},
		// 		(err) => {
		// 			this.toastrService.error(err.statusText, 'Error');
		// 		},
		// 	),
		// );
	}

	initFilters() {
		this.page.pageNumber = 0;
		this.getFilteredUsers({ offset: 0 });
	}

	getFilteredUsers(pageInfo?) {
		this.selection.clear();
		if (pageInfo) {
			this.page.pageNumber = pageInfo.offset;
		}
		let pageNumber = this.page.pageNumber + 1;
		this.loadSpin = true;
		let filters = checkReactiveFormIsEmpty(this.filterForm);
		let queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
			check_dea:1

		};
		let requestData = { ...queryParams, ...filters };
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber };

		this.addUrlQueryParams({ ...filters, ...queryparam });

		this.subscription.push(
			this.requestService
				.sendRequest(
					UsersUrlsEnum.UserListing_list_GET,
					'GET',
					REQUEST_SERVERS.erx_fd_api,
					requestData,
				)
				.subscribe(async(res: HttpSuccessResponse) => {
						this.users = res.result ? res.result.data : [];
						// convert server time into system time
						if(this.users.length) {
							const offsetMinutes = new Date().getTimezoneOffset();
							this.users.map(ele => {
								if(ele?.last_login) {
									const serverStartTime = ele?.last_login;
									const serverStartDate = new Date(serverStartTime);
									const localStartTime = new Date(serverStartDate.getTime() - (offsetMinutes * 60 * 1000));
									ele.last_login = localStartTime.toLocaleString();
								}
							})
						}
						await this.getEpcsStatusList();
						this.page.totalElements = res.result ? res.result.total : 0;
						this.page.totalPages = this.page.totalElements / this.page.size;
						this.loadSpin = false;
					},
					(err) => {
						this.toastrService.error(err.message, 'Error');
						this.loadSpin = false;
					},
				),
		);
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
	}

	pageLimit($num) {
		this.selection.clear();
		this.page.size = Number($num);
		this.getFilteredUsers({ offset: 0 });
		// if (this.cases) this.page.size = Number(num);
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	ngOnInit() {
		const tempData = JSON.parse(localStorage.getItem('cm_data'));
		this.userId = tempData.user_id;
		this.setTitle();
		this.getAllRoles();
		
		this.subscription.push(
			this.route.queryParams.subscribe((params) => {
				const obj = new UserFilterModel(params);
				this.filterForm.patchValue(obj);
				this.page = new Page();
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
			}),
		);
		this.getFilteredUsers({ offset: this.page.pageNumber - 1 || 0 });
		this.userListingTable = this.localStorage.getObject('usersMasterTableList' + this.storageData.getUserId());
	}

	checkInputs() {
		if (isEmptyObject(this.filterForm.value)) {
			return true;
		}
		return false;
	}

	roleChange($event) {
		if ($event && $event.selectedIndex) {
			this.selectedRole = this.roles[$event.selectedIndex - 1].name;
		}
	}

	disbableEpcs(event)
	{
		if(event.dea_exists!=1)
		{
			return true;
		}
		if(this.userId==event.id)
		{
			return true;
		}
		if(event.proofing_status!=1)
		{
			return true;
		}
		return false;
	}
	onEpcsHover(event)
	{
		if(event.dea_exists!=1)
		{
			this.epcsTooltipData="DEA number (Individual/Instituitional ) must exist before changing status";
		}
		else if(this.userId==event.id)
		{
			
			this.epcsTooltipData="You cannot change your epcs status";
		}
		else if(event.proofing_status!=1)
		{
			this.epcsTooltipData="Status can’t be change before id proofing of the user";
		}
		else
		{
			this.epcsTooltipData="";
		}

	
	}


	// spi history
	historyInitFilters() {
		this.hpage.pageNumber = 0;
		this.getFilteredHistory({ offset: 0 });
	}

  getFilteredHistory(pageInfo?) {
		
		if (pageInfo) {
			this.hpage.pageNumber = pageInfo.offset;
		}
		let pageNumber = this.hpage.pageNumber + 1;
		let queryParams = {
			user_id:this.hid,
      order: OrderEnum.ASC,
			per_page: this.hpage.size || 10,
			page: pageNumber,
			pagination: true,
			check_dea:true,
      

		};
		let requestData = { ...queryParams};
		let per_page = this.hpage.size;
    this.requestService
				.sendRequest(
          'spi_history',
					'GET',
					REQUEST_SERVERS.erx_fd_api,
					requestData,
				)
				.subscribe(
					(res: HttpSuccessResponse) => {
						this.spiHistory = res.result ? res.result.data : [];
            console.log("history",this.spiHistory);
						this.hpage.totalElements = res.result ? res.result.total : 0;
						this.hpage.totalPages = this.page.totalElements / this.page.size;
						this.loadSpin = false;
					},
					(err) => {
						this.toastrService.error(err.message, 'Error');
						this.loadSpin = false;
					},
				);
	}
  historyPageLimit($num) {
		this.hpage.size = Number($num);
		this.getFilteredHistory({ offset: 0 });
	}
  historyOnLimitChange(event) {
	this.limitPerPageHistory = event.target.value;
	}
	openModal(id)
	{
		this.hid=id;
		this.historyInitFilters();
		this.modalService.open(this.contentSpi, { windowClass : "myCustomModalClass"}).result.then((result) => {
			if (result == 'Save click') {
			}
		})
	}
	public getRowIndex(row: any): number {
		return this.table.bodyComponent.getRowIndex(row); // row being data object passed into the template
	}

	userHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.columns.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	}
	
	onConfirm(click) {
		if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('usersMasterTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.usersListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.usersListTable._internalColumns.sort(function (a, b) {
			return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

	onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}
	
}
