import { EORStatusUrlsEnum } from './../../front-desk/masters/billing/billing-master/eor.status.enum';
import { Injectable } from '@angular/core';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { DenialUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Denial-Urls-Enum';
import { EORUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/eor-type.enum';
import { PaidByUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PaidBy-Urls-Enum';
import { PaymentActionTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/payment.action.type.Enum';
import { PaymentTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PaymentType-Urls-enum';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/specialities-listing/Speciality-urls-enum';
import { Page } from '@appDir/front-desk/models/page';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { changeDateFormat, removeEmptyAndNullsFormObject, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { EorBillUrlsEnum } from '../eor-bill.url.enum';
import { FilterModel, IFilter } from '../Models/filter-model';
import { VerificationTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/VerificationType-Urls-Enum';
import { VerificationUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/verification-status.enum';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { DenialStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/denial.status.enum';
import { PaymentStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/payment.status.url';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { AttorneyUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { BillingStatusUrlsEnum } from '@appDir/front-desk/masters/billing/Billing-Status-Urls.Enum';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';

@Injectable({
	providedIn: 'root',
})
export class EORService {
	public doSearch = new BehaviorSubject({ status: false, componet: '' });
	public resetForm = new BehaviorSubject(false);
	public resetEorForm = new BehaviorSubject(false);
	public resetPaymentForm = new BehaviorSubject(false);
	public reloadEor = new BehaviorSubject(0);
	public eorId = new BehaviorSubject(0);
	public paymentId = new BehaviorSubject(0);
	public params: any;
	public page: Page = new Page();
	public bill_ids: number;
	public filter_Field: IFilter = new FilterModel();
	public eorPopupModelClose = new BehaviorSubject(false);
	public filterFormReset = new BehaviorSubject(false);
	public billFilterFormReset = new BehaviorSubject(false);
	eorTypeData: any[] = [];
	eorStatusComingData: any[] = [];
	caseTypes: any[] = [];
	constructor(private requestService: RequestService, private storageData: StorageData) {}

	/**
	 * intelecience for getSpeciality
	 * @param event
	 */

	getSpeciality(event?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
		};
		return this.requestService.sendRequest(
			SpecialityUrlsEnum.Speciality_list_Get,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...{ name: event.target.value } },
		);
	}

	/**
	 * intelecience for getProvider
	 * @param event
	 */

	getProvider(name?, id?,queryParams?) {
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
			EorBillUrlsEnum.searchProviderUrl,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...filter },
		);
	}

	/**
	 * intelecience for searchPractice
	 * @param event
	 */

	searchPractice(name?, id?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
		};
		let filter = {};
		id ? (filter['id'] = id) : name ? (filter['clinic_name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		return this.requestService.sendRequest(
			EorBillUrlsEnum.facility_locationsURL,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...filter },
		);
	}

	/**
	 * intelecience for searchRorType
	 * @param event
	 */

	searchRorType(name,queryParams: any) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
		};
		return this.requestService.sendRequest(
			EorBillUrlsEnum.EOR_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{
				name: name,
				...paramQuery,
			},
		);
	}

	/**
	 * intelecience for searchUserList
	 * @param event
	 */

	searchUserList(requestData: any,queryParams) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
		};
		return this.requestService.sendRequest(
			UsersUrlsEnum.UserListing_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{
				...paramQuery,
				name: requestData,
			},
		);
	}
	/**
	 * intelecience for searchBillIds
	 * @param event
	 */

	searchBillIds(e,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			// per_page: 10,
			// page: 1,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
		};
		return this.requestService.sendRequest(
			BillingEnum.getBillListing,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{
				bill_no: [e],
				...paramQuery
			},
		);
	}

	/**
	 * intelecience for searchCaseIds
	 * @param event
	 */

	searchCaseIds(query) {
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.GetCaseList,
			'GET',
			REQUEST_SERVERS.kios_api_path,
			removeEmptyAndNullsFormObject({ ...query }),
		);
	}

	/**
	 * push Params
	 * @param event
	 */

	pushDoSearch(status: boolean, component, param?: any) {
		this.params = param;
		this.doSearch.next({ status: status, componet: component });
	}

	/**
	 * pull Params
	 * @param event
	 */

	pullDoSearch() {
		return this.doSearch.asObservable();
	}

	/**
	 * pull denialSearch
	 * @param event
	 */

	denialSearch(name,queryParams: any) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
		};
		return this.requestService.sendRequest(
			DenialUrlsEnum.Denial_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{
				...paramQuery,
				name: name,
			},
		);
	}

	/**
	 * pull resetForm filterForm
	 * @param event
	 */

	pullResetForm() {
		return this.resetForm.asObservable();
	}

	/**
	 * pull resetForm filterForm
	 * @param event
	 */

	pushResetForm(s: boolean) {
		this.resetForm.next(s);
	}

	/**
	 * push Params eorPushId
	 * @param event
	 */

	eorPushId(id: number) {
		this.eorId.next(id);
	}

	/**
	 * pull eorPullId
	 * @param event
	 */

	eorPullId() {
		return this.eorId.asObservable();
	}

	getEorById(id: number) {
		return this.requestService.sendRequest(
			EorBillUrlsEnum.EOR_GET_ALL + '/' + id,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}

	/**
	 * pull Reset EorForm
	 * @param event
	 */

	pullResetEorForm() {
		return this.resetEorForm.asObservable();
	}

	/**
	 * pull Reset EorForm
	 *
	 */

	pushResetEorForm(s: boolean) {
		this.resetEorForm.next(s);
	}

	makeFilterObject(data: any) {
		let params = {};
		// params['per_page'] = 20;
		// params['page'] = 1;
		// params['pagination'] = 1;
		if (!data) {
			return;
		}
		params['filter'] = true;
		if (!!data.bill_ids && data.bill_ids != 0) {
			params['bill_ids'] = data.bill_ids;
		}
		if (!!data.invoice_ids && data.invoice_ids != 0) {
			params['invoice_ids'] = data.invoice_ids;
		}
		if (!!data.case_ids && data.case_ids != 0) {
			params['case_ids'] = data.case_ids;
		}
		if (!!data.speciality_ids && data.speciality_ids != 0) {
			params['speciality_ids'] = data.speciality_ids;
		}
		if (!!data.facility_ids && data.facility_ids != 0) {
			params['facility_ids'] = data.facility_ids;
		}
		if (!!data.doctor_ids && data.doctor_ids != 0) {
			params['doctor_ids'] = data.doctor_ids;
		}
		if (!!data.eor_type_ids && data.eor_type_ids != 0) {
			params['eor_type_ids'] = data.eor_type_ids;
		}
		if (!!data.description && data.description != 0) {
			params['description'] = data.description;
		}
		if (!!data.created_by_ids && data.created_by_ids != 0) {
			params['created_by_ids'] = data.created_by_ids;
		}
		if (!!data.updated_by_ids && data.updated_by_ids != 0) {
			params['updated_by_ids'] = data.updated_by_ids;
		}
		if ((data.bill_amount && data.bill_amount != null) || data.bill_amount === 0) {
			params['bill_amount'] = data.bill_amount;
		}
		if (!!data.posted_date_from && data.posted_date_from != 0) {
			params['posted_date_from'] = changeDateFormat(data.posted_date_from);
		}
		if (!!data.posted_date_to && data.posted_date_to != 0) {
			params['posted_date_to'] = changeDateFormat(data.posted_date_to);
		}
		if (!!data.bill_date && data.bill_date != 0) {
			params['bill_date'] = changeDateFormat(data.bill_date);
		}
		if (!!data.eor_amount && data.eor_amount != 0) {
			params['eor_amount'] = data.eor_amount;
		}
		if (!!data.denial_type_ids && data.denial_type_ids != 0) {
			params['denial_type_ids'] = data.denial_type_ids;
		}
		if (!!data.appeal_status && data.appeal_status != 0) {
			params['appeal_status'] = data.appeal_status;
		}
		if (!!data.appeal_status_ids && data.appeal_status_ids != 0) {
			params['appeal_status_ids'] = data.appeal_status_ids;
		}
		if (!!data.eor_amount && data.eor_amount != 0) {
			params['eor_amount'] = data.eor_amount;
		}
		if (!!data.comments && data.comments != 0) {
			params['comments'] = data.comments;
		}
		if (!!data.status_name && data.status_name != 0) {
			params['status_name'] = data.status_name;
		}
		if (!!data.action_type_ids && data.action_type_ids != 0) {
			params['action_type_ids'] = data.action_type_ids;
		}
		if (!!data.type_ids && data.type_ids != 0) {
			params['type_ids'] = data.type_ids;
		}
		if (!!data.by_ids && data.by_ids != 0) {
			params['by_ids'] = data.by_ids;
		}
		if (!!data.check_amount && data.check_amount != 0) {
			params['check_amount'] = data.check_amount;
		}
		if (!!data.no_of_days_from && data.no_of_days_from != 0) {
			params['no_of_days_from'] = data.no_of_days_from;
		}
		if (!!data.no_of_days_to && data.no_of_days_to != 0) {
			params['no_of_days_to'] = data.no_of_days_to;
		}
		if (!!data.invoice_patient_name && data.invoice_patient_name != '') {
			params['invoice_patient_name'] = data.invoice_patient_name;
		}
		if (!!data.name && data.name != '') {
			params['name'] = data.name;
		}
		if (!!data.createdBy && data.createdBy != '') {
			params['createdBy'] = data.createdBy;
		}
		if (!!data.reason && data.reason != 0) {
			params['reason'] = data.reason;
		}
		if (!!data.sent_description && data.sent_description != 0) {
			params['sent_description'] = data.sent_description;
		}
		if (!!data.denial_date_from && data.denial_date_from != 0) {
			params['denial_date_from'] = changeDateFormat(data.denial_date_from);
		}
		if (!!data.denial_date_to && data.denial_date_to != 0) {
			params['denial_date_to'] = changeDateFormat(data.denial_date_to);
		}
		if (!!data.eor_date_from && data.eor_date_from != 0) {
			params['eor_date_from'] = changeDateFormat(data.eor_date_from);
		}
		if (!!data.eor_date_to && data.eor_date_to != 0) {
			params['eor_date_to'] = changeDateFormat(data.eor_date_to);
		}
		if (!!data.sent_date && data.sent_date != 0) {
			params['sent_date'] = changeDateFormat(data.sent_date);
		}
		if (!!data.verification_date_from && data.verification_date_from != 0) {
			params['verification_date_from'] = changeDateFormat(data.verification_date_from);
		}
		if (!!data.verification_date_to && data.verification_date_to != 0) {
			params['verification_date_to'] = changeDateFormat(data.verification_date_to);
		}
		if (!!data.check_date && data.check_date != 0) {
			params['check_date'] = changeDateFormat(data.check_date);
		}
		if (!!data.sent_posted_date && data.sent_posted_date != 0) {
			params['sent_posted_date'] = changeDateFormat(data.sent_posted_date);
		}
		if (!!data.verification_type_ids && data.verification_type_ids != 0) {
			params['verification_type_ids'] = data.verification_type_ids;
		}
		if (!!data.verification_status_ids && data.verification_status_ids != 0) {
			params['verification_status_ids'] = data.verification_status_ids;
		}
		if (!!data.date_of_accident_from && data.date_of_accident_from != 0) {
			params['date_of_accident_from'] = changeDateFormat(data.date_of_accident_from);
		}
		if (!!data.date_of_accident_to && data.date_of_accident_to != 0) {
			params['date_of_accident_to'] = changeDateFormat(data.date_of_accident_to);
		}
		if (!!data.case_type_ids && data.case_type_ids != 0) {
			params['case_type_ids'] = data.case_type_ids;
		}
		if (!!data.patient_ids && data.patient_ids != 0) {
			params['patient_ids'] = data.patient_ids;
		}
		if (!!data.claim_no && data.claim_no != 0) {
			params['claim_no'] = data.claim_no;
		}
		if (!!data.attorney_ids && data.attorney_ids != 0) {
			params['attorney_ids'] = data.attorney_ids;
		}
		if (!!data.employer_ids && data.employer_ids != 0) {
			params['employer_ids'] = data.employer_ids;
		}
		if (!!data.firm_ids && data.firm_ids != 0) {
			params['firm_ids'] = data.firm_ids;
		}
		if (!!data.insurance_ids && data.insurance_ids != 0) {
			params['insurance_ids'] = data.insurance_ids;
		}
		if (!!data.payment_status_ids && data.payment_status_ids != 0) {
			params['payment_status_ids'] = data.payment_status_ids;
		}
		if (!!data.bill_status_ids && data.bill_status_ids != 0) {
			params['bill_status_ids'] = data.bill_status_ids;
		}
		if (!!data.denial_status_ids && data.denial_status_ids != 0) {
			params['denial_status_ids'] = data.denial_status_ids;
		}
		if (!!data.eor_status_ids && data.eor_status_ids != 0) {
			params['eor_status_ids'] = data.eor_status_ids;
		}
		if (data.bill_date_range1) {
			params['bill_date_range1'] = changeDateFormat(data.bill_date_range1);
		}
		if (data.bill_date_range2) {
			params['bill_date_range2'] = changeDateFormat(data.bill_date_range2);
		}
		if (data.created_at) {
			params['created_at'] = changeDateFormat(data.created_at );
		}
		if (data.updated_at) {
			params['updated_at'] = changeDateFormat(data.updated_at );
		}
		if (data.invoice_date_range1) {
			params['invoice_date_range1'] = changeDateFormat(data.invoice_date_range1);
		}
		if (data.invoice_date_range2) {
			params['invoice_date_range2'] = changeDateFormat(data.invoice_date_range2);
		}
		if(data.check_no){
			params['check_no']=data.check_no;
		}
		return params;
	}

	makeSingleNameFormFIrstMiddleAndLastNames(arrayName, key) {
		let arr = arrayName;
		arr = arr.filter(function (e) {
			return e;
		}); // The filtering function returns `true` if e is not empty.
		return arr.join(key);
	}

	/**
	 * Filter Field
	 *
	 */

	updateFilterField(status: boolean, name: string) {
		this.filter_Field[name] = status;
		return this.filter_Field;
	}

	/**
	 * Payment Types
	 *
	 */

	paymentType(params,queryParams?) {
		const filter = {
			order_by: 'name',
			filter: true,
			order: 'ASC',
			name: params,
			per_page : queryParams.per_page || 10,
			page : queryParams.page || 1,
		};
		return this.requestService.sendRequest(
			PaymentTypeUrlsEnum.PaymentType_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			filter,
		);
	}

	/**
	 * Payment By
	 *
	 */

	getPaymentBy(name, queryParams: any) {
		const filter = {
			order_by: 'name',
			filter: true,
			order: 'ASC',
			name: name,
			pagination:1,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1
		};
		return this.requestService.sendRequest(
			PaidByUrlsEnum.PaidBy_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyKeysFromObject(filter),
		);
	}

	/**
	 * Auction Type
	 *
	 */

	getActionType(params,queryparams) {
		const filter = {
			order_by: 'name',
			filter: true,
			order: 'ASC',
			name: params,
			pagination:1,
			per_page: queryparams.per_page || 10,
			page: queryparams.page || 1
		};
		return this.requestService.sendRequest(
			PaymentActionTypeUrlsEnum.Payment_Action_Type_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyKeysFromObject(filter),
		);
	}

	pushPaymentId(id: number) {
		this.paymentId.next(id);
	}

	pullPaymentId() {
		return this.paymentId.asObservable();
	}

	/**
	 * pull Reset EorForm
	 * @param event
	 */

	pullResetPaymentForm() {
		return this.resetPaymentForm.asObservable();
	}

	hasEORStatusList(): boolean {
		return this.eorStatusComingData.length === 0;
	}

	setEorStatus(eorStatusComingData: any[]) {
		this.eorStatusComingData = eorStatusComingData;
	}

	getEorStatus(params) {
		if (this.hasEORStatusList()) {
			return this.requestService.sendRequest(
				EORStatusUrlsEnum.EORStatus_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				params,
			);
		} else {
			return of(this.eorStatusComingData);
		}
	}

	/**
	 * pull Reset EorForm
	 *
	 */

	pushResetPaymentForm(s: boolean) {
		this.resetPaymentForm.next(s);
	}

	eorTypeList(queryParams: any) {
		if (this.eorTypeData.length != 0) {
			return of(this.eorTypeData);
		} else {
			return this.requestService.sendRequest(
				EORUrlsEnum.EOR_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				queryParams,
			);
		}
	}

	setEorType(eorType: any[]) {
		this.eorTypeData = eorType;
	}

	hasEorTypeList(): boolean {
		return this.eorTypeData.length === 0;
	}

	pushReloadEor(status: number) {
		this.bill_ids = status;
		this.reloadEor.next(status);
	}

	pullReloadEor() {
		return this.reloadEor.asObservable();
	}

	reloadEorAfterAdd() {
		this.reloadEor.next(this.bill_ids);
	}

	isBillId(): boolean {
		return this.bill_ids != 0 ? true : false;
	}

	setBillId(id: number) {
		this.bill_ids = id;
	}

	pushEorPopupModelClose(status: boolean) {
		this.eorPopupModelClose.next(status);
	}

	pullEorPopupModelClose() {
		return this.eorPopupModelClose.asObservable();
	}

	/**
	 * Invoked in VerificationsetPage and send GET request to get data from server
	 * @param queryParams
	 * @returns void
	 */
	getVerificationType(param: any,queryParam) {
		const queryParams = {
			filter: true,
			order: 'ASC',
			order_by: 'name',
			name: param,
			per_page: queryParam.per_page || 10,
			page: queryParam.page || 1,
		};
		return this.requestService.sendRequest(
			VerificationTypeUrlsEnum.VerificationType_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyKeysFromObject(queryParams),
		);
	}
	viewDocFile(link) {
		if (link) {
			window.open(link);
		}
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	getVerificationStatus(param: any,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			order_by: 'name',
		};
		const queryParamsFilter = {
			name: param,
			...paramQuery
		};
		return this.requestService.sendRequest(
			VerificationUrlsEnum.Verification_list_Status_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyKeysFromObject(queryParamsFilter),
		);
	}

	searchDenialStatus(param: any,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			order_by: 'name',
		};
		const queryParamsFilter = {
			name: param,
			...paramQuery
		};
		return this.requestService.sendRequest(
			DenialStatusUrlsEnum.DenialStatus_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParamsFilter,
		);
	}

	searchEorStatus(param: any,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			order_by: 'name',
		};
		const queryParamsFilter = {
			name: param,
			...paramQuery
		};
		return this.requestService.sendRequest(
			EORStatusUrlsEnum.EORStatus_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParamsFilter,
		);
	}

	searchPaymentStatus(param: any,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			order_by: 'name',
		};
		const queryParamsFilter = {
			name: param,
			...paramQuery
		};
		return this.requestService.sendRequest(
			PaymentStatusUrlsEnum.PaymentStatus_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			queryParamsFilter,
		);
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	getInsurance(event?,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			order_by: 'insurance_name',
		};
		return this.requestService.sendRequest(
			InsuranceUrlsEnum.Insurance_list_GET,
			'GET',
			REQUEST_SERVERS.billing_api_url,
			{ ...paramQuery, ...{ insurance_name: event } },
		);
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	getAttorney(event?,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: queryParams.per_page || 10,
			page:  queryParams.page || 1
		};
		return this.requestService.sendRequest(
			AttorneyUrlsEnum.attorney_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...{ insurance_name: event } },
		);
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	getBillstatus(event?,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			order_by: 'name',
		};
		return this.requestService.sendRequest(
			BillingStatusUrlsEnum.BillingStatus_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...{ name: event } },
		);
	}

	/**
	 * intelecience for search of Case Type
	 * @param event
	 */
	getAllSensationsOfCaseType() {
		debugger;
		if (this.hasCaseType()) {
		return this.requestService.sendRequest(
			'session/masters',
			'get',
			REQUEST_SERVERS.kios_api_path,
		);
		}else{
			return of(this.caseTypes);
		}
	}

	setCaseType(caseTypes: any[]) {
		this.caseTypes = caseTypes;
	}

	hasCaseType(): boolean {
		return this.caseTypes.length === 0;
	}

	/**
	 * intelecience for searchPatientName
	 * @param event
	 */

	searchPatientName(query?,queryParams?) {
		let paramQuery: ParamQuery = {
			// order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			...query
		};
		return this.requestService.sendRequest(
			PatientListingUrlsEnum.Patient_Get,
			'get',
			REQUEST_SERVERS.kios_api_path,
			paramQuery,
		);
	}

	searchOfPractice(queryParams) {
		var params: ParamQuery = { 
			filter: true,
			 order: OrderEnum.ASC,
			  pagination: true ,
			  per_page: queryParams.per_page || 10,
			  page: queryParams.page || 1,
			  name: queryParams.name
		} as any;

		return this.requestService.sendRequest(
			FacilityUrlsEnum.Facility_list_dropdown_GET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(params),
		);
	}

	pushFilterFormReset(action: boolean){
		this.filterFormReset.next(action);
	}
	pullFilterFormReset(){
		return this.filterFormReset.asObservable();
	}

	pushBillFilterFormReset(action: boolean){
		this.billFilterFormReset.next(action);
	}
	pullBillFilterFormReset(){
		return this.billFilterFormReset.asObservable();
	}
}
