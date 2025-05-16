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
import {  cloneDeep } from 'lodash';

@Component({
  selector: 'app-header-footer-modal',
  templateUrl: './header-footer-modal.component.html',
  styleUrls: ['./header-footer-modal.component.scss']
})
export class HeaderFooterModalComponent implements OnInit {
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

  constructor(private toastrService: ToastrService,
    private layoutService: LayoutService,
    protected requestService: RequestService,
    private storageData: StorageData,
    private mainService: MainServiceTemp
  ) { }

  ngOnInit() {
    this.getLocations()
    this.getSpeciality()
		this.getCaseTypes();
    this.getTag()
  }

  changePage(e) {

  }

  public resetModel() {
    this.layoutService.headerFooterModal.close();
  }

  getLocations() {
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.getFacilitiesLocations,
        'GET',
        REQUEST_SERVERS.fd_api_url,
      ).subscribe(
        (response: HttpSuccessResponse) => {
					for(let item of response.result.data){
						item.label = item.name;
						this.locations.push(item);
						let tempOptions = JSON.parse(JSON.stringify(this.locations));
						this.locations = JSON.parse(JSON.stringify(tempOptions));
					}
        }
      )
  }
  getSpeciality() {
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.specialities,
        'GET',
        REQUEST_SERVERS.fd_api_url,
      ).subscribe(
        (response: HttpSuccessResponse) => {
					for(let item of response.result.data){
						item.label = item.name;
						this.speciality.push(item);
						let tempOptions = JSON.parse(JSON.stringify(this.speciality));
						this.speciality = JSON.parse(JSON.stringify(tempOptions));
					}
        }
      )
  }
	getCaseTypes() {
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.getCaseTypes + '?user_id=' + this.storageData.getUserId(),
					'GET',
					REQUEST_SERVERS.fd_api_url,
				).subscribe(
					(response: HttpSuccessResponse) => {
						for(let item of response.result.data){
							item.label = item.name;
							this.caseTypes.push(item);
							let tempOptions = JSON.parse(JSON.stringify(this.caseTypes));
							this.caseTypes = JSON.parse(JSON.stringify(tempOptions));
						}
					}
				)
		}
  getVisitType() {
    // if (this.selectedSpeciality == 0) {
      this.visitType = []
    // } else {
      // let visit = this.speciality.filter(spec => spec.id === parseInt(this.selectedSpeciality));
      // this.visitType = visit[0].visit_types;
			let previousCheck = false;
				for(let item of this.selectedSpeciality){
						if (item.visit_types != null) {
							for(let currentType of item.visit_types){
								for(let previousType of this.visitType){
									if(currentType.id == previousType.id){
										previousCheck = true;
										break;
									}
								}
								if(!previousCheck){
									currentType.label = currentType.name;
									this.visitType.push(currentType);
								}
								previousCheck = false;
							}
						}
				}

			let tempOptions = JSON.parse(JSON.stringify(this.visitType));
			this.visitType = JSON.parse(JSON.stringify(tempOptions));
    // }
  }
	clearLocations(){
		this.selectedLocation = [];

	}
	locationSelect(item){
		if(item.selected==false){
			// for(let i = 0; i < this.selectedLocation.length; i++){
			// 	if(this.selectedLocation[i].id == item.id){
			// 		this.selectedLocation.splice(i , 1);
			// 	}
			// }
			for(let i = 0; i < this.selectedLocation.length; i++){
				if(this.selectedLocation[i].id == item.value.id){
					this.selectedLocation.splice(i , 1);
				}
			}
		} else{
			// if(item.name){
				this.selectedLocation.push(item);
			// }
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedLocation));
		this.selectedLocation = JSON.parse(JSON.stringify(tempOptions));

	}
	clearSpeciality(){
		this.selectedSpeciality = [];
		this.getVisitType();
		let tempCheck = true;
		for(let i = 0; i < this.selectedVisit.length; i++){
			for(let item of this.visitType){
				if(this.selectedVisit[i].id == item.id){
					tempCheck = false;
					break;
				}
			}
			if(tempCheck){
				this.selectedVisit.splice(i, 1);
				i--;
			}
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}
	specialitySelect(item){
		if(item.selected==false){
			for(let i = 0; i < this.selectedSpeciality.length; i++){
				if(this.selectedSpeciality[i].id == item.item.id){

					this.selectedSpeciality.splice(i , 1);
					i--;
				}
			}
		} else{
			// if(item.name){

				this.selectedSpeciality.push(item);
			// }
		}

		let tempOptions = JSON.parse(JSON.stringify(this.selectedSpeciality));
		this.selectedSpeciality = JSON.parse(JSON.stringify(tempOptions));
		this.getVisitType();
		let tempCheck = true;
		for(let i = 0; i < this.selectedVisit.length; i++){
			for(let item of this.visitType){
				if(this.selectedVisit[i].id == item.id){
					tempCheck = false;
					break;
				}
			}
			if(tempCheck){
				this.selectedVisit.splice(i, 1);
				i--;
			}
		}
		tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}
	clearVisitTypes(){
		this.selectedVisit = [];
	}
	visitTypeSelect(item){
		if(item.selected==false){
			for(let i = 0; i < this.selectedVisit.length; i++){
				if(this.selectedVisit[i].id == item.item.id){
					this.selectedVisit[i].specialitiesList = [];
					this.selectedVisit.splice(i , 1);
					i--
				}
			}
		} else{
			// if(item.name){
				this.selectedVisit.push(item);
			// }
		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedVisit));
		this.selectedVisit = JSON.parse(JSON.stringify(tempOptions));
	}

	clearCaseTypes(){
		this.selectedCaseType = [];
	}
	caseTypeSelect(item){
		if(item.selected==false){
			for(let i = 0; i < this.selectedCaseType.length; i++){
				if(this.selectedCaseType[i].id == item.value.id){
					this.selectedCaseType.splice(i , 1);
					i--;
				}
			}
		} else{
			// if(item.name){
				this.selectedCaseType.push(item);
			// }

		}
		let tempOptions = JSON.parse(JSON.stringify(this.selectedCaseType));
		this.selectedCaseType = JSON.parse(JSON.stringify(tempOptions));


	}
  saveTag() {
		let tempLocation = cloneDeep(this.selectedLocation);
		let tempSpeciality = cloneDeep(this.selectedSpeciality);
		let tempVisitType = cloneDeep(this.selectedVisit);
		let tempCaseType = cloneDeep(this.selectedCaseType);
		if(tempLocation.length==0){
			tempLocation.push({id:0});
		}
		if(tempSpeciality.length==0){
			tempSpeciality.push({id:0, visit_types: []});
		}
		if(tempVisitType.length==0){
			tempVisitType.push({id:0});
		}

		if(tempCaseType.length==0){
			tempCaseType.push({id:0});
		}
		// for(let selectedLocation of tempLocation){
		// 	this.list.push({clinicId: selectedLocation});
		// }
		let tempList = [];
		for(let selectedCase of tempCaseType){
			for(let selectedLocation of tempLocation){
				for(let selectedSpeciality of tempSpeciality){
					for(let selectedVisit of tempVisitType){
						if(selectedVisit.id!=0){
							for(let availableVisit of selectedSpeciality.visit_types){
								if(availableVisit.id == selectedVisit.id){
									tempList.push({location: selectedLocation.id, spec: selectedSpeciality.id, visit: selectedVisit.id, case: selectedCase.id});
								}
							}
						} else{
							tempList.push({location: selectedLocation.id, spec: selectedSpeciality.id, visit: selectedVisit.id, case: selectedCase.id});
						}

					}
				}
			}
		}
    let reqObj = {
      template_id: this.layoutService.section.section_id,
      list: tempList
    }
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.addHFPermissions,
        'POST',
        REQUEST_SERVERS.templateManagerUrl,
        reqObj
      ).subscribe(
        (res: any) => {
          this.toastrService.success(res.message, 'Success');
          this.getTag();
        })
  }

  updatePermissions(id) {
    let reqObj = {
      permission_id: id,
      location_id: JSON.parse(this.selectedLocation),
      speciality_id: JSON.parse(this.selectedSpeciality),
      visit_type_id: JSON.parse(this.selectedVisit)
    }
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.updateHFPermissions,
        'POST',
        REQUEST_SERVERS.templateManagerUrl,
        reqObj
      ).subscribe(
        (res: any) => {
          this.toastrService.success(res.message, 'Success');
          this.getTag();
        })
  }

  public deletePermissions(id) {
    let reqObj = {
      permission_id: id,
			'user_id': this.storageData.getUserId()
    }
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.deleteHFPermissions,
        'POST',
        REQUEST_SERVERS.templateManagerUrl,
        reqObj
      ).subscribe(
        (res: any) => {
          this.toastrService.success(res.message, 'Success');
          this.getTag();
        })
  }


  getTag() {
    let reqObj = {
      template_id: this.layoutService.section.section_id,
    }
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.getHFPermissions,
        'POST',
        REQUEST_SERVERS.templateManagerUrl,
        reqObj
      ).subscribe(
        (res: any) => {
          this.data = res.data[0];
          console.log("res: ", this.data);
        })
  }

}
