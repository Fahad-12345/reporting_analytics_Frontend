import {
	Component,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Input,
	SimpleChanges,
	OnChanges
} from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { DocTypeEnum } from '@appDir/shared/signature/DocTypeEnum.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignatureListingComponent } from '@appDir/shared/signature/components/signature-listing/signature-listing.component';
import { SubjectService } from '../../services/subject.service';
import { signatureProperties } from '@appDir/template-manager/common/ui-props';
import { SignatureTypesArray, SIGNATURE_TYPES, UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';
import { SignatureModalComponent } from './modal/signature-modal/signature-modal.component';
import { cloneDeep } from 'lodash';

@Component({
	selector: 'app-templatesignature',
	templateUrl: './signature.component.html',
	styleUrls: ['./signature.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatureComponent implements OnInit, OnChanges {
	docSig = SIGNATURE_TYPES.DOCTOR_SIGNATURE;
	@Input() object: signatureProperties = {
		showSimpleTextProperties: false,
		hidePdf: 0,
		type: 'templatesignature',
		second_name: 'templatesignature',
		selectedSignature: SignatureTypesArray[0].name,
		displaySignatoryName: false,
		displayAtPageEnd: false,
		signatoryName: '',
		isStatement: true,
		alignment: 'center',
		instanceStatement: 'Your statement goes here! ',
		statement: 'Your statement goes here! ',
		textInput: ' ',
		answers: [],
		signature_type: SIGNATURE_TYPES.DOCTOR_SIGNATURE,
		signature_listing: [],
		signaturePoints: [],
		tags: [],
		signaturelink: null,
		uiBorders: false,
		leftUIBorder: 0,
		rightUIBorder: 0,
		topUIBorder: 0,
		bottomUIBorder: 0,
		uiPaddings: false,
		leftUIPadding: 0,
		rightUIPadding: 0,
		topUIPadding: 0,
		bottomUIPadding: 0,
		lineSpacing: false,
		lineSpacingValue: 15,
		bgColor: false,
		backgroundColor: '#ff0000',
		fontColor: false,
		fontColorCode: '#000000',
		fontFamily: false,
		fontFamilyValue: '',
		linked_ui: 0,
		selected_linked_ui_component: 0,
		previousSignature: false,
		signature_id: '',
		signature_path: '',
		signature: '',
		signatureLabel: 'Doctor Signature',
		errors: 0,
		underlineSignature: false,
		width: 50,
	};
	modalOpen = false
	subscription: any;
	// width: number = 700;
	// height: number = 190;

	constructor(
		public subject: SubjectService,
		private modalService: NgbModal,
		protected storageData: StorageData,
		private documentManagerService: DocumentManagerServiceService,
		public layoutService: LayoutService,
		public sanitizer: DomSanitizer,
		private signatureService: SignatureServiceService,
		public cdr: ChangeDetectorRef,
	
	) {}
	ngOnInit() {
		this.subscription = this.subject.signatureRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.object = res
					this.cdr.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		this.getSignatureInit();
		this.setSignatoryName();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.object && !changes.object.firstChange) {
			this.cdr.markForCheck();
		}
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	clearedSignature() {
		if (this.object.previousSignature) {
			return;
		}
		this.object.signature = null;
		this.object.signature_id = null;
		this.object.signaturePoints = null;
		this.object.answers = [];
		}
	
	setSignatoryName(){
		switch(this.object.signature_type) {
			case SIGNATURE_TYPES.DOCTOR_SIGNATURE: 
				this.object.signatoryName = this.layoutService.templateObj.provider_doctor_name
				break;
			case SIGNATURE_TYPES.PATIENT_SIGNATURE: 
				this.object.signatoryName = this.layoutService.templateObj.patient_name
				break;
			default:
				break;
		}
		
	}
	signatureChanged($event) {
		if ($event?.signature_file) {
			this.object.signature = $event;
			const reader = new FileReader();
			reader.onload = () => {
				this.object.answers = [
					{
						answer: reader.result.toString()
					}
				];
				this.layoutService.updateComponents()
			};
			reader.onerror = (error) => {
				console.log(error);
			};
			reader.readAsDataURL($event.signature_file);
		}
	}
	signaturePointsChanged($event) {
		this.object.signaturePoints = $event.points;
	}
	doctor_signature_listing: any[] = [];
	public async getSignatureInit() {
		const scheduler = this.storageData.getSchedulerInfo();
		if (this.object.signature_type==SIGNATURE_TYPES.DOCTOR_SIGNATURE && scheduler.template_instance.provider_id) {
			this.signatureService
				.getSignature(scheduler.template_instance.provider_id, DocTypeEnum.userSignature)
				.subscribe((data) => {
					this.object.signature_listing = data['result']['data']
				});
		}
		await this.layoutService.delay(300);
		this.layoutService.refreshObject(this.object);
	}
	chooseSignatures() {
		const scheduler = this.storageData.getSchedulerInfo();
		
		let modalRef = this.modalService.open(SignatureListingComponent);
		modalRef.componentInstance.selectable = true;
		modalRef.componentInstance.deletable = false;
		modalRef.componentInstance.signatures = this.object.signature_listing;
		modalRef.componentInstance.selectedId = scheduler.template_instance['doctor_signature_id'];
		// modalRef.componentInstance.signatures = this.doctor_signature_listing;
		// modalRef.componentInstance.selectedId = this.appointment['doctor_signature_id'];
		modalRef.componentInstance.onIdSelect = (data) => {
			modalRef.close();
			if (data) {
				this.object.signaturePoints = [];
				this.object.signaturelink = '';
				this.object.signature_id = data;
				this.object.signature = this.documentManagerService.getFileById(data, false);
			}
			if (this.object.signature_type === SIGNATURE_TYPES.DOCTOR_SIGNATURE) {
				this.layoutService.template.doctor_signature_id = data;				
			}
		    this.object.answers=[
				{
					answer: this.object.signature
				}
			];
			this.layoutService.refreshObject(this.object);

			this.cdr.detectChanges()
			
		};
	}

	editSignature(){
		this.modalOpen=true
		const sigModal = this.modalService.open(SignatureModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
			windowClass: 'tm-modal-xl'
		});
		sigModal.componentInstance.sigModal = sigModal;
		let tempObj= JSON.parse(JSON.stringify(this.object));
		tempObj.signaturePoints=[]
		tempObj.signaturelink=null
		tempObj.signature_id=null
		sigModal.componentInstance.object = tempObj;
		sigModal.result.then(async (result) => {
			if (result=='cancel') {
				this.modalOpen=false
				this.getSignatureInit();
				this.cdr.markForCheck();
				return
			} else {
				this.object.signature=result.signature
				this.object.signature_id=result.signature_id
				this.object.signaturePoints=result.signaturePoints
				this.object.signaturelink=result.signaturelink
				this.modalOpen=false
				this.signatureChanged(result.signature);
				this.cdr.markForCheck();
			}
		});
	}
}
