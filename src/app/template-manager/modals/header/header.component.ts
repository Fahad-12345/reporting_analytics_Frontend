import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { MainServiceTemp } from '../../services/main.service';
import { ToastrService } from 'ngx-toastr';
import { TemplateMasterUrlEnum } from '@appDir/front-desk/masters/template-master/template-master-url.enum';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
	data = [];
	counter = 5;
	pageNumber = 1;
	locations: any = [];
	speciality: any = [];
	visitType: any = [];
	caseTypes: any = [];
	selectedLocation: any = [];
	selectedSpeciality: any = [];
	selectedVisit: any = [];
	selectedCaseType: any = [];
	_defValue: boolean = false;
	requiredCheck = false;
	RemainingRequiredValues: any = [];
	constructor(
		private layoutService: LayoutService,
		protected requestService: RequestService,
		private storageData: StorageData,
		private toastrService: ToastrService,
		private mainService: MainServiceTemp,
	) {}

	ngOnInit() {
		if (this.storageData.isSuperAdmin()) {
			this.getAllLocations();
			this.getAllSpeciality();
			this.getCaseTypes();
			this.getTag();
		} else {
			this.getTag();
			this.getLocations();
			this.getVisitType();
			this.getCaseTypes();
		}
		}
	getAllLocations() {
		this.requestService
			.sendRequest(TemplateMasterUrlEnum.getFacilitiesLocations, 'GET', REQUEST_SERVERS.fd_api_url)
			.subscribe((response: HttpSuccessResponse) => {
				for (let item of response.result.data) {
					item.label = item.name;
					this.locations.push(item);
					let tempOptions = JSON.parse(JSON.stringify(this.locations));
					this.locations = JSON.parse(JSON.stringify(tempOptions));
				}
			});
	}
	getAllSpeciality() {
		this.requestService
			.sendRequest(TemplateMasterUrlEnum.specialities, 'GET', REQUEST_SERVERS.fd_api_url)
			.subscribe((response: HttpSuccessResponse) => {
				for (let item of response.result.data) {
					item.label = item.name;
					this.speciality.push(item);
					let tempOptions = JSON.parse(JSON.stringify(this.speciality));
					this.speciality = JSON.parse(JSON.stringify(tempOptions));
				}
			});
	}

	getAllVisitTypes() {
		this.visitType = [];
		let previousCheck = false;
		for (let item of this.selectedSpeciality) {
			if (item.visit_types != null) {
				for (let currentType of item.visit_types) {
					for (let previousType of this.visitType) {
						if (currentType.id == previousType.id) {
							previousCheck = true;
							break;
						}
					}
					if (!previousCheck) {
						currentType.label = currentType.name;
						this.visitType.push(currentType);
					}
					previousCheck = false;
				}
			}
		}

		let tempOptions = JSON.parse(JSON.stringify(this.visitType));
		this.visitType = JSON.parse(JSON.stringify(tempOptions));
		}
	changePage(e) {}

	public resetModel() {
		this.layoutService.headerModal.close();
	}

	getLocations() {
		this.requestService
			.sendRequest(
				TemplateMasterUrlEnum.getFacilitiesLocations + '?user_id=' + this.storageData.getUserId(),
				'GET',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe((response: HttpSuccessResponse) => {
				for (let item of response.result.data) {
					item.label = item.name;
					this.locations.push(item);
					let tempOptions = JSON.parse(JSON.stringify(this.locations));
					this.locations = JSON.parse(JSON.stringify(tempOptions));
				}
			});
	}
	getCaseTypes() {
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getCaseTypes + '?user_id=' + this.storageData.getUserId(),
				'GET',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe((response: HttpSuccessResponse) => {
				for (let item of response.result.data) {
					item.label = item.name;
					this.caseTypes.push(item);
					let tempOptions = JSON.parse(JSON.stringify(this.caseTypes));
					this.caseTypes = JSON.parse(JSON.stringify(tempOptions));
				}
			});
	}
	getSpecialty() {
		this.speciality = [];
		let previousCheck = false;
		for (let item of this.selectedLocation) {
			if (item.Speciality != null) {
				let currentType = item.Speciality;
				for (let previousType of this.speciality) {
					if (currentType.id == previousType.id) {
						previousType.label = previousType.label.slice(0, -1);

						previousType.label += ', ' + item.name + ')';
						previousCheck = true;
						break;
					}
				}
				if (!previousCheck) {
					currentType.label = currentType.name + ' - (' + item.name + ')';

					this.speciality.push(currentType);
				}
				previousCheck = false;
			}
		}
		let tempOptions = JSON.parse(JSON.stringify(this.speciality));
		this.speciality = JSON.parse(JSON.stringify(tempOptions));

		}
	getVisitType() {
		this.visitType = [];
		let previousCheck = false;
		for (let location of this.selectedLocation) {
			for (let item of this.selectedSpeciality) {
				if (location.Speciality.id == item.id) {
					if (location.Speciality.visit_types != null) {
						for (let currentType of location.Speciality.visit_types) {
							for (let previousType of this.visitType) {
								if (!previousType.specialitiesList) {
									previousType.specialitiesList = [];
								}
								if (currentType.id == previousType.id) {
									if (!previousType.specialitiesList.includes(location.Speciality.id)) {
										previousType.label = previousType.label.slice(0, -1);
										previousType.label += ', ' + location.Speciality.name + ')';
										previousType.specialitiesList.push(location.Speciality.id);
									}
									previousCheck = true;
									break;
								}
							}
							if (!previousCheck) {
								currentType.specialitiesList = [];
								currentType.label = currentType.name + ' - (' + location.Speciality.name + ')';
								currentType.specialitiesList.push(location.Speciality.id);
								this.visitType.push(currentType);
							}
							previousCheck = false;
						}
					}
				}
			}
		}

		let tempOptions = JSON.parse(JSON.stringify(this.visitType));
		this.visitType = JSON.parse(JSON.stringify(tempOptions));
		}
	clearLocations() {
		this.selectedLocation = [];
		if (!this.storageData.isSuperAdmin()) {
			this.getSpecialty();
		}
		let tempCheck = true;
		for (let i = 0; i < this.selectedSpeciality.length; i++) {
			for (let item of this.speciality) {
				if (this.selectedSpeciality[i].id == item.id) {
					tempCheck = false;
					break;
				}
			}
			if (tempCheck) {
				this.selectedSpeciality.splice(i, 1);
				i--;
			}
			tempCheck = true;
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedSpeciality));
		this.selectedSpeciality = JSON.parse(JSON.stringify(tempOptions));
		if (this.storageData.isSuperAdmin()) {
			this.getAllVisitTypes();
		} else {
			this.getVisitType();
		}
		tempCheck = true;
		for (let i = 0; i < this.selectedVisit.length; i++) {
			for (let item of this.visitType) {
				if (this.selectedVisit[i].id == item.id) {
					tempCheck = false;
					break;
				}
			}
			if (tempCheck) {
				this.selectedVisit.splice(i, 1);
				i--;
			}
			tempCheck = true;
		}
		tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}
	locationSelect(item) {
		if (item.selected == false) {
			for (let i = 0; i < this.selectedLocation.length; i++) {
				if (this.selectedLocation[i].id == item.value.id) {
					this.selectedLocation.splice(i, 1);
				}
			}
		} else {
			this.selectedLocation.push(item);
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedLocation));
		this.selectedLocation = JSON.parse(JSON.stringify(tempOptions));

		if (!this.storageData.isSuperAdmin()) {
			this.getSpecialty();
		}
		let tempCheck = true;
		for (let i = 0; i < this.selectedSpeciality.length; i++) {
			for (let item of this.speciality) {
				if (this.selectedSpeciality[i].id == item.id) {
					tempCheck = false;
					break;
				}
			}
			if (tempCheck) {
				this.selectedSpeciality.splice(i, 1);
				i--;
			}
			tempCheck = true;
		}
		tempOptions = JSON.parse(JSON.stringify(this.selectedSpeciality));
		this.selectedSpeciality = JSON.parse(JSON.stringify(tempOptions));
		if (this.storageData.isSuperAdmin()) {
			this.getAllVisitTypes();
		} else {
			this.getVisitType();
		}
		tempCheck = true;
		for (let i = 0; i < this.selectedVisit.length; i++) {
			for (let item of this.visitType) {
				if (this.selectedVisit[i].id == item.id) {
					tempCheck = false;
					break;
				}
			}
			if (tempCheck) {
				this.selectedVisit.splice(i, 1);
				i--;
			}
			tempCheck = true;
		}
		tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}
	clearSpeciality() {
		this.selectedSpeciality = [];
		if (this.storageData.isSuperAdmin()) {
			this.getAllVisitTypes();
		} else {
			this.getVisitType();
		}
		let tempCheck = true;
		for (let i = 0; i < this.selectedVisit.length; i++) {
			for (let item of this.visitType) {
				if (this.selectedVisit[i].id == item.id) {
					tempCheck = false;
					break;
				}
			}
			if (tempCheck) {
				this.selectedVisit.splice(i, 1);
				i--;
			}
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}
	specialitySelect(item) {
		if (item.selected == false) {
			for (let i = 0; i < this.selectedSpeciality.length; i++) {
				if (this.selectedSpeciality[i].id == item.item.id) {
					this.selectedSpeciality.splice(i, 1);
					i--;
				}
			}
		} else {
			this.selectedSpeciality.push(item);
		}

		let tempOptions = JSON.parse(JSON.stringify(this.selectedSpeciality));
		this.selectedSpeciality = JSON.parse(JSON.stringify(tempOptions));
		if (this.storageData.isSuperAdmin()) {
			this.getAllVisitTypes();
		} else {
			this.getVisitType();
		}
		let tempCheck = true;
		for (let i = 0; i < this.selectedVisit.length; i++) {
			for (let item of this.visitType) {
				if (this.selectedVisit[i].id == item.id) {
					tempCheck = false;
					break;
				}
			}
			if (tempCheck) {
				this.selectedVisit.splice(i, 1);
				i--;
			}
		}
		tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}
	clearVisitTypes() {
		this.selectedVisit = [];
	}
	visitTypeSelect(item) {
		if (item.selected == false) {
			for (let i = 0; i < this.selectedVisit.length; i++) {
				if (this.selectedVisit[i].id == item.item.id) {
					this.selectedVisit[i].specialitiesList = [];
					this.selectedVisit.splice(i, 1);
					i--;
				}
			}
		} else {
			this.selectedVisit.push(item);
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}

	clearCaseTypes() {
		this.selectedCaseType = [];
	}
	caseTypeSelect(item) {
		if (item.selected == false) {
			for (let i = 0; i < this.selectedCaseType.length; i++) {
				if (this.selectedCaseType[i].id == item.value.id) {
					this.selectedCaseType.splice(i, 1);
					i--;
				}
			}
		} else {
			this.selectedCaseType.push(item);
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedCaseType));
		this.selectedCaseType = JSON.parse(JSON.stringify(tempOptions));
	}

	public deletePermissions(id) {
		let reqObj = {
			permission_id: id,
			user_id: this.storageData.getUserId(),
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.deleteUserPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				reqObj,
			)
			.subscribe((res: any) => {
				this.toastrService.success(res.message, 'Success');
				this.getTag();
				});
	}

	getTag() {
		let userId = 0;
		if (!this.storageData.isSuperAdmin()) {
			userId = this.storageData.getUserId();
		}
		let reqObj = {
			template_id: this.layoutService.template.template_id,
			user_id: userId,
		};
		this.requestService
			.sendRequest(
				TemaplateManagerUrlsEnum.getUserPermissions,
				'POST',
				REQUEST_SERVERS.templateManagerUrl,
				reqObj,
			)
			.subscribe((res: any) => {
				this.data = res.data[0];
			});
	}
	async getPredefinedRemaining() {
		let location = '';
		let speciality = '';
		let visit = '';
		for (let i = 0; i < this.selectedLocation.length; i++) {
			location += '&facility_location_ids[] =' + this.selectedLocation[i].id;
		}

		if (this.selectedSpeciality.length > 1) {
			speciality = '&speciality_ids =' + this.selectedSpeciality[0].id;
		} else if (this.selectedSpeciality.length == 1) {
			speciality = '&speciality_ids[]=' + this.selectedSpeciality[0].id;
		}
		for (let i = 1; i < this.selectedSpeciality.length; i++) {
			speciality += ',' + this.selectedSpeciality[i].id;
		}

		if (this.selectedVisit.length > 1) {
			visit = '&visit_type_ids =' + this.selectedVisit[0].id;
		} else if (this.selectedVisit.length == 1) {
			visit = '&visit_type_ids[]=' + this.selectedVisit[0].id;
		}
		for (let i = 1; i < this.selectedVisit.length; i++) {
			visit += ',' + this.selectedVisit[i].id;
		}
		await new Promise((resolve, reject) => {
			this.requestService
				.sendRequest(
					TemplateMasterUrlEnum.getFieldsControlsWithIsRequired + location + speciality + visit,
					'GET',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe((response: HttpSuccessResponse) => {
					this.RemainingRequiredValues = [];

					this.requiredCheck = false;
					let requiredData = JSON.parse(JSON.stringify(response.result.data));
					for (let i = 0; i < requiredData.length; i++) {
						if (requiredData[i].is_required == 1) {
							let checked: any = false;
							for (let j = 0; j < this.layoutService.PreDefinedListUsed.length; j++) {
								if (
									requiredData[i].id == this.layoutService.PreDefinedListUsed[j].predefinedvalue
								) {
									checked = true;
									break;
								}
							}
							if (!checked) {
								this.RemainingRequiredValues.push(requiredData[i]);
							}
						}
					}
					if (this.RemainingRequiredValues.length == 0) {
						this.requiredCheck = true;
					}
					resolve(true);
				});
		});
	}
	async saveTag() {
		let tempLocation = this.selectedLocation;
		let tempSpeciality = this.selectedSpeciality;
		let tempVisitType = this.selectedVisit;
		let tempCaseType = this.selectedCaseType;

		if (tempLocation.length == 0) {
			for (let item of this.locations) {
				tempLocation.push(item);
			}
		}
		if (tempSpeciality.length == 0) {
			for (let item of this.speciality) {
				tempSpeciality.push(item);
			}
		}
		if (tempVisitType.length == 0) {
			for (let item of this.visitType) {
				tempVisitType.push(item);
			}
		}

		if (tempCaseType.length == 0) {
			for (let item of this.caseTypes) {
				tempCaseType.push(item);
			}
		}
		let userId = 0;
		let tempList = [];
		if (!this.storageData.isSuperAdmin()) {
			userId = this.storageData.getUserId();
			for (let selectedCase of tempCaseType) {
				for (let selectedLocation of tempLocation) {
					for (let selectedSpeciality of tempSpeciality) {
						for (let selectedVisit of tempVisitType) {
							for (let availableLocation of this.locations) {
								if (availableLocation.id == selectedLocation.id) {
									if (
										availableLocation.Speciality != null &&
										availableLocation.Speciality.id == selectedSpeciality.id
									) {
										for (let availableVisit of availableLocation.Speciality.visit_types) {
											if (availableVisit.id == selectedVisit.id) {
												tempList.push({
													location: selectedLocation.id,
													spec: selectedSpeciality.id,
													visit: selectedVisit.id,
													case: selectedCase.id,
												});
											}
										}
									}
								}
							}
						}
					}
				}
			}
		} else {
			for (let selectedCase of tempCaseType) {
				for (let selectedLocation of tempLocation) {
					for (let selectedSpeciality of tempSpeciality) {
						for (let selectedVisit of tempVisitType) {
							for (let availableVisit of selectedSpeciality.visit_types) {
								if (availableVisit.id == selectedVisit.id) {
									tempList.push({
										location: selectedLocation.id,
										spec: selectedSpeciality.id,
										visit: selectedVisit.id,
										case: selectedCase.id,
									});
								}
							}
						}
					}
				}
			}
		}

		await this.getPredefinedRemaining();

		let reqObj = {
			template_id: this.layoutService.template.template_id,
			list: tempList,
		};
		reqObj['user_id'] = userId;
		if (this.requiredCheck) {
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.addUserPermissions,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					reqObj,
				)
				.subscribe((res: any) => {
					this.toastrService.success(res.message, 'Success');
					this.getTag();
				});
		}
	}
}
