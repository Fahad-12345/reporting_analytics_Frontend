import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadImageComponent } from './modal/upload-image/upload-image.component';
import { LayoutService } from '../../services/layout.service';
import { SubjectService } from '../../services/subject.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { cloneDeep } from 'lodash';
import { Config } from '@appDir/config/config';
import { fabric } from "fabric";
import { FABRIC_OBJECT_PROPS } from '@appDir/template-manager/common/constants';
import { imageLabelProperties } from '@appDir/template-manager/common/ui-props';


@Component({
	selector: 'app-image',
	templateUrl: './image.component.html',
	styleUrls: ['./image.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent implements OnInit {
	object: imageLabelProperties = null;
	public showModal = false;
	subscription: any;
	public raw: any;
	constructor(
		public openModal: NgbModal,
		public layoutService: LayoutService,
		public cdr: ChangeDetectorRef,
		private config: Config,
		public subject: SubjectService,
	) {}
	base64Img: any = '';

	ngOnInit() {
		this.subscription = this.subject.imageRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.cdr.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
		this.showModal = true;
		if (!this.object.paths[0] && this.object.firstTime) {
			this.object.firstTime = false;
			const imageModal = this.openModal.open(UploadImageComponent, {
				size: 'lg',
				backdrop: 'static',
				keyboard: true,
				windowClass: 'tm-modal-xl'
			});
			imageModal.componentInstance.imageModal = imageModal;
			imageModal.componentInstance.openObject = JSON.parse(JSON.stringify(this.object));
			imageModal.componentInstance.originalRaw = JSON.parse(JSON.stringify(this.base64Img));
			imageModal.result.then(async (result) => {
				if (result != 'cancel') {
					this.base64Img = JSON.parse(JSON.stringify(this.layoutService.imageObj.raw));
					delete this.layoutService.imageObj.raw;
					this.object.paths = JSON.parse(JSON.stringify(this.layoutService.imageObj.paths));
					this.object.data = JSON.parse(JSON.stringify(this.layoutService.imageObj.data));
					this.object.tags = [];
					for (let x = 0; x < this.layoutService.template.sections.length; x++) {
						for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
							if (
								this.layoutService.template.sections[x].dashboard[r].obj.uicomponent_name ==
								this.object.uicomponent_name
							) {
								let temp = cloneDeep(this.layoutService.template.sections[x].dashboard[r]);
								this.layoutService.template.sections[x].dashboard[r] = {};
								this.layoutService.template.sections[x].dashboard[r] = temp;
								break;
							}
						}
					}
					this.cdr.markForCheck();
				}
			});
		} else {
			this.raw = this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + this.object.paths[0];
			var self = this;

			const xhr = new XMLHttpRequest();
			xhr.open('GET', this.raw);
			xhr.responseType = 'blob';
			xhr.send();
			xhr.addEventListener(
				'load',
				function () {
					var reader = new FileReader();
					reader.readAsDataURL(xhr.response);
					reader.addEventListener(
						'loadend',
						async function () {
							self.base64Img = reader.result;
							self.cdr.markForCheck();
						},
						{ passive: true },
					);
				},
				{ passive: true },
			);
		}
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
	imageLableClear() {
		for (let point of this.object.data) {
			point.text = '';
		}
	}
	openImage() {
		if (
			(this.object.selected_linked_ui_component != this.object.linked_ui &&
				!this.object.is_single_select) ||
			(!this.object.selected_linked_ui_component && this.object.linked_ui)
		) {
			return;
		}
		const imageModal = this.openModal.open(UploadImageComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
			windowClass: 'tm-modal-xl'
		});
		imageModal.componentInstance.imageModal = imageModal;
		imageModal.componentInstance.openObject = JSON.parse(JSON.stringify(this.object));
		imageModal.componentInstance.originalRaw = JSON.parse(JSON.stringify(this.base64Img));
		imageModal.result.then(async (result) => {
			if (this.layoutService.imageObj && this.layoutService.imageObj.raw) {
				this.base64Img = JSON.parse(JSON.stringify(this.layoutService.imageObj.raw));
				delete this.layoutService.imageObj.raw;
				this.object.paths = JSON.parse(JSON.stringify(this.layoutService.imageObj.paths));
				this.object.data = JSON.parse(JSON.stringify(this.layoutService.imageObj.data));
				this.object.tags = [];
				for (let x = 0; x < this.layoutService.template.sections.length; x++) {
					for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
						if (
							this.layoutService.template.sections[x].dashboard[r].obj.uicomponent_name ==
							this.object.uicomponent_name
						) {
							let temp = cloneDeep(this.layoutService.template.sections[x].dashboard[r]);
							this.layoutService.template.sections[x].dashboard[r] = {};
							this.layoutService.template.sections[x].dashboard[r] = temp;
							break;
						}
					}
				}
				this.cdr.markForCheck();
			} else {
				return;
			}
		});
	}
}
