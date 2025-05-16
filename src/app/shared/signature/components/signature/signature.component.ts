import { SignatureURLEnum } from './../../SignatureURLEnums.enum';
import { ActivatedRoute } from '@angular/router';
import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
} from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
// import { SignaturePadComponent } from '@ng-plus/signature-pad';
import { MainService } from '@appDir/shared/services/main-service';
import { isSameLoginUser } from '@appDir/shared/utils/utils.helpers';
import { Subscription } from 'rxjs';
import SignaturePad from '@appDir/shared/singature-module/siganture-ts/signature_pad';

@Component({
	selector: 'app-signature',
	templateUrl: './signature.component.html',
	styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild(SignaturePad) component: SignaturePad;
	@Input() editable: boolean = true;
	@Input() showButtons: boolean = true;
	@Input() editPad: boolean = true;
	@Input() signature: any;
	@Input() signatures: any = [];
	@Output() signatureChange = new EventEmitter();
	@Output() signatureCleared = new EventEmitter();
	@Output() signaturePointsChanged = new EventEmitter();
	file_title: string = '';
	file_title_touched = false;
	isDisabledTemplateFormControl = false;
	@Input() hide_title: boolean = false;
	@Input() selectedId: number;
	@Output() selectedIdChange: EventEmitter<any> = new EventEmitter();
	@Input() link: string;
	@Input() signaturePoint: any[] = [];
	@Input() width: number = 700;
	@Input() height: number = 190;
	userId;
	subscriptions: Subscription[] = [];
	constructor(
		public mainService: MainService,
		private toastrService: ToastrService,
		private route: ActivatedRoute,
		private documentManagerService: DocumentManagerServiceService,
		private cdr:ChangeDetectorRef
	) {}

	clearButtonText: string = 'clear';
	isLoading: boolean = false;
	ngOnInit() {
		this.signatureChange.emit({});
	}
	ngOnDestroy() {
		this.subscriptions.forEach((sub) => {
			sub.unsubscribe();
		});
	}
	ngAfterViewInit() {
		if(this.route?.parent?.snapshot?.params?.id){
			this.userId = this.route.parent.snapshot.params.id;
			if (isSameLoginUser(this.userId)) {
				this.isDisabledTemplateFormControl = true;
			}
			// console.log(this.component, this.component['signaturePad']['_isEmpty'])
		}
	}
	clearLink() {
		// this.hide_title = false;
		this.link = null;
		this.selectedIdChange.emit(null);
	}
	ngOnChanges(simpleChanges: SimpleChanges) {
		if (simpleChanges.signatures && this.showButtons) {
			this.link = '';
		}
		if (simpleChanges.selectedId && this.selectedId) {
			debugger;
			var subscription = this.mainService
				.openDocSingature(SignatureURLEnum.tempSingturUrlPreDefined, this.selectedId)
				.subscribe((res) => {
					if (res && res.data) {
						this.link = res?.data[0]?.pre_signed_url;
						let signature = this.signatures.find((row) => row.id === this.selectedId);
						this.file_title = signature ? signature.file_title : this.file_title;
						if (!this.hide_title) {
							this.selectedId = null;
							this.selectedIdChange.emit(null);
						}
						this.cdr.detectChanges()
					}
				});
			this.subscriptions.push(subscription);
		}

		if (simpleChanges.signature && this.signature == null) {
			this.resetSignatureBox();
		}
		this.signaturePointsChanged.emit({ points: this.signaturePoint });
	}
	event: any;
	onClick() {
		this.isLoading = true;
	}
	done($event, skipEmpty: boolean = false) {
		this.selectedId = null;
		let isEmpty =
			this.component &&
			this.component['signaturePad'] &&
			this.component['signaturePad']['_isEmpty'];
		if (skipEmpty || !isEmpty) {
			this.event = $event;

			this.signatureChange.emit({ signature_file: $event, file_title: this.file_title });
		} else {
			// if (isEmpty) {
			// 	this.file_title = '';
			// }
			this.event = null;
			this.signatureChange.emit({ signature_file: null, file_title: this.file_title });
		}

		this.isLoading = false;

		this.signaturePointsChanged.emit({ points: this.signaturePoint });

		// console.log(this.component, this.component['signaturePad']['_isEmpty'])
	}
	onTitleChange(event) {
		this.signatureChange.emit({ signature_file: this.event, file_title: this.file_title });
		this.signaturePointsChanged.emit({ points: this.signaturePoint });
	}
	focusTitle() {
		this.file_title_touched = true;
	}
	onFileChange(event) {
		let file = event.target.files[0];
		this.readURL(file);
		event.target.value = '';
	}

	readURL(file: File) {
		if (file) {
			var reader = new FileReader();

			reader.onload = (e) => {
				// $('#blah').attr('src', e.target.result);

				this.link = e.target['result'] as any;
			};

			reader.readAsDataURL(file); // convert to base64 string
			let that = this;
			{
				let reader = new FileReader();
				reader.onload = function (e) {
					let blob = new Blob([new Uint8Array(e.target['result'] as any)], { type: file.type });
					that.done(blob, true);
				};
				reader.readAsArrayBuffer(file);
			}
		}
		this.signaturePointsChanged.emit({ points: this.signaturePoint });
	}
	onClear() {
		if (!this.signaturePoint.length) {
			this.signatureCleared.emit();
			this.signatureChange.emit({});
			this.file_title = '';
		} else {
			this.signatureCleared.emit();
			this.signatureChange.emit({ signature_file: null, file_title: this.file_title });
		}
		this.signaturePointsChanged.emit({ points: this.signaturePoint });
	}

	showSignature: boolean = true;
	resetSignatureBox() {
		this.showSignature = false;
		setTimeout(() => {
			this.showSignature = true;
		}, 100);
		this.file_title = '';
		this.signaturePointsChanged.emit({ points: this.signaturePoint });
	}
}
