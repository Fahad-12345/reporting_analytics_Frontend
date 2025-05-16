import { MainService } from '@appDir/shared/services/main-service';
import { SignatureURLEnum } from './../../SignatureURLEnums.enum';
import { CustomDiallogService } from './../../../services/custom-dialog.service';
import { Component, OnInit, Input, SimpleChange, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { SignatureServiceService } from '../../services/signature-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignatureViewComponent } from '../signature-view/signature-view.component';

@Component({
	selector: 'app-signature-listing',
	templateUrl: './signature-listing.component.html',
	styleUrls: ['./signature-listing.component.scss']
})
export class SignatureListingComponent implements OnInit {


	constructor(private documentManagerService: DocumentManagerServiceService, private signatureService: SignatureServiceService, 
		private customDiallogService: CustomDiallogService,
		 private modalService: NgbModal,
		 private mainService: MainService
		 ) {
	}
	@Input() signatures: any[]
	@Output() signaturesChange: EventEmitter<any> = new EventEmitter()
	@Input() selectable: boolean = false;
	@Input() selectedId: number;
	@Input() deletable: boolean = true;
	@Input() viewSummary: boolean = false;
	@Output() selectedIdChange: EventEmitter<any> = new EventEmitter();
	@Output() selectedUrlChange: EventEmitter<any> = new EventEmitter();
	@Input() onIdSelect: any;
	@Output() onDelete: EventEmitter<any> = new EventEmitter()
	@Output() closeModal: EventEmitter<any> = new EventEmitter()
	ngOnInit() {
	}

	close() {
		this.closeModal.emit(true);
		if(!this.viewSummary) {
			this.onIdSelect(null);
		}
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		if (simpleChanges.signatures) {
			// this.signatures = makeDeepCopyArray(this.signatures)
		}
	}
	remove(row) {
		debugger;
		this.customDiallogService.confirm('Delete Signature','Are you sure you want to delete this signature?','Yes','No')
		.then((confirmed) => {
			if (confirmed){

				this.signatureService.deleteSignature(row.id).subscribe(data => {
					this.signatures = this.signatures.filter(signature => row.id !== signature.id)
					this.signaturesChange.emit(this.signatures)
					this.onDelete.emit(row.id)
				})
			}
		})
		.catch();
		
	}
	view(row) {
		debugger;
		if (this.selectable) {
			this.mainService.openDocSingature(SignatureURLEnum.tempSingturUrlPreDefined,this.selectedId).subscribe(res=>{
				if (res && res.data && res.data){
				let link = res.data[0]?.pre_signed_url;
				let modalRef = this.modalService.open(SignatureViewComponent);
				modalRef.componentInstance.link = link
				modalRef.componentInstance.file_title = row.file_title;
				}	
			});
			// this.documentManagerService
			// this.documentManagerService.getFileById(row.id, false)
		
		}
		this.selectedIdChange.emit(row.id)
	}
	onChange(event, url) {
		this.selectedId = event
		this.selectedIdChange.emit(event);
		this.selectedUrlChange.emit(url);
		if(!this.viewSummary) {
			this.onIdSelect(event);
		}
	}
}
