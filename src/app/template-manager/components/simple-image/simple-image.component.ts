import {
	Component,
	OnInit,
	ViewEncapsulation,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SimpleUploadImageComponent } from './modal/simple-upload-image/simple-upload-image.component';
import { SubjectService } from '../../services/subject.service';
import { LayoutService } from '../../services/layout.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Config } from '@appDir/config/config';


@Component({
	selector: 'app-simple-image',
	templateUrl: './simple-image.component.html',
	styleUrls: ['./simple-image.component.css'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleImageComponent implements OnInit {
	object: any = {};
	public showModal = false;
	subscription: any;
	public raw: any = [];
	constructor(
		public openModal: NgbModal,
		public layoutService: LayoutService,
		public cdr: ChangeDetectorRef,
		private config: Config,
		public subject: SubjectService,
	) {}

	ngOnInit() {
		this.subscription = this.subject.simpleImageRefresh.subscribe((res) => {
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
			const imageModal = this.openModal.open(SimpleUploadImageComponent, {
				size: 'lg',
				backdrop: 'static',
				keyboard: true,
				windowClass: 'tm-modal-xl'
			});
			imageModal.componentInstance.imageModal = imageModal;
			imageModal.componentInstance.openObject = JSON.parse(JSON.stringify(this.object));
			imageModal.componentInstance.originalRaw = this.raw;
			imageModal.result.then((result) => {
				if (result != 'cancel') {
					delete this.layoutService.imageObj.raw;
					this.object.paths = JSON.parse(JSON.stringify(this.layoutService.imageObj.paths));
					this.raw = [];
					for (let path of this.object.paths) {
						this.raw.push(this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + path);
					}
					this.cdr.markForCheck();
				}
			});
		} else {
			for (let path of this.object.paths) {
				this.raw.push(this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + path);
			}
		}
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
	openImage() {
		if (
			(this.object.selected_linked_ui_component != this.object.linked_ui &&
				!this.object.is_single_select) ||
			(!this.object.selected_linked_ui_component && this.object.linked_ui)
		) {
			return;
		}
		const imageModal = this.openModal.open(SimpleUploadImageComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
			windowClass: 'tm-modal-xl'
		});
		imageModal.componentInstance.imageModal = imageModal;
		imageModal.componentInstance.openObject = JSON.parse(JSON.stringify(this.object));
		imageModal.componentInstance.originalRaw = this.raw;
		imageModal.result.then((result) => {
			if (this.layoutService.imageObj && this.layoutService.imageObj.raw) {
				delete this.layoutService.imageObj.raw;
				this.object.paths = JSON.parse(JSON.stringify(this.layoutService.imageObj.paths));
				this.raw = [];
				for (let path of this.object.paths) {
					this.raw.push(this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + path);
				}

				this.cdr.markForCheck();
			} else {
				return;
			}
		});
		}
}
