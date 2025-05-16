import { removeEmptyAndNullsFormObject } from '@shared/utils/utils.helpers';
import { Subject } from 'rxjs';
import { Injectable } from "@angular/core";
import { MriIntake1 } from '@appDir/front-desk/fd_shared/models/Case.model';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { MRIIntakerlsEnum } from '../models/mri-intakes-urls.Enum';

@Injectable({
	providedIn: 'root',
})
export class MriIntakeService {


	MriIntake1PriorSurgeryRefreshData:Subject<any>=new Subject();
	MriIntake1PriorImagingRefreshData:Subject<any>=new Subject();
	ForKnowMedicationHasBeenAddOrEdit:Subject<any>=new Subject();
	MriIntake2MedicationsLists = [];
	MriIntake2_Ojbect:any;
	Mri_Ojbect:any;
	Case_id;
	constructor(protected requestService: RequestService)
	{
		
	}
	MriIntake1PriorSurgeryRefreshListingData(data:MriIntake1)
	{
		this.MriIntake1PriorSurgeryRefreshData.next(data)
	}

	MriIntake1PriorImagingRefreshListingData(data)
	{
		this.MriIntake1PriorImagingRefreshData.next(data)
	}

	

	getTypeOfSurgery(queryParams?) {
	debugger;
		
		let paramQuery: any = {
			// order: OrderEnum.ASC,
			pagination: true,
			// filter: queryParams?queryParams.filter:null,
			dropDownFilter:true,
			per_page: queryParams &&queryParams.per_page ? queryParams.per_page : 10,
			page: queryParams && queryParams.page? queryParams.page : 1,
			id:queryParams && queryParams.id?queryParams.id:null,
			name: queryParams && queryParams.name?queryParams.name:null,
		};
		paramQuery=removeEmptyAndNullsFormObject(paramQuery);

		return this.requestService.sendRequest(
			MRIIntakerlsEnum.surgeryTypeGET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			paramQuery,
		);
	
	}

	getStudyType(queryParams?) {
		debugger;
			
			let paramQuery: any = {
				// order: OrderEnum.ASC,
				pagination: true,
				dropDownFilter:true,
				per_page: queryParams && queryParams.per_page? queryParams.per_page : 10,
				page: queryParams && queryParams.page ? queryParams.page : 1,
				id:queryParams && queryParams.id?queryParams.id:null,
				name: queryParams && queryParams.name?queryParams.name:null,
			};
			paramQuery=removeEmptyAndNullsFormObject(paramQuery);
	
			return this.requestService.sendRequest(
				MRIIntakerlsEnum.studyTypeGET,
				'get',
				REQUEST_SERVERS.fd_api_url,
				paramQuery,
			);
		
		}

		getBodyParts(queryParams?) {
			debugger;
				
				let paramQuery: any = {
					// order: OrderEnum.ASC,
					pagination: true,
					dropDownFilter:true,
					per_page: queryParams && queryParams.per_page ? queryParams.per_page : 10,
					page: queryParams &&  queryParams.page? queryParams.page : 1,
					id:queryParams && queryParams.id?queryParams.id:null,
					name: queryParams && queryParams.name?queryParams.name:null,
				};
				paramQuery=removeEmptyAndNullsFormObject(paramQuery);
		
				return this.requestService.sendRequest(
					MRIIntakerlsEnum.mribodyparts,
					'get',
					REQUEST_SERVERS.fd_api_url,
					paramQuery,
				);
			
			}
		getMriIntake2MedicationLists() {
			return this.MriIntake2MedicationsLists;		
		}		
		setMriIntake2MedicationLists(list){	
			this.MriIntake2MedicationsLists = list;	
		}		
		getMriIntake_2_object() {	
			return this.MriIntake2_Ojbect;		
		}		
		setMriIntake_2_object(mri_intake_2_obj){		
			this.MriIntake2_Ojbect = mri_intake_2_obj;
		}
		getMri_object() {	
			return this.Mri_Ojbect;		
		}		
		setMri_object(mri_obj){		
			this.Mri_Ojbect = mri_obj;
		}
		getCase_id() {	
			return this.Case_id;		
		}		
		setCase_id(Case_id){		
			this.Case_id = Case_id;
		}
}
