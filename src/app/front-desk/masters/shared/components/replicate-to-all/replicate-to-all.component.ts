import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {  NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import {  unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
@Component({
	selector: 'app-replicate-to-all-form',
	templateUrl: './replicate-to-all.component.html',
	styleUrls: ['./replicate-to-all.component.scss']
})
export class ReplicateToAllFormComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	loadSpin: boolean = false;
	specialtyForm: FormGroup;
	disableBtn: boolean = false;
	@Input() title: string;
	@Input() subtitle: string;
	@Input() data:any[]=[];
	buttonTitle: string;
	eventsSubject: Subject<any> = new Subject<any>();
	selection = new SelectionModel<Element>(true, []);

	constructor(
		private activeModal: NgbActiveModal,
		aclService: AclService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		router: Router,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		titleService: Title,
		) {
		super(aclService, router, _route, requestService, titleService);


	}

	ngOnInit() {		
	}

	close() {		
		this.activeModal.close();
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}	

	Replicate()
	{
		let selected =this.selection.selected;
		console.log(selected);
		this.activeModal.close({data:selected});
	}

	isAllSelected(): boolean {
		let totalRows = this.data.length;
		const numSelected = this.selection.selected.length;
		
		return numSelected === totalRows;
	}

	casesmasterToggle(): void {
		this.isAllSelected()
			? this.selection.clear()
			: this.data.forEach((row:any) => this.selection.select(row));
	}
}
