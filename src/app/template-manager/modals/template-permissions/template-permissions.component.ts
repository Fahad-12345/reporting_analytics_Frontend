import { Component, OnInit, Input } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { MainServiceTemp } from '../../services/main.service';
import { ToastrService } from 'ngx-toastr';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';

@Component({
	selector: 'app-template-permissions',
	templateUrl: './template-permissions.component.html',
	styleUrls: ['./template-permissions.component.css'],
})
export class TemplatePermissionsComponent implements OnInit {
	@Input() permissionModal;
	public doctorList: any = [];
	public clinicList: any = [];
	public searchClinicList: any;
	public keyword = 'facility_full_name';
	public keywordDoc = 'first_name';
	public tagsList: any = [];
	searchDoctorList: any = [];
	completeDoctorName: any = [];
	public clinicLimit: any = 10;
	public clinicLimitStart: any = 0;
	public doctorLimit: any = 10;
	public doctorLimitStart: any = 0;
	public selectedDoctorPage: any = 1;
	public selectedClinicPage: any = 1;
	public totalDoctorPage: Array<number> = [];
	public totalFacilitiesPage: Array<number> = [];
	pageNumber = 1;
	counter = 10;

	constructor(
		protected requestService: RequestService,
		public layoutService: LayoutService,
		public mainService: MainServiceTemp,
		private storageData: StorageData,
		public toaster: ToastrService,
	) {}

	ngOnInit() {
		this.getClinics();
		this.getDoctors();
	}
	changePage(e) {}

	/** Tags search **/
	onChangeSearch(val: string) {
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.search_clinic + val + '',
				'GET',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe(
				(res: any) => {
					this.searchClinicList = res['result']['data'];
				},
				(error) => {
					this.searchClinicList = [];
				},
			);
	}
	onChangeSearchDoctor(val: string) {
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.search_doctor + val + '',
				'GET',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe(
				(res: any) => {
					this.completeDoctorName = [];
					this.searchDoctorList = res['result']['data'];
					for (let single of this.searchDoctorList) {
						single.completeName =
							(single.first_name || '') +
							' ' +
							(single.middle_name || '') +
							' ' +
							(single.last_name || '');
						this.completeDoctorName.push(single);
					}
				},
				(error) => {
					this.completeDoctorName = [];
					this.searchDoctorList = [];
				},
			);
	}
	/** Tags selection **/
	selectEvent(item) {
		this.clinicLimitStart = 0;
		this.selectedClinicPage = 1;
		this.addClinic(item.id);
	}
	selectDoctor(item) {}
	/** Tags focus **/
	onFocused(e) {}
	onFocusedDoctor(e) {}

	public selectEventDoctor(e) {
		this.doctorLimitStart = 0;
		this.selectedDoctorPage = 1;
		this.addDoctor(e.id);
	}

	public addDoctor(id) {
		let data = {
			template_id: this.layoutService.template.template_id,
			doctor_id: id,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.addDoctorPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				data,
			)
			.subscribe((res: any) => {
				this.toaster.success(res['message']);
				this.getDoctors();
			});
	}
	public addClinic(id) {
		let data = {
			template_id: this.layoutService.template.template_id,
			facility_id: id,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.addFacilityPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				data,
			)
			.subscribe((res: any) => {
				this.toaster.success(res['message']);
				this.getClinics();
			});
	}

	public deleteDoctorPermissions(doc_id) {
		let data = {
			id: doc_id,
			user_id: this.storageData.getUserId(),
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.deleteDoctorPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				data,
			)
			.subscribe((res: any) => {
				this.toaster.success(res['message']);

				this.doctorLimitStart = 0;
				this.selectedDoctorPage = 1;
				this.getDoctors();
			});
	}
	public deleteFacilityPermissions(clicnic_id) {
		let data = {
			id: clicnic_id,
			user_id: this.storageData.getUserId(),
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.deleteFacilityPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				data,
			)
			.subscribe((res: any) => {
				this.toaster.success(res['message']);

				this.clinicLimitStart = 0;
				this.selectedClinicPage = 1;
				this.getClinics();
			});
	}

	public getClinics() {
		let obj = {
			template_id: this.layoutService.template.template_id,
			limit: 1000, 
			start: this.clinicLimitStart,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getFacilityPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				obj,
			)
			.subscribe((resp: any) => {
				this.totalFacilitiesPage = [];
				this.clinicList = [];
				for (let i = 0; i < Math.ceil(resp.data[0].totalRows / 10); i++) {
					this.totalFacilitiesPage.push(i);
				}
				this.clinicList = resp.data[0].facilitiesFound;
			});
	}
	public getDoctors() {
		let obj = {
			template_id: this.layoutService.template.template_id,
			limit: 1000, 
			start: this.doctorLimitStart,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getDoctorPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				obj,
			)
			.subscribe((resp: any) => {
				this.totalDoctorPage = [];
				this.doctorList = [];

				for (let i = 0; i < Math.ceil(resp.data[0].totalRows / 10); i++) {
					this.totalDoctorPage.push(i);
				}
				this.doctorList = resp.data[0].doctorsFound;
			});
	}
	public getDoctorByPage(page) {
		this.selectedDoctorPage = page;
		if (page == 1) {
			this.doctorLimitStart = 0;
			this.getDoctors();
		} else {
			this.doctorLimitStart = (page - 1) * 10;
			this.getDoctors();
		}
	}
	public getClinicByPage(page) {
		this.selectedClinicPage = page;
		if (page == 1) {
			this.clinicLimitStart = 0;
			this.getClinics();
		} else {
			this.clinicLimitStart = (page - 1) * 10;
			this.getClinics();
		}
	}
}
