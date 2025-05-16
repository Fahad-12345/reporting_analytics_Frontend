import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';
import { SelectionModel } from '@angular/cdk/collections';
import { RequestService } from '@appDir/shared/services/request.service';
import { Subscription } from 'rxjs';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AclService } from '@appDir/shared/services/acl.service';
import { Location } from '../../utils/practice.class';
import { getObjectChildValue, stdTimezoneOffset } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { environment } from 'environments/environment';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';
import { PracticeService } from '../../services/practice.service';
import { ToastrService } from 'ngx-toastr';
import { changeDateFormat} from '@appDir/shared/utils/utils.helpers';

import { AppointmentCancelCommentModel } from '@appDir/scheduler-front-desk/modules/assign-speciality/modals/accordian/appoinment-cancel-comment-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
@Component({
	selector: 'app-practice-location-table-component',
	templateUrl: './practice-location-table-component.component.html',
	styleUrls: ['./practice-location-table-component.component.scss']
})
export class PracticeLocationTableComponentComponent extends PermissionComponent implements OnInit {

	environment= environment;
	facilityAppointmentPage:Page;
	paramsStored:any={};
	facilityAppointmentsData = []
	isAppointments=false;
	myForm: FormGroup;
	defaultComments: AppointmentCancelCommentModel[]=[];
	isOtherChecked = false;
	comments: any;
	currentrow:any={};
	@Output() practiceLocationUpdated = new EventEmitter<void>();
	filteredArray: any[] = [];
	updateLocation: any;

	constructor(
		private customDiallogService : CustomDiallogService,
		aclService: AclService,
		protected requestService: RequestService,
		protected practiceService: PracticeService,
		private formBuilder: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		public datePipeService : DatePipeFormatService
	) {
		super(aclService);
		this.practiceLocationpage=new Page();
		this.practiceLocationpage.pageNumber=0;
		this.practiceLocationpage.size=10;
		this.practiceLocationpage.totalElements=0;
		this.facilityAppointmentPage=new Page();
		this.facilityAppointmentPage.pageNumber=0;
		this.facilityAppointmentPage.size=10;
	
		
	}
	@Input() practiceId: number = null;
	@Input() mainFacility: any = {};
	@Input() dropDownRegion = [];
	@Input() practiceLocations :any = {
		data: [] as Location[],
		total: 0 as number
	};
	@Input() options = { openModal: false, hideAddLocation: false };
	@Input() page: Page;
	@Input() mainPracticeStatus:boolean=false;
	@Output() onEditLocation: EventEmitter<any> = new EventEmitter()
	@Output() onDeleteLocation: EventEmitter<any> = new EventEmitter()
	@Output() onAddLocation: EventEmitter<any> = new EventEmitter()
	@Output() onPageChange: EventEmitter<Page> = new EventEmitter<Page>()
	@Output() updateListing: EventEmitter<any> = new EventEmitter<any>()
	@Output() updateFacilityStatus =  new EventEmitter<any>();
	@ViewChild('practiceLocationAdd') practiceLocationAdd;
	 practiceLocationpage: Page;
	selection = new SelectionModel<Location>(true, []);
	OffsetNum = 0;
	// page: Page = new Page()
	subscription: Subscription[] = [];
	submitText = ''
	public modalRef: NgbModalRef;
	public modalRefChangeStatus: NgbModalRef;
	public locationData = {};
	index: number = null;
	

	ngOnInit() {
		
		// this.page.pageNumber = 0
		// this.page.size = 10
		this.createForm();
	}

	update(event){
		this.updateFacilityStatus.emit(event)
	}

	getAppointmentInfo() {
		this.startLoader = true;
    let queryParams={};
    queryParams['paginate']= true;
    queryParams['page']=this.facilityAppointmentPage.pageNumber;
    queryParams['per_page']=this.facilityAppointmentPage.size;
    queryParams['id']=this.paramsStored.id;
    let currentData=new Date();
    queryParams['current_date']=changeDateFormat(currentData);

    if(this.paramsStored.is_parent){
      queryParams['main_facility']=true;
    }else{
      queryParams['main_facility']=false;
    }
    this.subscription.push(
      this.practiceService.facilityLocationsAppointments(queryParams)
        .subscribe(
          (resp) => {
            if(resp?.status){
              this.startLoader=false;
               this.facilityAppointmentsData=(resp.result.data && resp.result.data.docs)?resp.result.data.docs:[] ;
            }
          },
          (err) => { 
            this.startLoader=false;
           },
        ),
    );
	}

	onPageChangeNew(pageInfo) {
		this.facilityAppointmentPage.offset = pageInfo.offset;
		this.facilityAppointmentPage.pageNumber = pageInfo.offset + 1;
        this.getAppointmentInfo();
	}
	pageLimitAppointment($event) {
		this.facilityAppointmentPage.offset = 0;
		this.facilityAppointmentPage.size = Number($event);
		this.facilityAppointmentPage.pageNumber = 1;
		this.getAppointmentInfo();
	}
	onCancelAppointmentAndAssigments(){
		let commentsValue: any = this.myForm.getRawValue();
		this.comments = commentsValue.defaultComments === 'Other' ? commentsValue.otherComments : commentsValue.defaultComments;
		this.comments = this.comments || 'N/A';
		let currentData=new Date();
		let req = { 
			'main_facility': false,
			'cancelled_comments': this.comments,
			'id':this.paramsStored.id,
			'current_date':changeDateFormat(currentData),
			'time_zone': stdTimezoneOffset()
		};
		this.updateLocation.length ? req['current_facility_timing'] = this.filteredArray : '';
		this.startLoader=true;
		this.subscription.push(
		  this.practiceService.CancelAppointmentAndAssigments(req)
			.subscribe(
			  (resp) => {
				if(resp?.status){
					this.startLoader=false;
					this.toastrService.success('All Appointments/Assignments cancelled Successfully!', 'Success')
					this.modalRefChangeStatus.close();
					if(this.modalRef) {
						this.practiceLocationUpdated.emit();
					}
					else {
						this.subscription.push(
							this.practiceService.facilityStatus(this.paramsStored).subscribe((resp) => {
									if (resp?.status) {
										this.startLoader = false;
									}
							},
						));
					}
				}
			  },
			  (err) => {
				  this.startLoader=false;
				  this.crossCancel();
				  this.modalRef.close();
			  },
			),
		);
	  
	  }

	public fullAddress(row): string {
		return ((row.address) ? (row.floor ? `${row.address} ${row.floor}` : `${row.address}`) : row.floor) || 'N/A';
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		if (!this.practiceId) {
			this.practiceLocations.total = this.practiceLocations.data.length;
		}
		if (simpleChanges.options && simpleChanges.options.currentValue.openModal) {
			setTimeout(() => this.openModal(this.practiceLocationAdd), 300)

		}
		// this.page.totalElements = getObjectChildValue(this.practiceLocations, 0, ['total']);
		this.practiceLocationpage.totalElements = getObjectChildValue(this.practiceLocations, 0, ['total']);
	}
	

	/**
   * Toggle All Locations
   *
   * @param	void 
   * @return	void
   */
	
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.practiceLocations.data.forEach((row) => this.selection.select(row));
	}

	
	private createForm() {
		this.myForm = this.formBuilder.group({
		  defaultComments: ['',[Validators.required]],
		  otherComments: '',
		});
	  }
	

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.practiceLocations.data.length;
		return numSelected === numRows;
	}
	/**
   * Triggers when page limit is changed. Emits an Output event 
   *
   * @param	{number} limit 
   * @return	void
   */
	onPageLimitChange(eventVal) {
		// this.page.size = eventVal;
		// this.page.pageNumber = 0;
		// // this.OffsetNum = 0;
		// this.page.offset=0;
		// // this.OffsetNum = 0;
		// this.onPageChange.emit(this.page);

		this.practiceLocationpage.size = eventVal;
		this.practiceLocationpage.pageNumber = 0;
		// this.OffsetNum = 0;
		this.practiceLocationpage.offset=0;
		// this.OffsetNum = 0;
		this.onPageChange.emit(this.practiceLocationpage);
	}

	/**
  * Triggers when page number is changed. Emits an Output event 
  *
  * @param	{number} limit 
  * @return	void
  */
	onPageNumberChange({ offset }) {
		// // if(offset == 0) {
		// 	this.page.pageNumber =offset + 1;
		// 	// this.OffsetNum = offset;
		// 	this.page.offset= offset;
		// // } else {
		// 	// this.page.pageNumber =offset;
		// // }
		
		// this.onPageChange.emit(this.page)
				this.practiceLocationpage.pageNumber =offset + 1;
				this.practiceLocationpage.offset= offset;			
			this.onPageChange.emit(this.practiceLocationpage)
	}
	viewLocation(practiceLocationEdit, row, rowIndex) {
		if (!this.practiceId) {
			this.index = rowIndex;
		}


		this.locationData = row;
		this.locationData['ActionType'] = 'View';
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'lg',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(practiceLocationEdit, ngbModalOptions);
		// 	[id]="id" (closeModal)="closeModal($event)" [locationData]="locationData"
		// [dropDownRegion]="dropDownRegion"

	}

	getAppointmensComments(){
		this.defaultComments=[];
		this.isOtherChecked = false;
		this.subscription.push(
		  this.practiceService.getAppointmensComments()
			.subscribe(
			  (res) => {
				if(res?.status){
				  this.startLoader=false;
				  const appointments = this.practiceService.appointmentsCommentsSelection(res?.result?.data);
				  this.myForm.get('defaultComments').setValue(appointments?.selectAppointmentName || '');
				  this.defaultComments = appointments?.selectedAppointment || [];    
		  		}
			  },
			  (err) => {
				this.startLoader = false;
			  }
			),
		);
	  }

	  timeConversion(time) {
		return convertDateTimeForRetrieving(null, new Date(time));
	}
	crossCancel(){
		this.practiceLocations.data=this.practiceLocations?.data?.map(location => {
			if (location.id == this.currentrow.id) {
			   location.is_active = 1; // Set is_active to false for the matching location
			}
			return location;
		});
		this.modalRefChangeStatus ? this.modalRefChangeStatus.close() : '';
	}

	ChangeFacilityStatus(queryParams){
		this.subscription.push(
			this.practiceService.facilityStatus(queryParams)
				  .subscribe(
					(resp) => {
					  if(resp?.status){
						this.startLoader=false;
					  }
					},
				  ),
			  );
	}

	handleResponseStatusOff(row,queryParams,changeStatus1,updatePractice){
		this.updateLocation = updatePractice;
		let isSame;
		if(updatePractice?.length) {
			isSame = this.compareSchedules(row?.timing, updatePractice);
			this.filteredArray = updatePractice.map(item => ({
				day_id: item?.day_id,
				start_time: item?.start_time,
				end_time: item?.end_time,
				unavailable: item?.unavailable
			}));
			queryParams = {
				...queryParams,
				current_facility_timing: JSON.stringify(this.filteredArray),
				time_zone: stdTimezoneOffset()
			};
		}
		this.subscription.push(
			this.practiceService.facilityLocationsAppointments(queryParams)
			  .subscribe(
				(resp) => {
				  if(resp?.status){
					this.startLoader=false;
					 this.facilityAppointmentsData=(resp.result.data && resp.result.data.docs)?resp.result.data.docs:[] ;
					 this.isAppointments=(resp.result.data && resp.result.data.is_Appointments) ? resp.result.data.is_Appointments : false;
					 this.facilityAppointmentPage.totalElements = resp.result.data.total; 
					 if(this.isAppointments && (!updatePractice || !isSame)) {
					  this.startLoader=false;
					  this.customDiallogService.confirm('Alert', 'There are appointments and assignments created on selected practice-location, you still want to deactivate?','Yes','No')
					  .then((confirmed) => {
						if(confirmed){
						  this.getAppointmensComments();
						const ngbModalOptions: NgbModalOptions = {
						  backdrop: 'static',
						  size: 'lg',
						  keyboard: false,
						  windowClass: 'modal_extraDOc',
						};
						this.modalRefChangeStatus = this.modalService.open(changeStatus1, ngbModalOptions);
					   }else{
						if(!updatePractice) {
							row.is_active = true;
							return;
						}
					   }
					  })
					  .catch((error) => {
						if(!updatePractice) {
							row.is_active = true;
							return;
						}
					  });   
					}else{
						!updatePractice ? this.ChangeFacilityStatus(queryParams) : this.practiceLocationUpdated.emit();
					}
				  }
				},
				(err) => {
					this.startLoader=false;
					if(!updatePractice) {
						this.crossCancel();
						this.modalRef.close();
					}
				}),
		  );
	
	  }  
	
	openMainFacility(row,event,queryParams){
		this.startLoader=false;
		this.customDiallogService
			.confirm('Delete Practice', 'Activating a child practice Location will automatically activate the parent practice')
			.then((confirmed) => {
				if (confirmed) {
					queryParams['parent_active'] = true;
					this.subscription.push(
						this.practiceService.facilityStatus(queryParams)
							.subscribe(
								(resp) => {
									if (resp?.status) {
										this.startLoader = false;
										this.updateFacilityStatus.emit(this.mainFacility)
									}
								}
							),
					);
				} else {
					event.checked = false;
					row.is_active = event.checked;
				}

			});
	}  

	childStatus(changeStatus1,row,event,timings?){
		this.startLoader=true;
		let queryParams:any={
			active:	event['checked'] ? event['checked'] : row?.is_active == 1 ? true : false,
			is_parent:false,
			id:row?.id,
			paginate:true,
			page:1,
			per_page:this.facilityAppointmentPage.size,
			current_date:changeDateFormat(new Date),
			main_facility:false
		};
		this.paramsStored=queryParams;
		this.currentrow=row;
		if(event['checked'] == false || event == false) {
			let updatePractice = timings?.length ? timings : false;
			this.handleResponseStatusOff(row,queryParams,changeStatus1,updatePractice);
		}
		else{
			if (!this.mainFacility?.is_active && row?.is_active) {
			    this.openMainFacility(row,event,queryParams);
			}
			else {
				this.ChangeFacilityStatus(queryParams);
			}
		}		
	}

	compareSchedules(array1, array2) {
		array1?.forEach((schedule1) => {
			let schedule2 = array2?.find((s) => s?.day_id === schedule1?.day_id);
			if (schedule2 && schedule2?.start_time > schedule1?.end_time) {
			  schedule2.unavailable = true;
			} 
			else {
			  if (schedule2) {
				schedule2.unavailable = false;
			  }
			}
		});
		const scheduleMap1 = new Map();
		const scheduleMap2 = new Map();
		array1?.forEach(item => {
			scheduleMap1.set(item?.day_id, { start_time: item?.start_time, end_time: item?.end_time });
		});
		array2?.forEach(item => {
			scheduleMap2.set(item?.day_id, { start_time: item?.start_time, end_time: item?.end_time });
		});
		if (scheduleMap1?.size !== scheduleMap2?.size) {
			return false;
		}
		for (let [day_id, times1] of scheduleMap1) {
			const times2 = scheduleMap2?.get(day_id);
			if (!times2 || times1?.start_time !== times2?.start_time || times1?.end_time !== times2?.end_time) {
				return false;
			}
		}
		return true;
	}

	updatePracticeLocation(practiceLocationEdit, row, rowIndex) {
		if (!this.practiceId) {
			this.index = rowIndex;
		}
		this.locationData = row;
		this.locationData['ActionType'] = 'Update';
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'lg',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(practiceLocationEdit, ngbModalOptions);
	}

	deleteLocation(location) {
		this.customDiallogService.confirm('Delete?', 'Are you sure you want to delete selected location(s)?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.onDeleteLocation.emit([location.id])
			}
		})
		.catch();
	}

	deleteMultipleLocations() {
		this.customDiallogService.confirm('Delete?', 'Are you sure you want to delete selected location(s)?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			// this.onDeleteLocation.emit(this.selection.selected.reduce((acc, val) => {
				// 	acc.push(val.id)
				// }, []))	
			}
		})
		.catch();
	}

	closeModal = (event) => {
		if (event && !event.id) {
			if (Number.isInteger(this.index)) {
				this.practiceLocations.data[this.index] = event;
				this.updateListing.emit();
				this.index = null;
			} else {
				// this.page.offset=0;
				// this.page.pageNumber=0;
				// this.page
				this.practiceLocationpage.offset=0;
				this.practiceLocationpage.pageNumber=0;
				this.onAddLocation.emit(event)
			}
		}
		else if (event) {
			this.onEditLocation.emit({formData:event, page:this.practiceLocationpage})
		}

		this.modalRef.close();
	}

	openModal(facilityLocation) {
		// this.office_hours_start = null;
		// this.office_hours_end = null;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			size: 'lg',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(facilityLocation, ngbModalOptions);
	}

	onSelectValue() {
        let value=this.myForm.get('defaultComments').value
        if (value && value=='Other') {
            this.isOtherChecked = true;
          }
          else
          {
            this.isOtherChecked = false;
          }
      }
	practiceHistoryStats(row) {
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
