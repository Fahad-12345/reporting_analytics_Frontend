import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import {
	Component,
	Input,
	OnInit,
	OnChanges,
	ViewChild,
	ElementRef,
	EventEmitter,
	Output,
	SimpleChanges,
} from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Config } from 'app/config/config';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import {
	FileSystemFileEntry,
	FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DesignationUrlsEnum } from '@appDir/front-desk/masters/master-users/designation/designation-urls-enum';
import { DepartmentUrlsEnum } from '@appDir/front-desk/masters/master-users/departments/department/Departments-urls-enum';
import { EmploymentUrlsEnum } from '@appDir/front-desk/masters/master-users/employment-type/employment-urls-enum';
import { EmploymentByUrlsEnum } from '@appDir/front-desk/masters/master-users/employment-by/employmentBy-urls-enum';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { formatDate } from '@angular/common';
import { UserRelatedData } from '@appDir/front-desk/masters/master-users/users/models/user.model';
import { makeDeepCopyArray, changeDateFormat, getObjectChildValue, removeEmptyAndNullsFormObject, whitespaceFormValidation, isSameLoginUser, isObjectEmpty } from '@shared/utils/utils.helpers';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { WeeklyTimingForm, Timing, TimeRangeInterface } from '@appDir/front-desk/masters/practice/practice/utils/practice.class';
import { RoleChangeServiceService } from '../../../masters/master-users/users/services/role-change-service.service';
import { UserInfoChangeService } from '@appDir/front-desk/masters/master-users/users/services/user-info-change.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
declare var PDFObject: any;

@Component({
	selector: 'app-user-form',
	templateUrl: './user-form.component.html',
	animations: [
		trigger('fadeInOut', [
			state(
				'void',
				style({
					opacity: 0,
				}),
			),
			transition('void <=> *', animate(1000)),
		]),
	],
})
export class UserFormComponent extends PermissionComponent implements OnInit, OnChanges {
	subscription: Subscription[] = [];
	form: FormGroup;
	private imageSrc: string = '';
	public modules: any[];
	public roles: any[];
	public files: any[] = [];
	public uploading: boolean;
	selectedItems = [];
	dropdownSettings = {};
	newUserId: any;
	isUploading = false;
	public designations: any[];
	public departments: any[];
	public allEmploymentTypes: any[];
	documentsShown: any[] = [];
	selection = new SelectionModel<any>(true, []);
	fileExtension: any;
	imageSourceLink: any = null;
	pdfSourceLink: any = 'xyz';
	file: any;
	showFile: boolean = true;
	showingFiles: boolean = false; // added to hide if ther is no file
	addTagForm: FormGroup;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	documentResposne: any[] = [];
	editTagForm: FormGroup;
	folderFiles: any[] = [];
	file_id: number;
	isSameUser = false;
	tagIndex: number;
	dobDate = new Date()
	@Input() loading: boolean = false;
	@Input() title: string = 'Edit';
	// @Input() dropdownList: [] = [];
	@Input() userRelatedData: UserRelatedData;
	@Output() userFormSubmit = new EventEmitter();
	@ViewChild('placesRef') placesRef: GooglePlaceDirective;
	// @Output() enablePriviliges = new EventEmitter();
	employedBY: any[] = [];
	private documents: any[];
	private imageIndex: number;

	public office_hours_start: string;
	public office_hours_end: string;
	isUserFormValid: boolean = false;

	private imageUpload: any[];
	private IndexProfileImage: number;
	profileIamgeUploading: boolean = false;
	public profileImageSrc: string = '';
	public ImageExt: any;
	backendImageResponse: any;
	currentUser: number = 0;
	affiliatedPracticesDropdownData: Array<any> = [];
	selectedDepartment: string = 'All Department';
	selectedPractice: string = 'All Practice';
	selectedRole: string = 'All Role';
	zipFormatMessage=ZipFormatMessages;
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	@ViewChild('employementTypeId') employementTypeId:any ={};
	@ViewChild('designation') designation :any ={};
	@ViewChild('employedBy') employedBy :any ={};
	@ViewChild('affiliatedPracticesDropdown') affiliatedPracticesDropdown: MultiSelectComponent;
	selectedMultipleFieldFiter: any = {
	
		primary_facility_id: [],
		
	};
	labelName = {
		practiceLocation: false,
		practiceLocationAfliated:false,
		
	
	};

	selectedItemDisplay:string;

	getNewChildValues(): WeeklyTimingForm {
		return {
			selectedTimings: [] as Timing[],
			isValid: true,
			timeRange: [] as TimeRangeInterface[]
		};
	}

	childValuesObj: { [key: string]: WeeklyTimingForm } = {} as any;


	constructor(
		aclService: AclService,
		private fb: FormBuilder,
		private logger: Logger,
		private fd_services: FDServices,
		private customDiallogService: CustomDiallogService,
		// private http: HttpService,
		protected router: Router,
		private route: ActivatedRoute,
		// private config: Config,
		private toastrService: ToastrService,
		// private userPofileService: UserProfileImageService,
		private modalService: NgbModal,
		private fdServices: FDServices,
		protected requestService: RequestService,
		private roleChangeService: RoleChangeServiceService,
		private userChangeService: UserInfoChangeService,
		private documentManagerService: DocumentManagerServiceService,
		private caseFlowService:CaseFlowServiceService,
		private el:ElementRef
	) {
		super(aclService)
	}

	checkTimes() {
		return this.office_hours_start + '' === this.office_hours_end + '';
	}

	employementTypesId;
	
	ngOnChanges(changes: SimpleChanges) {

		this.userRelatedData.UserProfileData.affiliated_facility_ids = this.removeDuplicates(this.userRelatedData.UserProfileData.affiliated_facility_ids);
		if (this.form && !isObjectEmpty(this.userRelatedData) && this.userRelatedData.UserProfileData) {

			if (this.userRelatedData.UserProfileData.affiliated_facility_ids) {

				// this.userRelatedData.UserProfileData
				// 	.affiliated_facility_ids = this.userRelatedData.UserProfileData
				// 		.affiliated_facility_ids.filter(va => va !== null);
			}
			this.profileImageSrc = getObjectChildValue(this.userRelatedData, null, ['UserProfileData', 'profile_pic_url']);

			// this.affiliatedPracticesDropdownData = makeDeepCopyArray(this.userRelatedData.practicesDropDownData);

			this.form.patchValue(this.userRelatedData.UserProfileData);
			this.onPrimaryPracticeChange(+this.form.get('primary_facility_id').value, false);
			this.selectAffiliatedPracticesInDropDown(true);
			/*this.form.valueChanges.subscribe((change) => {
				// alert(change);
			});*/
			this.form.markAsUntouched();
			this.form.markAsPristine();
			if (this.userRelatedData.practicesDropDownData)
				this.userRelatedData.practicesDropDownData.forEach(practice => {
					if (!this.childValuesObj.hasOwnProperty(practice.id))
						this.childValuesObj[practice.id] = this.getNewChildValues();
					this.childValuesObj[practice.id].timeRange = practice.timing;

				});
		}
		this.isSameLoginUser(this.form);
		this.setValuesInShareableComp();
	}

	removeDuplicates<T>(array: T[]): T[] {
		return [...new Set(array)];
	}

	setValuesInShareableComp() {
		// EMPLOYEMENT TYPE ID
		this.employementTypeId['lists'] = this.userRelatedData.employmentTypeDropDownData ? this.userRelatedData.employmentTypeDropDownData : [];
	 	this.form && this.form.get('employment_type_id').value ? this.employementTypeId.searchForm.patchValue({ common_ids: this.form.get('employment_type_id').value }) : null;
		// EMPLOYEMENT TYPE ID
		this.designation['lists'] = this.userRelatedData.designationDropDownData ? this.userRelatedData.designationDropDownData : [];
		this.form && this.form.get('designation_id').value ? this.designation.searchForm.patchValue({ common_ids: this.form.get('designation_id').value }) : null;
		// EMPLOYEMENT TYPE ID
		this.employedBy['lists'] = this.userRelatedData.employedByDropDownData ? this.userRelatedData.employedByDropDownData : [];
		this.form && this.form.get('employed_by_id').value ? this.employedBy.searchForm.patchValue({ common_ids: this.form.get('employed_by_id').value }) : null;
	}

	selectAffiliatedPracticesInDropDown(dd = false) {
		const affiliatedPracticeFormControl = this.form.get('affiliated_facility_ids');

		if (affiliatedPracticeFormControl.value &&
			affiliatedPracticeFormControl.value.length &&
			this.userRelatedData.practicesDropDownData &&
			this.userRelatedData.practicesDropDownData.length) {

			this.userRelatedData.practicesDropDownData = removeEmptyAndNullsFormObject(this.userRelatedData.practicesDropDownData);

			// affiliatedPracticeFormControl.setValue(
			// 	this.userRelatedData.practicesDropDownData
			// 		.filter(practice => this.userRelatedData.UserProfileData.affiliated_facility_ids.includes(practice.id))
			// );
		}
		if (dd) {
			this.form.markAsPristine();
			this.form.markAsUntouched();
		}
	}
	showSelectFieldList :any[]=[];
	addAfflicated($event){

		if ($event){
			this.showSelectFieldList.push({id: $event.id, name: $event.name});
			this.selectedItemDisplay = this.showSelectFieldList.map(res => res.name).toString();
		}
	
	}

	remove($event: any){
		if(this.showSelectFieldList.length < 1 && $event) { // WHEN RECORD EXISTS AND REMOVE ITEM ON MULTIPLE SHOW RECORD TOOL TIP (ON EDIT MOOD)
			this.showSelectFieldList && this.showSelectFieldList.map(res => this.showSelectFieldList.push({id: res.id, name: res.name}))
		}
		if($event){
			const index = this.showSelectFieldList.findIndex(res => res.id === $event.value.id);
		    this.showSelectFieldList.splice(index,1);
			this.selectedItemDisplay = this.showSelectFieldList.map(res => res.name).toString();
		}
	}

	onPrimaryPracticeChange($event, clearAffiliatedPractices = true, allFacility?) {
		debugger;
		if (allFacility && allFacility.selectedIndex) {
			this.selectedPractice =  $event && $event.facility_full_name ?$event.facility_full_name:null;
			//this.userRelatedData.practicesDropDownData[allFacility.selectedIndex].facility_full_name;
		}

		this.affiliatedPracticesDropdownData = makeDeepCopyArray(this.userRelatedData.practicesDropDownData);

		if (clearAffiliatedPractices)
			this.form.get('affiliated_facility_ids').setValue([]);


		/*	const index1 = affiliated_facilityIdsValue.findIndex(val => val === +$event);
			if (index1 !== -1) {
				;
				const value = affiliated_facilityIdsValue.splice(index1, 1);
				this.affiliatedPracticesDropdown.removeSelected(value)
				this.form.get('affiliated_facility_ids').setValue(value);
			}*/
		// this.selectAffiliatedPracticesInDropDown();
		const index = this.affiliatedPracticesDropdownData.findIndex(val => val.id === +$event);
		const obj = this.affiliatedPracticesDropdownData.find(val => val.id === +$event);


		if (index !== -1) {
			this.affiliatedPracticesDropdownData.splice(index, 1);
			// this.affiliatedPracticesDropdown.removeSelected(obj);
			// this.form.get('affiliated_facility_ids').setValue(this.affiliatedPracticesDropdown.selectedItems);
		}
		// this.affiliatedPracticesDropdown.data = this.affiliatedPracticesDropdownData;
		this.selectAffiliatedPracticesInDropDown();

	}

	onItemSelect(event?) {

		// console.log("itemSelect", event);
	}

	setForm() {

		// primary_practice
		this.form = this.fb.group({
			id: '',
			first_name: ['', [Validators.required, whitespaceFormValidation()]],
			city: [''],
			zip: ['', Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')],
			social_security: [''],
			middle_name: [''],
			last_name: ['', [Validators.required, whitespaceFormValidation()]],
			// profile_pic : "",
			date_of_birth: [''],


			gender: ['', [Validators.required]],
			title: [''],
			cell_no: [''],
			address: [''],
			apartment_suite: [''],
			work_phone: [''],
			home_phone: [''],
			fax: [''],
			extension: [''],
			employed_by_id: [''],
			emergency_phone: [''],
			emergency_name: [''],
			designation_id: [''],
			department_id: [''],
			role_id: ['', Validators.required],
			employment_type_id: [''],
			biography: [''],
			hiring_date: [''],
			from: [''],
			to: [''],
			primary_facility_id: ['', Validators.required],
			affiliated_facility_ids: [],
			email: [null, [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],

			// 'phone_no': [''],
			state: [''],
			/*files: [''],
			module_id: [''],

			role_id: [''],*/


		});


	}



	onSubmit(form) {

		if (this.form.valid) {
			this.logger.log('form', form);
			let folderId = form.parentId;
			if (form.sfolderId) {
				folderId = form.sfolderId;
			}

			const requestData = {
				module: 'patientCases',
				folderId: folderId,
				filesData: [
					{
						fileTitle: form.fileTitle,
						ext: form.ext,
						tags: form.tags,
						file: form.file,
					},
				],
			};
		
		}
	}

	getAddress(str) {
		return (str) ? str + ', ' : '';
	}

	handleReaderLoaded(e): void {
		// this.base64textString.push('data:image/png;base64,' + btoa(e.target.result));
		// if (this.imageIndex > 0) {
		//   console.log('returned');
		//   return;
		// }
		// console.log('oustide');
		this.isUploading = true;
		const reader = e.target;

		this.imageSrc = reader.result;

		const filecode = this.imageSrc.split(',');
		// console.log('fileCode', filecode);
		this.imageSrc = filecode[1];

		this.documents[this.imageIndex].file = filecode[1];
		++this.imageIndex;


		// return;

		// console.log('documets', this.documents);
		this.isUploading = true;
		

		if (this.newUserId === undefined || this.newUserId == null) {
			const Id = this.route.snapshot.params['id'];
			const temp = {
				staffId: Id,
				module: 'staff',
				filesData: this.documents,
			};
			this.subscription.push(
				this.fd_services.uploadUserDocument(temp).subscribe(
					(resp) => {
						if (resp.status) {
							this.toastrService.success('Success', resp.message);
							this.documentsShown = resp.data;
							// console.log('this.documentsShown', this.documentsShown);
							this.isUploading = false;
						}
						if (!resp.status) {
							this.toastrService.error('Error', resp.message);
						}

						this.documents = [];
						this.imageIndex = 0;
					},
					(err) => {
					},
				),
			);
		}

		// console.log('temp', temp);

		return;

		// console.log('form', this.form.controls.get("files"));
	}

	private formatFile = (droppedFile, isImage?: boolean): void => {
		// console.log('droppedFile', droppedFile);
		if (droppedFile.fileEntry.isFile) {
			const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

			fileEntry.file((file: File) => {
				// console.log('file', file);

				// Here you can access the real file
				// console.log(droppedFile.relativePath, file);
				// Get Extension from file

				const ext = file.type.split('/');
				// console.log('ext', ext);

				if (isImage) {
					this.documents.push({ tags: 'profile_picture', fileTitle: file.name, ext: ext[1] });
				} else {
					this.documents.push({ tags: '', fileTitle: file.name, ext: ext[1] });
				}

				// Convert file to base64

				const reader = new FileReader();

				reader.onload = this.handleReaderLoaded.bind(this);

				reader.readAsDataURL(file);
			});
		} else {
			// It was a directory (empty directories are added, otherwise only files)
			const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
			// console.log(droppedFile.relativePath, fileEntry);
		}
	};

	public dropped = (event: any, isImage?: boolean): void => {
		this.showingFiles = true;
		// console.log('isImage', isImage, event.files.length);

		// console.log('deopped', this.dropped);

		if (isImage && event.files.length < 2) {
			const droppedImage: any = event.files[0];

			// console.log('droppedImage', droppedImage);

			this.formatFile(droppedImage, isImage);

			// console.log('doddddddddddddddddddd', this.documents[this.documents.length - 1]);

			return;
		}

		if (!isImage) {
			for (const droppedFile of event.files) {
				// Is it a file?
				this.formatFile(droppedFile, isImage);
			}

			return;
		}
	};

	public fileOver = (event): void => console.log(event);

	public fileLeave = (event): void => console.log(event);


	addUser(formData) {
		this.subscription.push(
			this.fd_services.addUser(formData).subscribe((res) => {
				if (res.status) {
					// this._alert.create('success', res.message);
					this.router.navigate(['list'], { relativeTo: this.route.parent });
				}
			}),
		);
	}


	getAllDesignations() {
		this.subscription.push(
			// this.fd_services.getAllDesignations()
			this.requestService
				.sendRequest(DesignationUrlsEnum.Designation_list_GET, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe(
					(res: any) => {
						if (res.status) {
							this.designations = res.result ? res.result.data : [];
						}
					},
					(err) => {
					},
				),
		);
	}

	getAllDepartments() {
		this.subscription.push(
			// this.fd_services.getAllDepartments()
			this.requestService
				.sendRequest(DepartmentUrlsEnum.Departments_list_GET, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe(
					(res: any) => {
						if (res.status) {
							this.departments = res.result ? res.result.data : [];
						}
					},
					(err) => {
					},
				),
		);
	}

	getAllEmploymentTypes() {
		this.subscription.push(
			// this.fd_services.getAllEmploymentTypes()
			this.requestService
				.sendRequest(EmploymentUrlsEnum.Employment_list_GET, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe(
					(res: any) => {
						if (res.status) {
							this.allEmploymentTypes = res.result && res.result.data ? res.result.data : [];
						}
					},
					(err) => {
					},
				),
		);
	}


	touchAllFields() {
		// touch all fields to show the error
		Object.keys(this.form.controls).forEach((field) => {
			const control = this.form.get(field);
			control.markAsTouched({ onlySelf: true });
		});
	}

	onRoleChange(event, allRole) {
		const id = event.target.value;
		const role = this.userRelatedData.rolesData.find(role => {
			return role.id == id;
		});

		if (allRole && allRole.selectedIndex) {
			this.selectedRole = this.userRelatedData.rolesData[allRole.selectedIndex].name;
		}


	}

	createTimingObj() {
		let keys = Object.keys(this.childValuesObj);
		let result = [];
		keys.forEach(key => {
			let value = (this.childValuesObj[key] as WeeklyTimingForm).selectedTimings;
			value.forEach(val => {
				val['facility_location_id'] = key;
				result.push(val);
			});
		});
		return result;
	}

	submitForm() {
		debugger;
		if(!this.form.controls['gender'].value) {
			this.form.controls['gender'].markAsTouched();
		}
		if(!this.form.valid) {
			let firstInvalidControl: HTMLElement =
			this.el.nativeElement.querySelector('form .ng-invalid:not(div)');
			if(firstInvalidControl){
			this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
			return;}
		}
		// if (this.form.get('affiliated_facility_ids').value && this.form.get('affiliated_facility_ids').value.every(isNaN)) {
		// 	const control = this.form.get('affiliated_facility_ids');
		// }
		let afflicatedFaclityIds:any[] = this.form.getRawValue()['affiliated_facility_ids'];
		this.form.controls['affiliated_facility_ids'].setValue(afflicatedFaclityIds?afflicatedFaclityIds:[]);
		let formData = this.form.value;
		if (formData['date_of_birth']) {
			formData['date_of_birth'] = changeDateFormat(formData['date_of_birth']);
		}
		if (formData['hiring_date']) {
			formData['hiring_date'] = changeDateFormat(formData['hiring_date']);
		}
		this.userFormSubmit.emit({ ...formData, user_timings: this.createTimingObj() });
	}

	isChildValuesValid() {
		return Object.values(this.childValuesObj).every(obj => {
			return obj.isValid;
		});
	}

	getForm() {
		// this.logger.log(this.form);
		// this.logger.log(this.form.valid);
	}

	goBack() {
		this.router.navigate(['users'], { relativeTo: this.route.parent.parent.parent });
	}

	public handleAddressChange(address: Address, type?: string) {
		const street_number = this.fd_services.getComponentByType(address, 'street_number');
		const route = this.fd_services.getComponentByType(address, 'route');
		const city = this.fd_services.getComponentByType(address, 'locality');
		const state = this.fd_services.getComponentByType(address, 'administrative_area_level_1');
		const postal_code = this.fd_services.getComponentByType(address, 'postal_code');
		const lat = address.geometry.location.lat();
		const lng = address.geometry.location.lng();
		const _address = street_number.long_name + ' ' + route.long_name;

		this.form.patchValue({
			address: _address,
			city: city.long_name,
			state: state.long_name,
			zip: postal_code.long_name,
		});
	}

	public droppedImageProfile = (event: any, isImage?: boolean): void => {
		// console.log('isImage', isImage, event.files.length);

		// console.log('deopped', this.dropped);

		if (isImage && event.files.length < 2) {
			const droppedImage: any = event[0];

			// console.log('droppedImage', droppedImage);

			this.formatFile(droppedImage, isImage);

			// console.log('doddddddddddddddddddd', this.documents[this.documents.length - 1]);

			return;
		}

		if (!isImage) {
			for (const droppedFile of event) {
				// Is it a file?
				this.formatFileImage(droppedFile, isImage);
			}

			return;
		}
	};
	public fileOverImage = (event): void => console.log(event);

	public fileLeaveImage = (event): void => console.log(event);

	private formatFileImage = (droppedFile, isImage?: boolean): void => {
		if (droppedFile.fileEntry.isFile) {
			const user_id = this.userRelatedData.UserProfileData.id;
			const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
			fileEntry.file((file: File) => {
				const formData = new FormData();
				formData.append('image', file, droppedFile.relativePath);
				formData.append('user_id', user_id + '');
				this.profileIamgeUploading = true;
				this.subscription.push(
					this.requestService.sendRequest(UsersUrlsEnum.Update_Image_POST, 'POST', REQUEST_SERVERS.fd_api_url, formData).subscribe(
						(resp: HttpSuccessResponse) => {
							this.profileImageSrc = resp.result.data.profile_pic_url;
							this.profileIamgeUploading = false;
							this.imageUpload = [];
							this.IndexProfileImage = 0;
							this.profileIamgeUploading = false;
							this.toastrService.success('Profile Image Updated successfully.', 'SUCCESS');
						},
						(err) => {
							this.profileIamgeUploading = false;
						},
					),
				);
			});
		} else {
			// It was a directory (empty directories are added, otherwise only files)
			const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
			// console.log(droppedFile.relativePath, fileEntry);
		}
	}



	showMedia(files): void {
		// $event = files.file_link;
		// this.filePreview.emit(file.file_link);
		let y = files.split('.');
		if (y.length > 0) {
			this.fileExtension = y[y.length - 1];
		}
		if (this.fileExtension == 'pdf' || this.fileExtension == 'PDF') {
			this.imageSourceLink = null;
			this.pdfSourceLink = files;
			this.file = files;
			PDFObject.embed(this.pdfSourceLink, '#pdf');
		} else {
			this.pdfSourceLink = null;
			this.imageSourceLink = files;
		}
	}

	showFilePreview(showFile) {
		this.showFile = showFile;
		if (this.showFile) {
			if (this.fileExtension == 'pdf' || this.fileExtension == 'PDF') {
				// console.log('this.ext', this.fileExtension)
				this.showMedia(this.file);
			}
		}
	}

	employedByGet() {
		this.subscription.push(
			// this.http.get('all-employed-by')
			this.requestService
				.sendRequest(EmploymentByUrlsEnum.EmploymentBy_list_GET, 'GET', REQUEST_SERVERS.fd_api_url)
				.subscribe((resp: any) => {
					if (resp['status']) {
						this.employedBY = resp.result ? resp.result.data : [];
					}
				}),
		);
	}

	addTagModal = (content, row?, rowIndex?): void => {
		this.file_id = row.id;
		this.tagIndex = rowIndex;

		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};

		this.modalRef = this.modalService.open(content, ngbModalOptions);
	};

	editDocModal = (content, file): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		// this.file = file;
		// console.log('file', file)
		var tags = [];
		if (file.tags) {
			tags = file.tags.split(',');
		}
		this.editTagForm['controls']['id'].setValue(file.id);
		this.editTagForm['controls']['file_title'].setValue(file.file_title);
		this.editTagForm['controls']['tags'].setValue(tags);
		this.modalRef = this.modalService.open(content, ngbModalOptions);
	};

	onSubmitAddTag(form) {
		// console.log('addTagForm', form);

		if (this.addTagForm.valid) {
			const formValue = this.addTagForm.getRawValue();
			let tagsStr = '';
			this.disableBtn = true;
			if (formValue.tags.length) {
				let i = 0;
				for (const tag of formValue.tags) {
					const comma = i > 0 ? ',' : '';
					if (typeof tag === 'object') {
						tagsStr = tagsStr + comma + tag.display;
					} else {
						tagsStr = tagsStr + comma + tag;
					}
					i++;
				}
			}

			formValue['tags'] = tagsStr;

			// for(let p =0; p< this.folderFiles.length; p++){

			// }
			// for (let folder of this.folderFiles) {
			// 	console.log('folder', folder);

			// 	const id = folder.id;
			// 	console.log('folder id ', id);
			// 	formValue.id = id;
			// 	return;
			// }
			formValue.id = this.file_id;
			this.saveDocument(formValue);
		}
	}

	editTagSubmit() {
		if (this.editTagForm.valid) {
			const formValue = this.editTagForm.getRawValue();
			let tagsStr = '';
			this.disableBtn = true;
			if (formValue.tags.length) {
				let i = 0;
				for (const tag of formValue.tags) {
					const comma = i > 0 ? ',' : '';
					if (typeof tag === 'object') {
						tagsStr = tagsStr + comma + tag.display;
					} else {
						tagsStr = tagsStr + comma + tag;
					}
					i++;
				}
			}

			formValue['tags'] = tagsStr;

			// for (const folder of this.documentsShown) {
			const id = this.editTagForm.value.id;
			const file_title = this.editTagForm.value.file_title;
			// console.log('folder  ', folder);
			formValue.id = id;
			formValue.fileTitle = file_title;
			// }
			this.saveDocument(formValue);
		}
	}

	saveDocument(formValue) {
		this.subscription.push(
			this.documentManagerService.editDocument(formValue).subscribe(
				(res) => {
					if (res.status === true) {
						// this.documentResposne[0] = res.data;

						if (this.editTagForm.valid) {
							this.editTagForm.reset();
							this.getAllDocuments();
						} else {
							this.addTagForm.reset();
							this.getAllDocuments();
						}

						this.modalRef.close();
						this.toastrService.success('Tag Added Successfully', 'Success');
					}
					this.disableBtn = false;
				},
				(err) => {
					this.toastrService.error(err.error.error.message, 'Error');
				},
			),
		);
	}

	getAllDocuments() {
		// ;
		let data = {
			objectId: this.currentUser,
			// objectId:	Id ,
			objectType: 'staff',
		};
		this.subscription.push(
			this.fdServices.getAllFoldersAndFilesByCase(data).subscribe((res) => {
				if (res.status === 200 || res.status) {
					this.showingFiles = true;
					this.documentsShown = res.data;
					if (this.documentsShown.length > 0) {
						this.folderFiles = this.documentsShown[0]['files'];
					}

				}
			}),
		);
	}

	deleteFile(row) {
		const id = [];
		id.push(row.id);
		const data = {
			ids: id,
		};
		
this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete this file?','Yes','No')
.then((confirmed) => {

	if (confirmed){
		this.fdServices.deleteDocument(data).subscribe((resp) => {
			if (resp.status === true) {
				this.getAllDocuments();
				this.toastrService.success('Success', 'deleted successfully');
			}
		});

	}else if(confirmed === false){
	
	}else{

	}
})
.catch();


	
		
	}

	ngOnDestroy(): void {
		// this.logger.log('ngOnDestroy');
		this.caseFlowService.removeScrollClasses();
		unSubAllPrevious(this.subscription);
	}


	officeStartTimeChange($event) {
		this.office_hours_start = formatDate($event, 'HH:mm:ss', 'en-US', '');
		this.form.get('to').setValue(this.office_hours_start);
	}

	officeEndTimeChange($event) {
		this.office_hours_end = formatDate($event, 'HH:mm:ss', 'en-US', '');
		this.form.get('from').setValue(this.office_hours_end);
	}


	ngOnInit() {

		this.dropdownSettings = {
			singleSelection: false,
			idField: 'id',
			textField: 'facility_full_name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 1,
			allowSearchFilter: true,
		};

		this.addTagForm = this.fb.group({
			id: '',
			tags: '',
		});

		this.editTagForm = this.fb.group({
			id: '',
			tags: '',
			file_title: '',
		});

		// this.getAllDocuments();
		this.currentUser = this.route.parent.snapshot.params['id'] || 0;

		this.setForm();


		this.documents = [];
		this.imageIndex = 0;

		this.imageUpload = [];
		this.IndexProfileImage = 0;
		this.caseFlowService.addScrollClasses();

	}

	getFacilityNameFromFacilityData(id) {
		var obj = this.userRelatedData.practicesDropDownData.find(practice => {
			if (practice.id == id) {
				return practice;
			}
});

		return obj.facility_full_name;

	}

	cancelUser() {
		this.router.navigate(['/front-desk/masters/users/creation/list']);
	}


	departmentChange(dept) {
		if (dept && dept.selectedIndex) {
			this.selectedDepartment = this.userRelatedData.departmentDropDownData[dept.selectedIndex].name;
		}
	}
	isSameLoginUser(formName: FormGroup) {
		if (isSameLoginUser(this.currentUser)) {
			formName.disable();
			this.isSameUser = true;
		}

	}

	labelMovetoAbove(status: boolean, label: string) {
		this.labelName[label] = status;
	}
	

	ngSelectClear(Type) {
		this.form.controls[Type].setValue(null);
	}

	selectionOnValueChange(e: any,Type?) {
		debugger;
		const info = new ShareAbleFilter(e);
		this.form.patchValue(removeEmptyAndNullsFormObject(info));
	}

	customSearchFn(term: string, item: any) {
		
		term = term.toLocaleLowerCase();
		let facility_full_name_qualifier=(item.facility ? (item.facility.qualifier?item.facility.qualifier.toLowerCase():''):''+(item.qualifier?'-'+item.qualifier.toLowerCase():''))

		return (item.facility_full_name.toLocaleLowerCase().includes(term)  || 
		facility_full_name_qualifier.includes(term));
	  
	}
}
