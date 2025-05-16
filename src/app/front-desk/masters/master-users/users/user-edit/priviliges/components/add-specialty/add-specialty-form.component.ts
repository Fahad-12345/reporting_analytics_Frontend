import { Validator } from './../../../../../../../../shared/dynamic-form/models/validator.model';
import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {  NgbModal,  NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {  unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/specialities-listing/Speciality-urls-enum';
import { UsersUrlsEnum } from '../../../../users-urls.enum';
import { UserInfoChangeService } from '../../../../services/user-info-change.service';
@Component({
	selector: 'app-specialty-form',
	templateUrl: './add-specialty-form.component.html',
	styleUrls: ['./add-specialty-form.component.scss']
})
export class AddSpecialtyFormComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	loadSpin: boolean = false;
	specialtyForm: FormGroup;
	disableBtn: boolean = false;
	title: string;
	buttonTitle: string;
	eventsSubject: Subject<any> = new Subject<any>();
	selectedMultipleFieldFiter: any = {
		'specialty_ids': [],
	};
	conditionalExtraApiParams={
		
	};
	EnumApiPath = SpecialityUrlsEnum;
	requestServerpath = REQUEST_SERVERS;
	@Input()user_id
	@Input()facility_location_id
	@Input()excluded_speciality_ids:[]=[]

	constructor(
		private activeModal: NgbActiveModal,
		aclService: AclService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		router: Router,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		titleService: Title
		,private userInfoService:UserInfoChangeService
		) {
		super(aclService, router, _route, requestService, titleService);


	}

	ngOnInit() {
		this.conditionalExtraApiParams={
			user_id:this.user_id,
			facility_location_id:this.facility_location_id
		}
		// this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.specialtyForm = this.initializeVisitType();
	
	}

	close() {
		
		this.specialtyForm.reset();
		this.activeModal.close();
	}
	
	/**
	 * set search form
	 */
	initializeVisitType() {
		return this.fb.group({
			
			specialty_ids:['',Validators.required],
			
		});
	}

	/**set table action checkbox */
	
	
	/**
	 * submiting form to add/update
	 * @param form 
	 */
	onSubmit(form) {
		debugger;
		
			this.addForm(form);
			this.userInfoService.sendMessage('4')
		
	}
	/**
	 * add form
	 * @param form 
	 */
	addForm(form) {
		this.loadSpin = true;
		this.disableBtn = true;
		if (this.specialtyForm.valid) {
			let req={
				facility_location_id:this.facility_location_id,
				...form,
				// supervisor_ids:form.supervisor_ids,
				user_id:this.user_id
			}
			// let req= removeEmptyAndNullsFormObject(form);
			this.subscription.push(
				this.requestService
					.sendRequest(
						UsersUrlsEnum.assign_specialties_to_user,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						req,
					)
					.subscribe(
						(data: any) => {
							if (data.status) {
								this.disableBtn = false;
								
								this.toaster.success('Successfully added', 'Success');
								this.loadSpin = false;
							
								this.activeModal.close({data:data.result && data.result.data?data.result.data:null});
							}
						},
						(err) => {
							this.loadSpin = false;
							this.disableBtn = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toaster.error(str);
						},
					),
			);

		}
	}
	/**
	 * update form
	 * @param form 
	 */

	
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	selectionOnValueChange(e: any,_form:FormGroup) {
		debugger;
		_form.controls['specialty_ids'].setValue(e &&e.formValue?e.formValue:null);
	}


}
