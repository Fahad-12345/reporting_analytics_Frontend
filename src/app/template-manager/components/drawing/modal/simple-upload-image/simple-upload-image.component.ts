import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { MainServiceTemp } from '../../../../services/main.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutService } from '../../../../services/layout.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WebcamImage } from 'ngx-webcam';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';

@Component({
	selector: 'app-simple-upload-image',
	templateUrl: './simple-upload-image.component.html',
	styleUrls: ['./simple-upload-image.component.css'],
	encapsulation: ViewEncapsulation.None,
})
export class DrawingUploadImageComponent implements OnInit {
	@Input() imageModal;
	@Input() openObject;
	@Input() originalRaw;
	fileData: File = null;
	previewUrl: any = null;
	oldFile: any = null;
	fileUploadProgress: string = null;
	uploadedFilePath: string[] = null;
	filePath: any = null;
	data = [];
	public webcamImage: any;
	modalRef: NgbModalRef;
	constructor(
		public mainService: MainServiceTemp,
		private toastrService: ToastrService,
		public layoutService: LayoutService,
		protected requestService: RequestService,
		public openModal: NgbModal,
	) {}
	ngOnInit() {
		if (this.openObject?.paths?.length) {
			this.data = this.openObject.data;
			this.previewUrl = this.originalRaw;
			this.uploadedFilePath = this.openObject.paths;
			}
	}

	fileProgress(fileInput: any) {
		if (fileInput.target.value != '') {
			this.filePath = fileInput.target.value;
			this.fileData = <File>fileInput.target.files[0];
			this.preview();
		}
	}

	preview() {
		var mimeType = this.fileData.type;
		if (mimeType.match(/image\/*/) == null) {
			return;
		}

		var reader = new FileReader();
		reader.readAsDataURL(this.fileData);
		reader.onload = (_event) => {
			this.previewUrl = reader.result;
			this.originalRaw = JSON.parse(JSON.stringify(this.previewUrl));
			this.data = [];
		};
	}
	public makeText() {
		for (let i = 0; i < this.layoutService.template.sections.length; i++) {
			for (let j = 0; j < this.layoutService.template.sections[i].dashboard.length; j++) {
				this.layoutService.template.sections[i].dashboard[j].obj.answers = [];
				if (this.layoutService.template.sections[i].dashboard[j].obj.type == UI_COMPONENT_TYPES.IMAGE_LABEL) {
					for (let k = 0; k < this.data.length; k++) {
						this.layoutService.template.sections[i].dashboard[j].obj.answers.push({
							answer: this.data[k].label,
						});
					}
				}
			}
		}

		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.uicomponent_name ==
					this.openObject.uicomponent_name
				) {
					this.layoutService.lastI = x;
				}
			}
		}
		for (
			let i = 0;
			i < this.layoutService.template.sections[this.layoutService.lastI].dashboard.length;
			i++
		) {
			if (
				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].obj.type ==
				UI_COMPONENT_TYPES.TEXT
			) {
				let arr =
					this.layoutService.template.sections[this.layoutService.lastI].dashboard[
						i
					].obj.statement.split(' ');
				for (let j = 0; j < arr.length; j++) {
					if (arr[j][0] == '@') {
						arr[j] = arr[j].replace('@', '');
						for (
							let k = 0;
							k < this.layoutService.template.sections[this.layoutService.lastI].dashboard.length;
							k++
						) {
							if (
								arr[j] ==
								this.layoutService.template.sections[this.layoutService.lastI].dashboard[k].obj
									.uicomponent_name
							) {
								let answer = '';
								for (
									let l = 0;
									l <
									this.layoutService.template.sections[this.layoutService.lastI].dashboard[k].obj
										.answers.length;
									l++
								) {
									answer =
										answer +
										this.layoutService.template.sections[this.layoutService.lastI].dashboard[k].obj
											.answers[l].answer +
										' ';
								}
								arr[j] = answer;
							}
						}
					}
				}

				this.layoutService.template.sections[this.layoutService.lastI].dashboard[i].obj[
					'instanceStatement'
				] = arr.join(' ');
				arr = [];
			}
		}
	}
	onSubmit() {
		if (this.fileData == null) {
			this.toastrService.success('Successfully uploaded!!');
			this.layoutService.imageObj = {
				paths: this.uploadedFilePath,
				data: this.data,
				raw: this.originalRaw,
			};
			this.imageModal.close();
		} else {
			this.layoutService.isLoaderPending.next(true);
			const formData = new FormData();
			formData.append('images', this.fileData, this.fileData.name);
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.uploadImage,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					formData,
				)
				.subscribe(
					(res: any) => {
						this.uploadedFilePath = res.data[0][0].images;
						this.toastrService.success('Successfully uploaded!!');
						this.layoutService.imageObj = {
							paths: this.uploadedFilePath,
							data: this.data,
							raw: this.originalRaw,
						};
						this.imageModal.close();
						this.layoutService.isLoaderPending.next(false);
					},
					(err) => {
						console.log(err);
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.layoutService.isLoaderPending.next(false);
					},
				);
		}

		if (this.layoutService.editorView == true) {
			this.makeText();
		}
	}

	openImageCapture(captureImage) {
		this.modalRef = this.openModal.open(captureImage, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
			windowClass: 'tm-modal-xl'
		});
	}
	handleImage(webcamImage: WebcamImage) {
		this.webcamImage = webcamImage;
		this.modalRef.close();
		this.fileData = this.dataURLtoFile(this.webcamImage.imageAsDataUrl, 'camera_upload.jpeg');

		this.previewUrl = this.webcamImage.imageAsDataUrl;
		this.originalRaw = JSON.parse(JSON.stringify(this.previewUrl));
	}
	dataURLtoFile(dataurl, filename) {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);

		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}

		return new File([u8arr], filename, { type: mime });
	}
}
