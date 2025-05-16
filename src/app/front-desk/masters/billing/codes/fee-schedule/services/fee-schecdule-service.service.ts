import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { ModifiersUrlsEnum } from '../../../billing-master/Modifiers-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { RegionUrlsEnum } from '../../../billing-master/Region-Urls-Enum';
import { PlaceOfServiceUrlsEnum } from '../../../billing-master/PlaceOfService-Urls-Enum';
import { EmployerUrlsEnum } from '../../../employer-master/employer/Employer-Urls-Enum';
import { InsuranceUrlsEnum } from '../../../insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { PlanNameUrlsEnum } from '../../../insurance-master/PlanName/PlanName-Urls-enum';
// import { queryParams } from '@syncfusion/ej2-base';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { FeeScheduleModel, FeeScheduleFormModel } from '../../Models/FeeSchedule.model';
import { FeeScheduleEnum } from '../FeeSchedule.enum';
import { CodeTypeUrl } from '../../codetype/CodeType.enum';
import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/specialities-listing/Speciality-urls-enum';

@Injectable({
	providedIn: 'root'
})
export class FeeSchecdulerServiceService {

	constructor(protected requestService: RequestService) { }

	searchModifiers(name?, id?) {
		var params: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 500, page: 1, order_by: 'code' } as any
		let filter = {}
		id ? filter['id'] = id : name ? filter['name'] = name : ''
		id || name ? params.filter = true : ''
		return this.requestService.sendRequest(ModifiersUrlsEnum.Modifiers_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, { ...params, ...filter })
	}

	searchPractice(name?,queryParams?) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false,per_page: queryParams ? queryParams.per_page : 500, page: queryParams ? queryParams.page : 1 }

		return this.requestService.sendRequest(FacilityUrlsEnum.Facility_list_dropdown_GET, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
		// return this.requestService.sendRequest('search_clinic', 'get', REQUEST_SERVERS.fd_api_url, params)
	}
	searchSpeciality(name?, id?,queryParams?) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false,per_page: queryParams ? queryParams.per_page : 500, page: queryParams ? queryParams.page : 1 }
		let filter = {}
		id ? filter['id'] = id : name ? filter['name'] = name : ''
		id || name ? paramQuery.filter = true : ''
		return this.requestService.sendRequest(SpecialityUrlsEnum.Speciality_list_Get, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}
	private readonly searchProviderUrl = "search_doctor"
	searchProvider(name?, id?,queryParams?) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: queryParams ? queryParams.per_page : 500, page: queryParams ? queryParams.page : 1 }
		let filter = {}
		id ? filter['id'] = id : name ? filter['doctor_name'] = name : ''
		id || name ? paramQuery.filter = true : ''
		return this.requestService.sendRequest(this.searchProviderUrl, 'GET', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}
	searchRegion(formData?) {
		var params: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: false,order_by:'name' } as any
		return this.requestService.sendRequest(RegionUrlsEnum.Region_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...params, ...formData })
	}
	searchTypeOfService(formData) {
		return []
	}
	searchPlaceOfService(formData?) {
		var params: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: false } as any

		return this.requestService.sendRequest(PlaceOfServiceUrlsEnum.Place_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...params, ...formData })
	}
	searchEmployer(formData) {
		var params: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: false } as any

		return this.requestService.sendRequest(EmployerUrlsEnum.Employer_list_GET, 'get', REQUEST_SERVERS.fd_api_url, params)
	}
	searchInsurance(name?, id?) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 500, page: 1, order_by: 'insurance_name' }
		let filter = {}
		id ? filter['id'] = id : name ? filter['insurance_name'] = name : ''
		id || name ? paramQuery.filter = true : ''
		return this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'GET', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}
	getPlanName(data?) {
		var params: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: true,per_page: 10, page: 1,order_by: 'plan_name' } as any

		return this.requestService.sendRequest(PlanNameUrlsEnum.PlanNAme_list_GET, 'Get', REQUEST_SERVERS.billing_api_url, {...params,...data})
	}

	createFeeSchedule(feeSchedule: FeeScheduleModel) {
		return this.requestService.sendRequest(FeeScheduleEnum.Fee_list_POST, 'post', REQUEST_SERVERS.fd_api_url, feeSchedule)
	}
	updateFeeSchedule(feeSchedule: FeeScheduleModel) {
		return this.requestService.sendRequest(FeeScheduleEnum.Fee_list_PATCH, 'put', REQUEST_SERVERS.fd_api_url, feeSchedule)
	}
	getFeeSchedule(data) {
		return this.requestService.sendRequest(FeeScheduleEnum.Fee_list_GET, 'get', REQUEST_SERVERS.fd_api_url, data)
	}
	getFeeType(data?) {
		var paramQuery: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: true,per_page: 20, page: 1,order_by:'name' } as any
		return this.requestService.sendRequest(FeeScheduleEnum.feeTypeUrl, 'get', REQUEST_SERVERS.fd_api_url, {...paramQuery,...data})
	}
	getPicklist() {
		var paramQuery: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: true, per_page: 20, page: 1 } as any
		return this.requestService.sendRequest(FeeScheduleEnum.pickListUrl, 'get', REQUEST_SERVERS.billing_api_url, paramQuery)
	}
	getCaseType(data?) {
		var paramQuery: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: true, per_page: 20, page: 1 } as any
		return this.requestService.sendRequest(FeeScheduleEnum.CaseType_GET, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
	}
	getCodeType(data?) {
		var paramQuery: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: true, per_page: 20, page: 1,order_by:'name' } as any
		return this.requestService.sendRequest(CodeTypeUrl.CODE_TYPE_list_GET, 'get', REQUEST_SERVERS.fd_api_url, {...paramQuery,...data})
	}
	getVisitType(data?) {
		var paramQuery: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: true, per_page: 30, page: 1 } as any
		return this.requestService.sendRequest(FeeScheduleEnum.visitTypeUrl, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
	}
	getCodes(codeType) {
		var paramQuery: ParamQuery = { filter: true, pagination: true, order: OrderEnum.ASC } as any
		return this.requestService.sendRequest(FeeScheduleEnum.Codes_Get, 'get', REQUEST_SERVERS.fd_api_url, {...paramQuery,...codeType})
	}

	deleteFeeSchedule(arr: Array<number>) {
		return this.requestService.sendRequest('fee-schedule/destroyAll', 'delete_with_body', REQUEST_SERVERS.billing_api_url, { id: arr })
	}

	convertDateToString(date: Date) {
		return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
	}
	convertFeeScheduleToFormModel(feeSchedule: FeeScheduleModel): FeeScheduleFormModel {
		var obj = new FeeScheduleFormModel()
		obj.id = feeSchedule.id
		obj.base_price = feeSchedule.base_price;
		obj.case_type_ids = feeSchedule.case_type_ids ? feeSchedule.case_type_ids : null;
		obj.code_type_id = feeSchedule.code_type_id ? feeSchedule.code_type_id : null;
		obj.code_id = feeSchedule.code_id ? feeSchedule.code_id : null;
		obj.comments = feeSchedule.comments;
		obj.description = feeSchedule.description;
		obj.employer_start_date = feeSchedule.employer_start_date ? feeSchedule.employer_start_date : undefined;
		obj.employer_end_date = feeSchedule.employer_end_date ? feeSchedule.employer_end_date : undefined;
		obj.employer_id = feeSchedule.employer_id ? feeSchedule.employer_id.map(employer => {
			return employer['id']
		}) : null;
		obj.expected_reimbursement = feeSchedule.expected_reimbursement;
		obj.fee_type_id = feeSchedule.fee_type_id ? feeSchedule.fee_type_id : null;
		obj.insurance_from_date = feeSchedule.insurance_id[0] ? feeSchedule.insurance_id[0].from : undefined;
		obj.insurance_to_date = feeSchedule.insurance_id[0] ? feeSchedule.insurance_id[0].to : undefined;
		obj.insurances = feeSchedule.insurance_id ? feeSchedule.insurance_id.map(insurance => {
			return insurance.insurance ? insurance.insurance.id : null
		}) : [];

		obj.modifier1 = feeSchedule.modifier[0] && feeSchedule.modifier[0].modifier ? feeSchedule.modifier[0].modifier.id : null;
		obj.modifier2 = feeSchedule.modifier[1] && feeSchedule.modifier[1].modifier ? feeSchedule.modifier[1].modifier.id : null;
		obj.modifier3 = feeSchedule.modifier[2] && feeSchedule.modifier[2].modifier ? feeSchedule.modifier[2].modifier.id : null;
		obj.modifier4 = feeSchedule.modifier[3] && feeSchedule.modifier[3].modifier ? feeSchedule.modifier[3].modifier.id : null;
		obj.pick_list_category = feeSchedule.pick_list_category ? feeSchedule.pick_list_category : null;
		obj.place_of_service_id = feeSchedule.place_of_service_id ? feeSchedule.place_of_service_id : null;
		obj.plan_id = feeSchedule.plan_id ? feeSchedule.plan_id : null;
		// obj.practices = feeSchedule.practices ? feeSchedule.practices.map(practice => {
		// 	return practice.practice ? { practice: { id: practice.practice.id }, location: { id: practice['location_id'] ? practice['location_id'] : null } } : null
		// }) : [];
		obj.provider_ids = feeSchedule.provider_ids ? feeSchedule.provider_ids.map(provider => {
			return provider['id']
		}) : [];
		obj.region = feeSchedule.region ? feeSchedule.region : null;
		obj.speciality_ids = feeSchedule.speciality_ids ? feeSchedule.speciality_ids.map(speciality => {
			return speciality['id']
		}) : null;
		obj.type_of_service = feeSchedule.type_of_service ? feeSchedule.type_of_service : null;
		obj.units = feeSchedule.units
		obj.visit_type_ids = feeSchedule.visit_type_ids ? feeSchedule.visit_type_ids : null;
		return obj
	}
	convertFormModelToFeeSchedule(formModel: FeeScheduleFormModel): FeeScheduleModel {
		
		var obj = new FeeScheduleModel()
		obj.id = formModel.id
		obj.base_price = formModel.base_price;
		obj.case_type_ids = formModel.case_type_ids;
		obj.code_id = formModel.code_id
		obj.comments = formModel.comments;
		obj.description = formModel.description;
		obj.employer_id = formModel.employer_id ? formModel.employer_id.map(id => {
			return id['id']
		}) : [];

		obj.expected_reimbursement = formModel.expected_reimbursement;
		obj.fee_type_id = formModel.fee_type_id;
		obj.insurance_id = formModel.insurances ? formModel.insurances.map(id => {
			return { insurance: { id: id }, from: formModel.insurance_from_date, to: formModel.insurance_to_date }
		}) : [];
		obj.modifier = [
			{ modifier: { id: formModel.modifier1 }, position: 1 },
			{ modifier: { id: formModel.modifier2 }, position: 2 },
			{ modifier: { id: formModel.modifier3 }, position: 3 },
			{ modifier: { id: formModel.modifier4 }, position: 4 }
		];
		obj.pick_list_category = formModel.pick_list_category
		obj.place_of_service_id = formModel.place_of_service_id
		obj.plan_id = formModel.plan_id
		obj.practice_ids = formModel.practice_ids ? formModel.practice_ids.map(id => {
			return id
		}) : [];
		obj.provider_ids = formModel.provider_ids ? formModel.provider_ids.map(id => {
			return id['id']
		}) : [];
		obj.region = formModel.region;
		obj.speciality_ids = formModel.speciality_ids ? formModel.speciality_ids.map(id => {
			return id['id']
		}) : null;
		obj.type_of_service = formModel.type_of_service;
		obj.units = formModel.units
		obj.visit_type_ids = formModel.visit_type_ids

		return obj;
	}
	// {{base_url}}providers?token={{token}}

	private getProviderUrl = "providers"
	getProvider() {
		return this.requestService.sendRequest(this.getProviderUrl, 'get', REQUEST_SERVERS.fd_api_url)
	}
	private facilitylocationsUrl = "facility_locations"
	getLocationAgainstPractice(id?) {
		return this.requestService.sendRequest(this.facilitylocationsUrl, 'get', REQUEST_SERVERS.fd_api_url, { id: id })
	}
}
