import {
	Component,
	OnInit,
	ViewChild,
	QueryList,
	ViewChildren,
	DoCheck,
	AfterViewInit,
} from '@angular/core';
import { MainService } from '../../../../../../shared/services/main-service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { UserPrivilegesComponent } from '../user-privileges/user-privileges.component';
import { ToastrService } from 'ngx-toastr';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { FacilityUrlsEnum } from '../../../../practice/practice/utils/facility-urls-enum';
import { REQUEST_SERVERS } from '../../../../../../request-servers.enum';
import { RequestService } from '../../../../../../shared/services/request.service';
import { ParamQuery, OrderEnum } from '../../../../../../shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/speciality.enum';
import { HostListener } from '@angular/core';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { Subject } from 'rxjs';
import { generteRandomPassword, removeEmptyAndNullsFormObject, setDefaultTimeZone, whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
// import { dummyfacilitiesResponse, dummyAllRolesResponse } from '../dummyRevampResponses';
@Component({
	selector: 'app-users-add',
	styleUrls: ['./users-add.component.scss'],
	templateUrl: './users-add.component.html',
})
export class UsersAddComponent extends PermissionComponent implements OnInit, AfterViewInit {
	@ViewChildren(UserPrivilegesComponent) AllTabsPrivaleges: QueryList<UserPrivilegesComponent>;
	tabId;
	@HostListener('keydown.shift.tab', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if(event.shiftKey && this.tabId == '1') {

			event.preventDefault();
		} 
		// if(event.keyCode == 9) {
		// 	if(event.shiftKey) {
		// 	   //Focus previous input
		// 	   event.preventDefault();
		// 	}
		// 	else {
		// 	   //Focus next input
		// 	}
		// }
	}
	// @ViewChild('userForm') userForm: UserFormComponent;

	@ViewChild('tabset') tabset: TabsetComponent;
	minPasswordLength: number = 8;
	maxPasswordLength: number = 20;
	loginForm: FormGroup;
	userBasicData = {};
	// userPermission = [];
	dropdownList = [];
	// selectedItems = [];
	// dropdownSettings = {};
	allTab = [];
	// isSuperAdmin: boolean = false;
	public disableSwitching: boolean;
	public disableLoginTab: boolean;
	public disableCredentialForm: boolean;
	public enableBasicForm: boolean;
	public enablePrivileges: boolean;
	createdBy: number;
	lstFacility = [];
	lstSpeciality = [];
	lstRole = [];
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();
	passwordIsValid:boolean = false;
	constructor(
		private mainService: MainService,
		private fdService: FDServices,
		// private fb: FormBuilder,
		private toastrService: ToastrService,
		private route: Router,
		protected requestService: RequestService,
		// private titleService: Title,
		private _route: ActivatedRoute,
		// private route:Router,
		// private toasterService:ToastrService
	) {
		super();
		// console.log('userForm', this.userForm);

		this.disableSwitching = true;

		this.disableCredentialForm = false;
	}

	ngAfterViewInit() {
	}


	getFacilities() {
		const paramQuery: ParamQuery = { filter: false, order: OrderEnum.ASC, pagination: false } as ParamQuery;
		// this.requestService.sendRequest('facility_locations', 'get', REQUEST_SERVERS.fd_api_url, paramQuery).subscribe(data => {
		this.requestService.sendRequest(FacilityUrlsEnum.Facility_list_dropdown_GET,
			'get', REQUEST_SERVERS.fd_api_url, paramQuery)
			.subscribe((data: HttpSuccessResponse) => {
				this.lstFacility = data.result.data;
			});
	}

	getRoles() {
		this.requestService.sendRequest('roles_list', 'get', REQUEST_SERVERS.fd_api_url)
			.subscribe((data: HttpSuccessResponse) => {
				this.lstRole = data.result.data;
			});
	}

	ngOnInit() {
		
		setDefaultTimeZone();

		this.mainService.setLeftPanel({});


		this.loginForm = new FormGroup({
			email: new FormControl(null, [Validators.required,  Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
		]),
			password: new FormControl(null, [
				Validators.required,
				Validators.minLength(this.minPasswordLength),
				Validators.maxLength(this.maxPasswordLength),
				// Validators.pattern('^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,8}$')
			]),
			password_confirmation: new FormControl(null, [
				Validators.required,
				Validators.minLength(this.minPasswordLength),
				Validators.maxLength(this.maxPasswordLength),
				// Validators.pattern('^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,8}$')
			]),
			first_name: new FormControl(null, [Validators.required, whitespaceFormValidation()]),
			middle_name: new FormControl(null),
			last_name: new FormControl(null, [Validators.required, whitespaceFormValidation()]),
			primary_facility_id: new FormControl(null, [Validators.required]),
			// affiliated_facility_ids: new FormControl([]),
			role_id: new FormControl([], [Validators.required]),
			speciality_ids: new FormControl(null)
		});

		// this.loginForm.controls['speciality_id'].disable()
		// this.loginForm.controls['email'].disable();
		
		this.tabset && this.tabset['tab']?this.tabset.tabs[0].active = true:'';
		this.tabset && this.tabset['tab']?this.tabset.tabs[1].disabled = true:'';
		this.tabset && this.tabset['tab']?this.tabset.tabs[2].disabled = true:'';

		this.disableLoginTab = false;

		
	}
	Effect(event) {
			this.tabId = event;
	}
	confirmTabSwitch(event): void {
		const tabText = event.target.innerText;


		if (!this.disableSwitching && tabText === 'Basic Information') {

			this.enableBasicForm = true;
		}

		if (!this.disableSwitching && tabText === 'Privileges') {

			this.enablePrivileges = true;
		}

		return;
	}

	passwordValid($event){
	this.passwordIsValid = $event;
	console.log(this.passwordIsValid);
	}

	getFaclity(id) {
		const index1 = this.dropdownList.findIndex((x) => x.id == id);
		if (index1 > -1) {
			return this.dropdownList[index1];
		}
	}

	onItemSelect($event) {
	}

	changePrimaryFacility($event) {
	}

	getSpeciality() {
		this.requestService.sendRequest(SpecialityUrlsEnum.Speciality_list_Get, 'get', REQUEST_SERVERS.fd_api_url, {
			pagination: 0,
			// available: 1,
			order: OrderEnum.ASC
		}).subscribe((data: HttpSuccessResponse) => {
			this.lstSpeciality = data.result.data;
		});
	}

	

	selectedTab(tabz) {
	}

	removeTabHandler(tab: any): void {
	}

	

	registerUser(): void {
		var data = this.loginForm.value;
		this.startLoader = true;
		this.requestService.sendRequest('register', 'post', REQUEST_SERVERS.fd_api_url, data).subscribe(data => {
			this.startLoader = false;
			if (data['status']) {
				this.toastrService.success('User Registered Successfully', 'Success');
				this.route.navigate(['front-desk/masters/users/creation/edit/' + data['result']['data']['id']]);
			}
		}, err => {
			this.startLoader = false;
		});
	}

	isRoleMedicalIdentifier(id) {
		// console.log(this.lstRole);
		return this.lstRole.find(role => {
			return role.id == id;
		}) ? this.lstRole.find(role => {
			return role.id == id;
		}).medical_identifier 
			: false;
	}
	is_medical = false;
	shouldShowSpeciality(selectedRole) {
		if (selectedRole && selectedRole.medical_identifier != 0 && !selectedRole.has_supervisor) {
			this.is_medical = true;
		} else {
			this.is_medical = false;
		}
		return this.is_medical;
	}
	passwordToggle(elem) {
		if (!elem.value) {
			return;
		}
		if (elem.type == "password") {
			elem.type = "text";
		} else {
			elem.type = "password";
		}
	}
	onFocus(event) {
	}
	generatePassword() {
		let randomPassword = generteRandomPassword(12);
	
		this.loginForm.patchValue({ password_confirmation: randomPassword, password: randomPassword });
	}

	copyToClipBoard(inputElement) {

		inputElement.select();
		document.execCommand('copy');
		inputElement.setSelectionRange(0, 0);

	}

	cancelUser(){
		this.route.navigate(['/front-desk/masters/users/creation/list']);
}
selectionOnValueChange(e: any,Type?) {
	const info = new ShareAbleFilter(e);
	this.loginForm.patchValue(removeEmptyAndNullsFormObject(info));
	if(Type === 'userRole') {
		if(!e.data) {
			this.loginForm.controls.role_id.setValue([]);
		} else {
			this.shouldShowSpeciality(e.data.realObj);
		}
	} else 	if(Type === 'facility_location') {
		if(!e.data) {
			this.loginForm.controls.primary_facility_id.setValue(null);
			this.loginForm.controls.primary_facility_id.markAsTouched();
		} 
	} 
}
controlHasTouched(e: any,Type?) {
	if(Type === 'userRole') {
		if(this.loginForm.get('role_id').value.length < 1) {
			this.loginForm.controls.role_id.markAsTouched();
		}
	} else if (Type === 'facility_location') {
		if(this.loginForm.get('primary_facility_id').value == null) {
			this.loginForm.controls.primary_facility_id.markAsTouched();
		}
	}
}
}
