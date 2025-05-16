import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { BillingEnum } from '../billing-enum';
import { ICDUrlsEnum } from '@appDir/front-desk/masters/billing/codes/icdcodes/ICD-Urls-Enum';
import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/speciality.enum';
import { VisitTypeUrlsEnum } from '@appDir/front-desk/masters/providers/vistType/visit.type.enum';
import { CaseTypeUrlsEnum } from '@appDir/front-desk/masters/providers/caseType/case.type.enum';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class BillingService {
	visitListingBill: any[] = [];
	public selected_bills: any = [];
	public recipients:any[]=[]
	// public allBillsSelected:any={}
	constructor(protected requestService: RequestService) {}
	getDetail(caseId) {
		return this.requestService
			.sendRequest(BillingEnum.getDetailUrl, 'get', REQUEST_SERVERS.kios_api_path, { caseId })
			.pipe(
			map((data) => {
				return data['data']['case'];
			}));
	}
	getBilling(formData) {
		return this.requestService.sendRequest(
			BillingEnum.getUrl,
			'get',
			REQUEST_SERVERS.fd_api_url_vd,
			formData,
		);
	}
	getProvidersForOnlyDiagnosticSpecialty(formData) {
		return this.requestService.sendRequest(
			BillingEnum.GetProvidersOnlyForDiagnosticSpecialty,
			'get',
			REQUEST_SERVERS.fd_api_url,
			formData,
		);
	}

	getProviderTechnisionForOnlyDiagnosticSpecialty(formData) {
		return this.requestService.sendRequest(
			BillingEnum.GetProviderTechnisionOnlyForDiagnosticSpecialty,
			'get',
			REQUEST_SERVERS.fd_api_url,
			formData,
		);
	}

	getAllVisits(formData) {
		return this.requestService.sendRequest(
			BillingEnum.getAllVisits,
			'get',
			REQUEST_SERVERS.fd_api_url_vd,
			formData,
		);
	}

	updateMultipleVisitbills(formData) {
		return this.requestService.sendRequest(
			BillingEnum.visitSessionMultipleUpdate,
			'put',
			REQUEST_SERVERS.fd_api_url_vd,
			formData,
		);
	}
	getSpecialitiesWithCount(formData) {
		return this.requestService.sendRequest(
			BillingEnum.getspecialityUrl,
			'get',
			REQUEST_SERVERS.fd_api_url_vd,
			{ case_id: formData },
		);
	}

	getCodes(name?, id?, page?) {
		debugger;
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: 10,
			page: page,
		};
		let filter = {};
		filter['type'] = 'ICD';
		id ? (filter['id'] = id) : name ? (filter['name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		return this.requestService.sendRequest(
			ICDUrlsEnum.ICD_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...filter, code_type_id: 1 },
		);
	}

	searchProvider(name?, id?, queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
		};
		let filter = {};
		id ? (filter['id'] = id) : name ? (filter['doctor_name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		return this.requestService.sendRequest(
			BillingEnum.searchProviderUrl,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...filter },
		);
	}
	searchInsurance(name?, id?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
			order_by: 'insurance_name',
		};
		let filter = {};
		id ? (filter['id'] = id) : name ? (filter['insurance_name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		return this.requestService.sendRequest(
			InsuranceUrlsEnum.Insurance_list_GET,
			'GET',
			REQUEST_SERVERS.billing_api_url,
			{ ...paramQuery, ...filter },
		);
	}

	searchPractice(name?, id?, queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
		};
		let filter = {};
		id ? (filter['id'] = id) : name ? (filter['clinic_name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		return this.requestService.sendRequest(
			FacilityUrlsEnum.Facility_list_dropdown_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...filter },
		);
	}
	searchSpeciality(name?, id?, queryParams?) {
		// let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: pagination, filter: false };
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
		};
		let filter = {};
		id ? (filter['id'] = id) : name ? (filter['name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		return this.requestService.sendRequest(
			SpecialityUrlsEnum.Speciality_list_Get,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...filter },
		);
	}
	getCPTCodes(name?, id?, page?) {
		debugger;
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: 10,
			page: page,
		};
		let filter = {};
		filter['type'] = 'CPT';
		id ? (filter['id'] = id) : name ? (filter['name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		return this.requestService.sendRequest(
			ICDUrlsEnum.ICD_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...filter, code_type_id: 2 },
		);
	}
	getvisitType() {
		return this.requestService.sendRequest(
			VisitTypeUrlsEnum.VisitType_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	getCaseType() {
		return this.requestService.sendRequest(
			CaseTypeUrlsEnum.CaseType_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}
	getStatusList() {
		return this.requestService.sendRequest(
			BillingEnum.getStatusList,
			'GET',
			REQUEST_SERVERS.fd_api_url_vd,
		);
	}
	submitVisirDesk(data) {
		return this.requestService.sendRequest(
			BillingEnum.createVisitDesk,
			'Post',
			REQUEST_SERVERS.fd_api_url_vd,
		);
	}
	UpdateVisirDesk(data) {
		return this.requestService.sendRequest(
			BillingEnum.updateVisitDesk,
			'PUT',
			REQUEST_SERVERS.fd_api_url_vd,
			data,
		);
	}
	deleteRecord(data) {
		return this.requestService.sendRequest('', 'GET', REQUEST_SERVERS.fd_api_url_vd);
	}
	uploadForm(data) {
		return this.requestService.sendRequest(
			BillingEnum.uploadFolder,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			data,
		);
	}
	getfoldername(data) {
		return this.requestService.sendRequest(
			BillingEnum.getfolder,
			'POST',
			REQUEST_SERVERS.fd_api_url,
			data,
		);
	}
	getCalculatedFeeSchedule(data) {
		return this.requestService.sendRequest(
			BillingEnum.getCalculatedfeeSchedules,
			'post',
			REQUEST_SERVERS.fd_api_url,
			data,
		);
	}

	getListOfSpecialityBill(param: any) {
		return this.requestService.sendRequest(
			BillingEnum.GetBillSpecailityList,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			param,
		);
	}

	getBillingRecord(formData, oldApi?) {
		return this.requestService.sendRequest(
			oldApi ? BillingEnum.getVisitUrl : BillingEnum.getVisiturlV1,
			'get',
			REQUEST_SERVERS.fd_api_url_vd,
			removeEmptyAndNullsFormObject(formData),
		);
	}
	searchCaseId(data) {
		const query = {
			filter: true,
			id: data,
		};
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.GetCaseList,
			'GET',
			REQUEST_SERVERS.kios_api_path,
			removeEmptyAndNullsFormObject({ ...query }),
		);
	}

	getCaseTypes() {
		return this.requestService.sendRequest(
			BillingEnum.CaseType_list_GET,
			'GET',
			REQUEST_SERVERS.kios_api_path,
		);
	}
	private trigger$ = new BehaviorSubject(false);
	public isEventTrigger$ = this.trigger$.asObservable();
	triggerEvent(status) {
		this.trigger$.next(status);
	}

	private verifiedPayment$ = new BehaviorSubject(false);
	public isVrifiedPayment$ = this.verifiedPayment$.asObservable();
	verifiedPayment(status) {
		this.verifiedPayment$.next(status);
	}

	private payments$ = new BehaviorSubject(false);
	public allpayments$ = this.payments$.asObservable();
	getPayments(value) {
		this.payments$.next(value);
	}
	setBillListing(lists: any) {
		const data = [
			{
				id: lists[0].id,
				visit_charges: lists[0].visit_charges,
				cpt_fee_schedules: lists[0].cpt_fee_schedules,
			},
		];
		this.visitListingBill = data;
		Object.freeze(this.visitListingBill);
	}
	getBillingListing() {
		return this.visitListingBill;
	}
	private selectedBills$ = new BehaviorSubject([]);
	public bills$ = this.selectedBills$.asObservable();
	getBills(bills) {
		this.selectedBills$.next(bills);
	}

	private billType$ = new BehaviorSubject<any>({});
	public billTypes$ = this.billType$.asObservable();
	getBillType(type) {
		this.billType$.next(type);
	}


}
