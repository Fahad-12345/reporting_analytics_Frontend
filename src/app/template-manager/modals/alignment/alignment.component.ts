import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { SubjectService } from '../../services/subject.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-alignment',
	templateUrl: './alignment.component.html',
	styleUrls: ['./alignment.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class AlignmentComponent implements OnInit {
	constructor(
		public layoutService: LayoutService,
		public subjectService: SubjectService,
		protected storageData: StorageData,
		protected requestService: RequestService,
		public sanitizer: DomSanitizer,
		public changeDetector: ChangeDetectorRef,
	) {}

	headerFooterObj(res, previousCheck) {
		this.layoutService.defaultHeadersObject = [];
		this.layoutService.defaultFootersObject = [];
		let headerCheck = false;
		let footerCheck = false;
		for (let tempHeader of res.data[0].headers) {
			if (!this.layoutService.header) {
				this.layoutService.headerIndex = 0;
				this.layoutService.header = tempHeader;
			}
			this.layoutService.defaultHeadersObject.push(tempHeader);
			headerCheck = true;
		}
		for (let tempHeader of res.data[0].footers) {
			if (!this.layoutService.footer) {
				this.layoutService.footerIndex = 0;
				this.layoutService.footer = tempHeader;
			}
			this.layoutService.defaultFootersObject.push(tempHeader);
			headerCheck = true;
		}
		if (!this.layoutService.header) {
			this.layoutService.defaultHeaderMarginLeft = 5;
			this.layoutService.defaultHeaderMarginRight = 5;
		} else {
			if (!previousCheck) {
				this.layoutService.defaultHeaderMarginLeft = this.layoutService.header.headerMarginLeft;
				this.layoutService.defaultHeaderMarginRight = this.layoutService.header.headerMarginRight;
			}
		}
		if (!this.layoutService.footer) {
			this.layoutService.defaultFooterMarginLeft = 5;
			this.layoutService.defaultFooterMarginRight = 5;
		} else {
			if (!previousCheck) {
				this.layoutService.defaultFooterMarginLeft = this.layoutService.footer.headerMarginLeft;
				this.layoutService.defaultFooterMarginRight = this.layoutService.footer.headerMarginRight;
			}
		}
		let headerMarginLeft = 0;
		let headerMarginRight = 0;
		let footerMarginLeft = 0;
		let footerMarginRight = 0;
		if (!this.layoutService.header) {
			headerMarginLeft = 10;
			headerMarginRight = 10;
		} else {
			headerMarginLeft = this.layoutService.defaultHeaderMarginLeft;
			headerMarginRight = this.layoutService.defaultHeaderMarginRight;
		}
		if (!this.layoutService.footer) {
			footerMarginLeft = 10;
			footerMarginRight = 10;
		} else {
			footerMarginLeft = this.layoutService.defaultFooterMarginLeft;
			footerMarginRight = this.layoutService.defaultFooterMarginRight;
		}

		this.object.height = this.layoutService.template.pageSize.height;
		this.object.width = this.layoutService.template.pageSize.width;
		this.object.header = this.layoutService.header;
		this.object.headerIndex = this.layoutService.headerIndex;
		this.object.footer = this.layoutService.footer;
		this.object.footerIndex = this.layoutService.footerIndex;
		this.object.pdfMarginTop = this.layoutService.template.pdfMarginTop;
		this.object.pdfMarginBottom = this.layoutService.template.pdfMarginBottom;
		this.object.pdfMarginLeft = this.layoutService.template.pdfMarginLeft;
		this.object.pdfMarginRight = this.layoutService.template.pdfMarginRight;
		this.object.headerMarginLeft = headerMarginLeft;
		this.object.footerMarginLeft = footerMarginLeft;
		this.object.headerMarginRight = headerMarginRight;
		this.object.footerMarginRight = footerMarginRight;
		this.object.selectedOption = this.layoutService.selectedOption;
	}

	ngOnInit() {
		const scheduler = this.storageData.getSchedulerInfo();
		let templateObj = scheduler.template_instance;
		if (!templateObj) {
			templateObj = {};
		}
		let previousCheck = false;
		if (this.layoutService.defaultHeaderMarginLeft) {
			previousCheck = true;
		}
		if (this.layoutService.isInstancePreview && this.layoutService.isShowEditor) {
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.headerFooterFilter,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					{
						speciality_id: this.layoutService.specSelectedMultiple,
						location_id: this.layoutService.clinicSelectedMultiple,
						case_type_id: this.layoutService.caseTypeSelectedMultiple,
						visit_type_id: this.layoutService.visitStatusSelectedMultiple,
					},
				)
				.subscribe((res: any) => {
					this.headerFooterObj(res, previousCheck);
				});
		} else {
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.getUserHeaderFooters,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					{
						location_id: templateObj.location_id || 35,
						speciality_id: templateObj.speciality_id || 1,
						visit_type_id: templateObj.appointmentTypeId || 1,
						case_type_id: templateObj.case_type_id || 1,
					},
				)
				.subscribe((res: any) => {
					this.headerFooterObj(res, previousCheck);
				});
		}
	}
	public resetModel() {
		this.layoutService.alignmentModal.close(1);
		}
	public cancelModel() {
		this.layoutService.template.pageSize.height = this.object.height;
		this.layoutService.template.pageSize.width = this.object.width;
		this.layoutService.header = this.object.header;
		this.layoutService.headerIndex = this.object.headerIndex;
		this.layoutService.footer = this.object.footer;
		this.layoutService.footerIndex = this.object.footerIndex;
		this.layoutService.template.pdfMarginTop = this.object.pdfMarginTop;
		this.layoutService.template.pdfMarginBottom = this.object.pdfMarginBottom;
		this.layoutService.template.pdfMarginLeft = this.object.pdfMarginLeft;
		this.layoutService.template.pdfMarginRight = this.object.pdfMarginRight;

		this.layoutService.defaultHeaderMarginLeft = this.object.headerMarginLeft;
		this.layoutService.defaultHeaderMarginRight = this.object.headerMarginRight;
		this.layoutService.defaultFooterMarginLeft = this.object.footerMarginLeft;
		this.layoutService.defaultFooterMarginRight = this.object.footerMarginRight;
		this.layoutService.selectedOption = this.object.selectedOption;
		this.layoutService.alignmentModal.close(0);
	}
	object: any = {};
	selectHeader(event) {
		this.layoutService.header = this.layoutService.defaultHeadersObject[event.target.value];
		let headerMarginLeft = 0;
		let headerMarginRight = 0;
		if (!this.layoutService.header) {
			headerMarginLeft = 10;
			headerMarginRight = 10;
		} else {
			headerMarginLeft = this.layoutService.header.headerMarginLeft;
			headerMarginRight = this.layoutService.header.headerMarginRight;
		}
		this.layoutService.defaultHeaderMarginLeft = headerMarginLeft;
		this.layoutService.defaultHeaderMarginRight = headerMarginRight;
		this.layoutService.headerIndex = event.target.value;
	}
	selectFooter(event) {
		this.layoutService.footer = this.layoutService.defaultFootersObject[event.target.value];

		let footerMarginLeft = 0;
		let footerMarginRight = 0;

		if (!this.layoutService.footer) {
			footerMarginLeft = 10;
			footerMarginRight = 10;
		} else {
			footerMarginLeft = this.layoutService.footer.headerMarginLeft;
			footerMarginRight = this.layoutService.footer.headerMarginRight;
		}

		this.layoutService.defaultFooterMarginLeft = footerMarginLeft;
		this.layoutService.defaultFooterMarginRight = footerMarginRight;

		this.layoutService.footerIndex = event.target.value;
	}
	setMarginTop(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.height / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginTop = value;
		this.changeDetector.detectChanges();
	}

	setMarginBottom(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.height / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginBottom = value;
		this.changeDetector.detectChanges();
	}

	setMarginLeft(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.width / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginLeft = value;
		this.changeDetector.detectChanges();
	}

	setMarginRight(event) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.width / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService.template.pdfMarginRight = value;
		this.changeDetector.detectChanges();
	}
	setHFMargin(event, type) {
		let value = event.target.value;
		let limit = Math.floor(this.layoutService.template.pageSize.width / 3);
		if (value > limit) {
			value = limit;
		}
		this.layoutService[type] = value;
		this.changeDetector.detectChanges();
	}

	setDimensions(event: any) {
		let check: any = event;
		if (event.target) {
			check = event.target.value;
		}
		this.layoutService.selectedOption = check;
		if (check == 1) {
			this.layoutService.template.pageSize.height = 279.4;
			this.layoutService.template.pageSize.width = 215.9;
		} else if (check == 2) {
			this.layoutService.template.pageSize.height = 297;
			this.layoutService.template.pageSize.width = 210;
		} else if (check == 3) {
			this.layoutService.template.pageSize.height = 216;
			this.layoutService.template.pageSize.width = 356;
		}
		let widthLimit = Math.floor(this.layoutService.template.pageSize.width / 3);
		let heightLimit = Math.floor(this.layoutService.template.pageSize.height / 3);
		if (this.layoutService.template.pdfMarginTop > heightLimit) {
			this.layoutService.template.pdfMarginTop = heightLimit;
		}
		if (this.layoutService.template.pdfMarginBottom > heightLimit) {
			this.layoutService.template.pdfMarginBottom = heightLimit;
		}
		if (this.layoutService.template.pdfMarginRight > widthLimit) {
			this.layoutService.template.pdfMarginRight = widthLimit;
		}
		if (this.layoutService.template.pdfMarginLeft > widthLimit) {
			this.layoutService.template.pdfMarginLeft = widthLimit;
		}
		if (this.layoutService.defaultHeaderMarginLeft > widthLimit) {
			this.layoutService.defaultHeaderMarginLeft = widthLimit;
		}
		if (this.layoutService.defaultHeaderMarginRight > widthLimit) {
			this.layoutService.defaultHeaderMarginRight = widthLimit;
		}

		if (this.layoutService.defaultFooterMarginLeft > widthLimit) {
			this.layoutService.defaultFooterMarginLeft = widthLimit;
		}
		if (this.layoutService.defaultFooterMarginRight > widthLimit) {
			this.layoutService.defaultFooterMarginRight = widthLimit;
		}
		this.changeDetector.detectChanges();
	}
}
