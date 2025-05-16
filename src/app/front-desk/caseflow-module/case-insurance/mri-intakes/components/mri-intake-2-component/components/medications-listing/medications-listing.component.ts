import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';

import { Title } from '@angular/platform-browser';

import { ActivatedRoute, Router } from '@angular/router';

import { MriIntakeService } from '@appDir/front-desk/caseflow-module/case-insurance/mri-intakes/services/mri-intake-service';

import { MriIntake1 } from '@appDir/front-desk/fd_shared/models/Case.model';

import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';

import { Page } from '@appDir/front-desk/models/page';

import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';

import { AclService } from '@appDir/shared/services/acl.service';

import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';

import { RequestService } from '@appDir/shared/services/request.service';

import {
	getLoginUserObject,
	removeEmptyAndNullsFormObject,
	unSubAllPrevious,
} from '@appDir/shared/utils/utils.helpers';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ToastrService } from 'ngx-toastr';

import { DatatableComponent } from '@swimlane/ngx-datatable';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { MedicationComponent } from '../medication/medication.component';

import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'app-medications-listing',

	templateUrl: './medications-listing.component.html',

	//   styleUrls: ['./medications-listing.component.scss']
})
export class MedicationsListingComponent extends PermissionComponent implements OnInit,OnDestroy {
	caseId: number;

	allChecked: boolean = false;

	public selection = new SelectionModel<any>(true, []);

	page: Page = new Page();

	modalRef: NgbModalRef;

	mriIntake2MedicationData: any[] = [];

	@Output() hasListData = new EventEmitter();

	@Input() MriData;

	title: string;
	subscription:Subscription[] = [];

	constructor(
		titleService: Title,
		private route: ActivatedRoute,
		router: Router,
		public aclService: AclService,
		public mriIntakeService: MriIntakeService,
		public datePipeService: DatePipeFormatService,
		protected requestService: RequestService,
		public caseFlowService: CaseFlowServiceService,
		private modalService: NgbModal,
		public customDiallogService: CustomDiallogService,
	) {
		super(aclService, router, route, requestService, titleService);

		titleService.setTitle(this.route.snapshot.data['title']);
	}

	ngOnInit() {
		debugger;
		this.page.pageNumber = 1;
		this.page.size = 10;
		this.ForKnowMedicationHasBeenAddOrEdit();
	}

	ngOnChanges() {
		debugger;
		if(this.MriData && this.MriData.mri_intake_2 && this.MriData.mri_intake_2.medicines) {
			this.mriIntake2MedicationData = this.MriData.mri_intake_2.medicines;
			if (this.mriIntake2MedicationData.length > 0) {
				this.hasListData.emit(false);
			} else {
				this.hasListData.emit(true);
			}
		}
	}

	createQueryParam(obj?): ParamQuery {
		let data = removeEmptyAndNullsFormObject(obj);
		return {
			...{
				filter: false,
				order: this.page.order ? this.page.order : OrderEnum.ASC,
				page: this.page.pageNumber,
				pagination: true,
				per_page: this.page.size,
				column: this.page.column,
			},
			...data,
		};
	}

	onPageChange(event) {
		debugger;
		this.page.pageNumber = event.offset + 1;
		this.deSelectOnPageChangeOrEntries();
	}

	pageSizeChange(event) {
		debugger;
		this.page.size = event.target.value;
		this.page.pageNumber = 1;
		this.deSelectOnPageChangeOrEntries();
	}

	getAllVisits() {
		this.startLoader = true;
	}

	allSelected(e) {
		debugger;
		let start = this.page.size * (this.page.pageNumber - 1);
		let record_page_end = start + this.page.size;
		if (e.checked) {
			this.selection.clear();
			for (let i = start; i < record_page_end; i++) {
				if (this.mriIntake2MedicationData[i]) {
					this.mriIntake2MedicationData[i].is_checked = true;
					this.selection.select(this.mriIntake2MedicationData[i]);
				} else {
					return;
				}
			}
		} else {
			this.selection.clear();
			for (let i = start; i < record_page_end; i++) {
				if (this.mriIntake2MedicationData[i]) {
					this.mriIntake2MedicationData[i].is_checked = false;
					this.selection.deselect(this.mriIntake2MedicationData[i]);
				} else {
					break;
				}
			}
		}
	}

	getRecordsOnSinglePage() {
		let checked_count = 0;

		let start = this.page.size * (this.page.pageNumber - 1);

		let record_page_end = start + this.page.size;

		for (let i = start; i < record_page_end; i++) {
			if (this.mriIntake2MedicationData[i]) {
				checked_count += 1;
			} else {
				return checked_count;
			}
		}

		return checked_count;
	}

	filterTheCPTCode(row: any[], filterId: number) {
		return row && row.filter((d) => d.code_type_id && d.code_type_id === filterId);
	}

	sorting({ sorts }) {
		this.page.column = sorts[0].prop;

		this.page.order = sorts[0].dir;
	}

	onChecked(event, row) {
		debugger;
		let record_on_page = this.getRecordsOnSinglePage();
		this.selection.toggle(row);
		if (record_on_page == this.selection.selected.length) {
			this.allChecked = true;
		} else {
			this.allChecked = false;
		}
	}

	deSelectOnPageChangeOrEntries() {
		this.allChecked = false;
		this.selection.clear();
	}

	AddEditMedicationModal() {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',

			keyboard: false,

			// size: '',

			windowClass: 'modal_extraDOc',
		};

		this.modalRef = this.modalService.open(MedicationComponent, ngbModalOptions);

		this.modalRef.componentInstance.data = null;

		this.modalRef.componentInstance.caseId = this.caseId;

		this.modalRef.componentInstance.mri_intake_id = null;

		this.modalRef.result.then((data: any) => {
			debugger;
			this.mriIntake2MedicationData = this.mriIntakeService.getMriIntake_2_object() && this.mriIntakeService.getMriIntake_2_object().medicines ? this.mriIntakeService.getMriIntake_2_object().medicines : [];

			debugger;

			if (data) {
				// this.reEvaluateForm();
			} else {
				// this.reEvaluateForm();
			}
		});
	}

	editDeleteMedication(singleMedication?, index?, action?) {
		if (action == 'delete') {
			this.customDiallogService
				.confirm('Are you Sure', 'This will delete existing information?')
				.then((confirmed) => {

					if (confirmed) {
						let medicationDeleteObject = this.getDeletetionMedicationObject([singleMedication.id]);
						this.caseFlowService
							.deleteIntake_2_Medication(medicationDeleteObject)
							.subscribe((res) => {
								this.getUpdatedMedicationsLists();
							});
					}
				})

				.catch();
		}

		if (action == 'edit') {
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',

				keyboard: false,

				// size: '',

				windowClass: 'modal_extraDOc',
			};

			this.modalRef = this.modalService.open(MedicationComponent, ngbModalOptions);

			this.modalRef.componentInstance.singleMedicationObject = {
				...singleMedication,
				index: index,
			};

			this.modalRef.result.then((data: any) => {
				debugger;

				if (data) {
					// this.reEvaluateForm();
				} else {
					// this.reEvaluateForm();
				}
			});
		}
	}

	getDeletetionMedicationObject(medication_ids) {
		let medicationDeleteObject = {
			medication_ids: medication_ids,

			to_delete: 'medication',

			user_id: getLoginUserObject().id,
		};

		return medicationDeleteObject;
	}

	deleteAllSelectionMedications() {
		debugger;
		if (this.selection.selected.length == this.mriIntake2MedicationData.length) {
			this.customDiallogService

				.confirm('Are you Sure', 'This will delete existing information?')

				.then((confirmed) => {
					debugger;

					this.MriData;

					if (confirmed) {
						let medication_ids = this.selection.selected.map((x) => x.id);

						let medicationDeleteObject = this.getDeletetionMedicationObject(medication_ids);

						delete medicationDeleteObject['medication_ids'];

						medicationDeleteObject['mri_intake_2_id'] = this.MriData && this.MriData.mri_intake_2 && this.MriData.mri_intake_2.id ? this.MriData.mri_intake_2.id : this.mriIntakeService.getMriIntake_2_object().id;

						this.caseFlowService
							.deleteIntake_2_Medication(medicationDeleteObject)
							.subscribe((res) => {
								debugger;

								this.getUpdatedMedicationsLists();
							});
					}
				})

				.catch();
		} else {
			debugger;

			this.customDiallogService

				.confirm('Are you Sure', 'This will delete existing information?')

				.then((confirmed) => {
					if (confirmed) {
						let medication_ids = this.selection.selected.map((x) => x.id);

						let medicationDeleteObject = this.getDeletetionMedicationObject(medication_ids);

						this.caseFlowService
							.deleteIntake_2_Medication(medicationDeleteObject)
							.subscribe((res) => {
								debugger;

								this.getUpdatedMedicationsLists();
							});
					}
				})

				.catch();
		}
	}

	getUpdatedMedicationsLists() {
		this.MriData;

		debugger;

		// let getCaseId =
		let case_id;
		if(this.MriData && this.MriData.case_id || this.mriIntakeService.getCase_id()) {
			case_id = this.MriData && this.MriData.case_id ? this.MriData.case_id : this.mriIntakeService.getCase_id()
		}
		 
		this.caseFlowService.getUpdatedMedicationsLists(case_id).subscribe((res) => {
			debugger;
			this.selection.selected.length = 0;
			this.mriIntake2MedicationData =  res && res.result && res.result.data && res.result.data.medicines ? res.result.data.medicines : [];
			this.mriIntakeService.setMriIntake_2_object(res.result.data);
			this.allChecked = false;
			if (this.mriIntake2MedicationData.length > 0) {
				this.hasListData.emit(false);
			} else {
				this.hasListData.emit(true);
			}
		});
	}

	ForKnowMedicationHasBeenAddOrEdit() {
		this.subscription.push(
			this.mriIntakeService.ForKnowMedicationHasBeenAddOrEdit.subscribe((res) => {
				if (res) {
						this.getUpdatedMedicationsLists();
				}
			})
		)
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
