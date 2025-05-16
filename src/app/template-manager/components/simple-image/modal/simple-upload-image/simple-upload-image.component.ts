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

type imageItem = {
	name?: string
	extension?: string
	image: string | ArrayBuffer
}
@Component({
	selector: 'app-simple-upload-image',
	templateUrl: './simple-upload-image.component.html',
	styleUrls: ['./simple-upload-image.component.css'],
	encapsulation: ViewEncapsulation.None,
})
export class SimpleUploadImageComponent implements OnInit {
	@Input() imageModal;
	@Input() openObject;
	@Input() originalRaw: string;
	fileData: File = null;
	loadSpin = false;
	previewUrl: any = [];
	oldFile: any = null;
	fileUploadProgress: string = null;
	uploadedFilePath: string[] = [];
	filePath: string = null;
	data = [];
	items: imageItem[] = [];
	public webcamImage: any;
	modalRef: NgbModalRef;
	fileList = [];
	captureImageArr: any = [];
	capturedfiles: any = [];
	constructor(
		public mainService: MainServiceTemp,
		private toastrService: ToastrService,
		public layoutService: LayoutService,
		protected requestService: RequestService,
		public openModal: NgbModal,
	) {}
	ngOnInit() {
		if (this.openObject && this.openObject.path != '') {
			this.data = this.openObject.data;
			for (let item of this.originalRaw) {
				this.items.push({ image: item });
			}
			if (this.openObject && this.openObject.paths.length !== 0) {
				this.uploadedFilePath = this.openObject.paths;
			}
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
	async onFileChangedMultiple(e, is_from_drag_drop) {
		let files;

		if (is_from_drag_drop) {
			files = e.addedFiles;
		} else if (e.target) {
			files = e.target.files;
		} else {
			files = e;
		}

		const items_length = this.items.length;

		for (let i = 0; i < files.length; i++) {
			const reader = new FileReader();
			reader.readAsDataURL(files[i]);
			if (items_length + i === this.openObject.imageRange) {
				this.toastrService.error('Image Upload Range Exceeded!');
				return;
			}
			var that = this;
			reader.onload = function (event) {
				//Find index. If any slot between 0 to length of array is open then add image on that slot
				//set default index
				let index = items_length + 1 + i;
				//find empty slot between 0 to length of array
				//Get item in items array indexes
				let item_indexes = that.items.map((value, index) => index);
				//Generate array with 1...items left element with series range
				const range = Array.from({ length: that.items.length }, (_, i) => i + 1);
				let missing_index = range.filter((i) => {
					if (!item_indexes.includes(i)) {
						return i;
					}
				});
				if (missing_index.length > 0) {
					index = missing_index[0];
				}
				that.items.push({
					name: files[i].name,
					image: reader.result,
					extension: files[i].name.split('.').pop(),
				});

				that.fileList.push(files[i]);
			};

			}
	}
	removeMultipleSelectedFile(index) {
		this.items.splice(index, 1);
		this.fileList.splice(index, 1);
		this.uploadedFilePath.splice(index, 1);
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
		this.layoutService.updateComponents();
		}
	onSubmit() {
		this.layoutService.isLoaderPending.next(true);
		if (this.fileList == null) {
			this.toastrService.success('Successfully uploaded!!');
			this.layoutService.imageObj = {
				paths: this.uploadedFilePath,
				data: this.data,
				raw: this.items.map(item => item.image as string)
			};
			this.imageModal.close();
		} else {
			const formData = new FormData();
			for (let multiFiles in this.fileList) {
				formData.append('images', this.fileList[multiFiles]);
			}
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.uploadImage,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					formData,
				)
				.subscribe(
					(res: any) => {
						for (let image of res.data[0]) {
							this.uploadedFilePath.push(image['images']);
						}
						this.toastrService.success('Successfully uploaded!!');
						this.layoutService.imageObj = {
							paths: this.uploadedFilePath,
							data: this.data,
							raw: this.items.map(item => item.image as string)
						};
						this.loadSpin = false;
						this.layoutService.isLoaderPending.next(false);
						this.imageModal.close();
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
		this.captureImageArr = [];
		this.capturedfiles = [];
		this.captureImageArr.push(this.webcamImage);

		if (this.captureImageArr.length >= 1) {
			this.modalRef.close();
		}
		for (let i = 0; i < this.captureImageArr.length; i++) {
			this.fileData = this.dataURLtoFile(this.webcamImage.imageAsDataUrl, 'camera_upload.jpeg');

			this.previewUrl = this.webcamImage.imageAsDataUrl;
			this.originalRaw = JSON.parse(JSON.stringify(this.previewUrl));
		}

		this.previewUrl = this.webcamImage.imageAsDataUrl;
		this.originalRaw = JSON.parse(JSON.stringify(this.previewUrl));

		this.onFileChangedMultiple({ target: { files: [this.fileData] } }, false);
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
