import { CustomDiallogService } from './../../../../shared/services/custom-dialog.service';
import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { BillingService } from '../../service/billing.service';
import { ToastrService } from 'ngx-toastr';
// import { DocumentManagerServiceService } from '@appDir/shared/components/document-manager/services/document-manager-service.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { FolderModel } from '@appDir/front-desk/documents/Models/FolderModel.Model';
import { PdfViewerComponent } from '@appDir/shared/pdf-viewer/components/pdf-viewer/pdf-viewer.component';
import { MainService } from '@shared/services/main-service';
import { SignatureURLEnum } from './../../../../shared/signature/SignatureURLEnums.enum';
@Component({
	selector: 'app-visit-document-listing',
	templateUrl: './visit-document-listing.component.html',
	styleUrls: ['./visit-document-listing.component.scss']
})
export class VisitDocumentListingComponent extends PermissionComponent implements OnInit {
	@Input() folder: FolderModel;
	@Input() shareVisitDesk;
	@Input() editRecord;
	@Input() form:FormGroup;
	@Output() getCurrentRecords = new EventEmitter();
	page: Page = new Page()
	public emailForm: FormGroup;
	folderId: number
	userEmail: string;
	Selection = new SelectionModel<Element>(true, []);
	constructor(private modalService: NgbModal, private fb: FormBuilder, private storageData: StorageData,
		private billingService: BillingService, private toastrService: ToastrService,
		private documentManagerService: DocumentManagerServiceService,
		private customDiallogService: CustomDiallogService,
		private mainService:MainService,
		private fd_services: FDServices,) {
		super()
		this.page.pageNumber = 1;
		this.page.size = 10;
	}
	 @Input() files: any[] = [];
	addTagForm: FormGroup;
	modalRef: NgbModalRef;
	disableBtn: boolean = false;
	totalRows: number;
	@Input() visitFileValue:boolean = false;
	ngOnInit() {

		this.userEmail = this.storageData.getEmail();
		this.initializeEmailForm();
		this.setTagForm();

	}

	ngAfterViewInit(): void {

			
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		debugger;
	if (simpleChanges && simpleChanges.folder && this.folder) {
		this.folderId = this.folder.id
		if (!this.folder.files || !this.folder.files.length) {
			this.getfilesByfolderId(this.folderId);			
			}
		}
	}

	masterToggle() {
		this.isSelected()
			? this.Selection.clear()
			: this.files
				.slice(0, this.totalRows)
				.forEach((row) => this.Selection.select(row));
	}
	isSelected() {
		this.totalRows = this.files.length;
		const numSelected = this.Selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	getfilesByfolderId(id) {
		this.startLoader = true;
		debugger;
		let visit_id = this.shareVisitDesk && this.shareVisitDesk.visit_session_id?this.shareVisitDesk.visit_session_id:
		( this.editRecord && this.editRecord.visit_session_id?this.editRecord.visit_session_id:null);
		if (visit_id==null || visit_id==''){
			return false;
		}
		else {
		this.documentManagerService.getFilesFromFolderId(id, this.page.size, this.page.pageNumber, [],visit_id).subscribe(res => {
			this.startLoader = false;
			this.files = [...res['data']];
			this.page.totalElements = res['count'];
			if (this.visitFileValue){
				this.getCurrentRecords.emit([...this.files]);
			}
		})
	 }
	}
	changeDocumentPageSize(event) {
		this.page.pageNumber=1;
		this.page.size = event
		this.Selection.clear();
		this.getfilesByfolderId(this.folderId)
	}
	changeDocumentPageNumber(number) {
		this.page.pageNumber = number + 1;
		this.Selection.clear();
		this.getfilesByfolderId(this.folderId)
	}
	openInWindow(url) {
		return `${url}&&authorization=Bearer ${this.storageData.getToken()}`;
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
	}
	initializeEmailForm() {
		this.emailForm = this.fb.group({
			fileIds: [''],
			to: ['', [Validators.required, Validators.email]],
			message: ['', [Validators.required, Validators.minLength(10)]],
		});
	}

	deletesinglVistDoc(row,status?){
		let fileIds = [row.id]
		this.customDiallogService
			.confirm('Delete File', 'Do you really want to delete this file?')
			.then((confirmed) => {
				if (confirmed) {
					this.page.pageNumber = 1;
					this.deleteFilesOrFilders({ids:fileIds,visit_flow:status??false});
				}
			})
			.catch();	
	}

	deleteDocuments(){
		let fileIds = this.Selection.selected.map(m => m.id);
		this.customDiallogService
			.confirm('Delete File', 'Do you really want to delete this file?')
			.then((confirmed) => {
				if (confirmed) {
					this.page.pageNumber = 1;
					this.deleteFilesOrFilders({ids:fileIds});
				}
			})
			.catch();

	}

	deleteFilesOrFilders(requestData) {
		debugger;
	    if (this.form.value.visit_session_state_id!=this.editRecord.visit_session_state_id){
			this.toastrService.error('File cannot be deleted, because the status is saved as Finalized or Bill Created.For deletion, first change the status and update it', 'Error');
			return false;
		}
		if (this.editRecord &&  (this.editRecord.visit_session_state_id===3 || this.editRecord.visit_session_state_id===2) && (this.files.length==1 
		  || this.Selection.selected.length=== 	this.page.totalElements)
			){
			this.toastrService.error('At least 1 File is required in Finalized or Bill Created Visit', 'Error');
			return false;
		}
		this.documentManagerService.deleteDocument(requestData).subscribe(res => {
			if (res['status'] == true) {
				this.Selection.clear();
				this.visitFileValue=true;
				debugger;
				this.getfilesByfolderId(this.folderId);

			}
		}, err => {

			})

	}
	openEmailModal = (content, row?): void => {
		let fileIds = this.Selection.selected.map(m => m.id)
		this.emailForm.reset();
		row ? this.emailForm.get('fileIds').setValue(row.id) : this.emailForm.get('fileIds').setValue(fileIds)
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc doc-modal'
		};
		this.modalRef = this.modalService.open(content, ngbModalOptions);
	}
	onSubmitEmailForm(emailForm) {
		this.disableBtn = true;
		let requestData = {
			'to': emailForm.to,
			'message': emailForm.message,
			'fileIds': emailForm.fileIds && emailForm.fileIds.length > 0 ? emailForm.fileIds : [emailForm.fileIds],
		};
		this.documentManagerService.emailDocument(requestData).subscribe(response => {
			if (response) {
				// this.startLoader = false;
				this.Selection.clear();
				this.disableBtn = false;
				this.toastrService.success('Successfully Sent', 'Success');
				this.modalRef.close();
			}
		})
	}
	printMultipleFiles() {
		this.startLoader = true
		let printids = this.Selection.selected.map(m => m['id'])
		this.documentManagerService.printFiles({ fileIds: printids }).subscribe(res => {
			if (res) {
				// window.open(res['data'])
				window.open(res['data'], '_blank', 'location=yes,height=770,width=720,scrollbars=yes,status=yes');
				this.Selection.clear();
				this.startLoader = false
			}
		})
	}
	/**
	* set tag form
	*/
	setTagForm() {
		this.addTagForm = this.fb.group({
			id: '',
			tags: [],
		});
	}
	/**
	   * open tag modal
	   */
	addTagModal = (file, content): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_extraDOc doc-modal'
		};
		var tags = []
		if (file.tags) {

			tags = file.tags.split(',')
		}
		this.addTagForm['controls']['id'].setValue(file.id);
		this.addTagForm['controls']['tags'].setValue(tags);
		this.modalRef = this.modalService.open(content, ngbModalOptions);
	}

	/**
	  * submit tag form
	  * @param form 
	  */
	onSubmitAddTag(form) {
		if (this.addTagForm.valid) {
			let formValue = this.addTagForm.getRawValue();
			var tagsStr = '';
			this.disableBtn = true;
			if (formValue.tags.length) {
				var i = 0;
				for (let tag of formValue.tags) {
					let comma = i > 0 ? ',' : '';
					if (typeof (tag) == 'object') {
						tagsStr = tagsStr + comma + tag.display;
					} else {
						tagsStr = tagsStr + comma + tag;
					}
					i++;
				}

			}
			setTimeout(() => {
				this.addnewtag ? tagsStr = tagsStr ? tagsStr + ',' + this.addnewtag : this.addnewtag : tagsStr
				formValue['tags'] = tagsStr;
				this.addnewtag = '';
				this.documentManagerService.editDocument(formValue).subscribe(res => {
					if (res.status == true) {
						this.getfilesByfolderId(this.folderId)
						this.addTagForm.reset();
						this.modalRef.close();
						this.toastrService.success('Tags Updated Successfully', 'Success');
					}
					this.disableBtn = false;
				}, err => {
					this.toastrService.error(err.error.error.message, 'Error')
				})
			}, 1000);
		}
		//  else {
		//   this.disableBtn = false;
		//   this.fd_services.touchAllFields(this.addTagForm);
		// }
	}
	addnewtag: any
	onTextChange(event) {
		if (event) {
			let tags = this.addTagForm.get('tags').value
			let match = tags && tags.length > 0 ? tags.find(res => { event == res }) : ''
			!match ? this.addnewtag = event : this.addnewtag = ''
		}
	}
	viewPdf(row) {
		if (row && row.ext ==='pdf'){
					let linkOpen = (row.pre_signed_url);
					 window.open(linkOpen, '_blank', 'location=yes,height=770,width=720,scrollbars=yes,status=yes');
					}
					else {
						this.mainService.openDocSingature(SignatureURLEnum.tempSingturUrlPreDefined,row.id).subscribe(res=>{
							if (res && res.data ){
								let link = res?.data[0]?.pre_signed_url;
								window.open(link, '_blank');
						}
					});
					}
				}
}
