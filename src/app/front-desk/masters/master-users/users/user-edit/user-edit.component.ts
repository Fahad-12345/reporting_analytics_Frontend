import { environment } from './../../../../../../environments/environment';
import {
	Component,
	OnInit,
	OnDestroy,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UserProfile } from '../models/user.model';
import { Subscription, Observable, of } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { RequestService } from '@shared/services/request.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@shared/services/acl.service';
import { RoleChangeServiceService } from '@appDir/front-desk/masters/master-users/users/services/role-change-service.service';
import { UserInfoChangeService } from '../services/user-info-change.service';
import { isSameLoginUser } from '@appDir/shared/utils/utils.helpers';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { PriviligesComponent } from './priviliges/priviliges.component';
import { T } from '@angular/cdk/keycodes';
import { RolePrivilegesComponent } from '@appDir/shared/components/role-privilliges/role-privilliges.component';
@Component({
	selector: 'app-user-edit',
	templateUrl: './user-edit.component.html',
	styleUrls: ['./user-edit.component.scss']
})
export class UsersEditComponent extends PermissionComponent implements OnInit, OnDestroy {
	//this array has record of updated forms in child comp.
	valueChanged:any[] = [];
	closeResult = '';
	subscription: Subscription[] = [];
	user: UserProfile;
	loading: boolean = false;
	public id: any;
	isMedicalIdentifier: boolean = false;
	hasSupervisor:boolean=false;
	private _albums: Array<any> = [];
	album;
	privilegesComp:PriviligesComponent;
	@ViewChildren(PriviligesComponent) privilegesCom:PriviligesComponent
	SameUserLogin = true;
	environment =environment;
	constructor(
		aclService: AclService,
		public router: Router,
		activatedRoute?: ActivatedRoute,
		requestService?: RequestService,
		private roleChangeService?: RoleChangeServiceService,
		protected userInfoChangeService?: UserInfoChangeService,
		// private _lightbox?: Lightbox,
		private modalService?: NgbModal,
		private customDiallogService?: CustomDiallogService,
	) {
		super(aclService, router, activatedRoute, requestService);
		// this.add_img_index();
		// GET CLICK EVENT CLICKED ON IMAGE ON MAIN HEADER
		this.userInfoChangeService.isClickedOnUserPic.subscribe(responce => {
			this.isSameUserLogin();
		});
		this.userInfoChangeService.getMessage().subscribe(res =>{
			this.valueChanged.push(res)
		})
	}
	ngOnInit() {
		// this.storageData.isSuperAdmin()
		
		this.subscription.push(this.userInfoChangeService.onFetchUserInfoListener().subscribe(bool => {
			if (bool)
				this.getUser().subscribe(response => {
					// this.userRelatedData.UserProfileData = response.result.data;
					this.user = response && response['result'] && response['result'].data
					this.userInfoChangeService.onUserInfoChange(this.user)
				})
		}))
		this.activatedRoute.parent.paramMap.subscribe((params: ParamMap): void => {
			this.id = +params.get('id');
			this.getUsersRole();
			this.getUser().subscribe(response => {
				// this.userRelatedData.UserProfileData = response.result.data;
				this.user = response && response['result'] && response['result'].data
				this.userInfoChangeService.onUserInfoChange(this.user)
				this.add_img_index();
			})
		});
		this.isSameUserLogin();// CHECK IF USER SAME WHO IS FETCHING THE LOGIN INFORMATION THEN DON'T SHOW TAB
		this.subscription.push(this.roleChangeService.roleChangeListener().subscribe(bool => {
			this.isMedicalIdentifier = bool;
		}));
		this.updatePrivalagesOfPractice()
	}
	add_img_index() {
		// const caption = 'caption';
		// const thumb = 'thumb.jpg';
		 this.album = {
			src: this.user.profile_pic_url ? this.user.profile_pic_url : undefined,
			caption: this.user.first_name ? this.user.first_name + ' ' + this.user.last_name : undefined,
			// thumb: thumb
		};
		// this._albums.push(album);
		// this._albums.push()
	}
	// open(index: any) {
		// open lightbox
		// alert(this.authenticated_user_detail?.basic_info?.profile_pic_url);
		// this._lightbox.open(this._albums, index);
	// }

	// close() {
	// 	// close lightbox programmatically
	// 	this._lightbox.close();
	// }
	getAgeCalculated(dateString) {
		let age;
		var now = new Date();
		var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		var yearNow = now.getFullYear();
		var monthNow = now.getMonth();
		var dateNow = now.getDate();

		var dob = new Date(dateString.substring(6, 10),
			dateString.substring(0, 2) - 1,
			dateString.substring(3, 5)
		);

		var yearDob = dob.getFullYear();
		var monthDob = dob.getMonth();
		var dateDob = dob.getDate();

		var ageString = "";
		var yearString = "";
		var monthString = "";
		var dayString = "";


		let yearAge = yearNow - yearDob;

		if (monthNow >= monthDob)
			var monthAge = monthNow - monthDob;
		else {
			yearAge--;
			var monthAge = 12 + monthNow - monthDob;
		}

		if (dateNow >= dateDob)
			var dateAge = dateNow - dateDob;
		else {
			monthAge--;
			var dateAge = 31 + dateNow - dateDob;

			if (monthAge < 0) {
				monthAge = 11;
				yearAge--;
			}
		}

		age = {
			years: yearAge,
			months: monthAge,
			days: dateAge
		};

		if (age.years > 1) yearString = " years";
		else yearString = " year";
		if (age.months > 1) monthString = " months";
		else monthString = " month";
		if (age.days > 1) dayString = " days";
		else dayString = " day";


		if ((age.years > 0) && (age.months > 0) && (age.days > 0))
			ageString = age.years + yearString + ", " + age.months + monthString + ", and " + age.days + dayString + " old.";
		else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
			ageString = "Only " + age.days + dayString + " old!";
		else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
			ageString = age.years + yearString + " old. Happy Birthday!!";
		else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
			ageString = age.years + yearString + " and " + age.months + monthString + " old.";
		else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
			ageString = age.months + monthString + " and " + age.days + dayString + " old.";
		else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
			ageString = age.years + yearString + " and " + age.days + dayString + " old.";
		else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
			ageString = age.months + monthString + " old.";
		else ageString = "Oops! Could not calculate age!";
		return ageString;

	}
	getUser(): Observable<any> {
		// callback added later due to need in userformsubmit function
		if (!this.id) {
			return of(null);
		}
		const queryParams = { id: this.id };

		return this.requestService
			.sendRequest(UsersUrlsEnum.User_Basic_Info_GET, 'GET', REQUEST_SERVERS.fd_api_url, queryParams);

	}

	getUsersRole() {
		// this.roleChangeService.onRoleChange(role.medical_identifier)
		// console.log(role)
		const paramQuery = {};
		paramQuery['id'] = this.id;
		// alert('dsds');

		this.requestService.sendRequest(UsersUrlsEnum.User_get_users_role_GET, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
			.subscribe((response: HttpSuccessResponse) => {
				if (response.result.data)

					this.isMedicalIdentifier = response.result.data.medical_identifier;
					this.hasSupervisor =  response.result.data.has_supervisor;
				this.roleChangeService.onRoleChange(this.isMedicalIdentifier)
				// console.log(role)
				// this.form.controls['facilities'].patchValue(data)
			});
	}

	updatePrivalagesOfPractice(){
		this.subscription.push(
			this.userInfoChangeService.$practiceStatus.subscribe((res:any)=>{
				if(res){
					this.valueChanged=[];
				}
			})
		)
	}

	navigate(path) {
		if((this.valueChanged && this.valueChanged.length) && this.activatedRoute.snapshot.params['id'] && this.router.url == `/front-desk/masters/users/creation/edit/${this.activatedRoute.snapshot.params['id']}/privileges`){
					this.customDiallogService
					.confirm('Please Save Data First', 'Do you really want to discard the changes you made ?','Yes','No')
					.then((confirmed) => {
						if (confirmed) {
								this.router.navigate([`front-desk/masters/users/creation/edit/${this.activatedRoute.snapshot.params['id']}/${path}`]);
								this.valueChanged.length = 0;
						}else if(confirmed === false){
							this.userInfoChangeService.onSavePrivilegesData(true);
							this.router.navigate([`front-desk/masters/users/creation/edit/${this.activatedRoute.snapshot.params['id']}/${path}`]);
							this.valueChanged.length = 0;
						}
						else{
							//stay here 
						}
					}
					).catch();
			}
		else{
			this.valueChanged.length = 0;
			this.router.navigate([`front-desk/masters/users/creation/edit/${this.activatedRoute.snapshot.params['id']}/${path}`]);
		}
		
	}
	isSameUserLogin() {
		let user_id;
		this.activatedRoute.parent.paramMap.subscribe((params: ParamMap): void => {
			user_id= params.get('id');
			this.SameUserLogin =  isSameLoginUser(user_id);
		});
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
		this.valueChanged.length = 0;
	}

	open(content) {
		this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
		  this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
		  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	  }
	
	  private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
		  return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
		  return 'by clicking on a backdrop';
		} else {
		  return `with: ${reason}`;
		}
	}
}
