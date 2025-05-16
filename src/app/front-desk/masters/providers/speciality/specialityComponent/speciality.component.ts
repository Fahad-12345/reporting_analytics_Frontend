import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { SpecialityUrlsEnum } from '../speciality.enum';

@Component({
	selector: 'app-speciality',
	templateUrl: './speciality.component.html',
	styleUrls: ['./speciality.component.scss']
})
export class SpecialityComponent extends PermissionComponent implements OnInit {
	modalRef: NgbModalRef;
	createSpecialityFormGroup: FormGroup;
	submitted = false;
	delayInMilliseconds = 1000;
	current_tab: string;
	constructor(private modalService: NgbModal,
		private formBuilder: FormBuilder,
		private http: HttpService,
		public aclService: AclService,
		titleService: Title,
		_route: ActivatedRoute, ) {
		super(aclService, null, _route, null, titleService);
		this.current_tab = 'specialty';
	}
	bools: boolean = true;
	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.createSpecialityFormGroup = this.formBuilder.group({
			specialityName: ['', Validators.required],
			specialityComments: ['', Validators.required]
		});

		// this.tabChanged('specialty');
		// let element: HTMLElement = document.getElementById('speciality-tab') as HTMLElement;
		// element.click()
	}
	get f() { return this.createSpecialityFormGroup.controls; }

	openSpecialityModal(createSpeciality) {
		const ngbOPtions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc'
		};
		this.modalRef = this.modalService.open(createSpeciality, ngbOPtions);
	}
	onSpecialityFormSubmit(formValue) {
		this.submitted = true;

		// stop here if form is invalid
		if (this.createSpecialityFormGroup.invalid) {
			return;
		}
		this.http.post(SpecialityUrlsEnum.Speciality_list_POST, formValue).subscribe(res => {
			const { data } = res;
		}, err => {
		});
	}

	tabChanged(current_tab) {
		// this.current_tab = true;
		const self = this;
		setTimeout(function () {
			self.current_tab = current_tab;
		}, 500);
	}
}
