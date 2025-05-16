import { EorBillUrlsEnum } from './../../../eor/eor-bill.url.enum';
import { Injectable } from '@angular/core';
import { FilterModel, IFilter } from '@appDir/eor/Models/filter-model';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { BillingRecipientUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Billing-Recipient.Enum';
import { BillingStatusUrlsEnum } from '@appDir/front-desk/masters/billing/Billing-Status-Urls.Enum';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/specialities-listing/Speciality-urls-enum';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { PomEnum } from '@appDir/pom/pom.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { EmployerUrlsEnum } from '@appDir/front-desk/caseflow-module/case-insurance/employer/Employer-Urls-Enum';
import { AttorneyUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';

@Injectable({
	providedIn: 'root',
})
export class FilterService {
	public filter_Field: IFilter = new FilterModel();
	constructor(private requestService: RequestService) {}

	/**
	 * intelecience for searchBillIds
	 * @param event
	 */

	searchBillIds(e) {
		return this.requestService.sendRequest(
			BillingEnum.getBillListing,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{
				bill_no: [e],
				filter: true,
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

	makeSingleNameFormFIrstMiddleAndLastNames(arrayName, key) {
		let arr = arrayName;
		arr = arr.filter(function (e) {
			return e;
		}); // The filtering function returns `true` if e is not empty.
		return arr.join(key);
	}

	/**
	 * intelecience for search of Case Type
	 * @param event
	 */
	getAllSensationsOfCaseType() {
		return this.requestService.sendRequest(
			'session/masters',
			'get',
			REQUEST_SERVERS.kios_api_path,
		);
	}

	/**
	 * intelecience for searchPatientName
	 * @param event
	 */

	searchPatientName(query) {
		return this.requestService.sendRequest(
			PatientListingUrlsEnum.Patient_Get,
			'get',
			REQUEST_SERVERS.kios_api_path,
			query,
		);
	}

	/**
	 * intelecience for getSpeciality
	 * @param event
	 */

	getSpeciality(event?,queryParams?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page ||  1,
		};
		return this.requestService.sendRequest(
			SpecialityUrlsEnum.Speciality_list_Get,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{ ...paramQuery, ...{ name: event } },
		);
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
	 * intelecience for searchPomIds
	 * @param event
	 */

	searchPomIds(query) {
		return this.requestService.sendRequest(
			PomEnum.PomIntellisen,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject({ ...query }),
		);
	}

	/**
	 * intelecience for searchO f Practice Locatiom
	 * @param event
	 */

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

	/**
	 * intelecience for searchUserList
	 * @param event
	 */

	searchUserList(requestData: any) {
		return this.requestService.sendRequest(
			UsersUrlsEnum.UserListing_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			{
				filter: true,
				name: requestData,
			},
		);
	}

	/**
	 * Filter object for filteration
	 *
	 */

	/**
	 * intelecience for search
	 * @param event
	 */
	getBillstatus(event?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
		};
		return this.requestService.sendRequest(
			BillingStatusUrlsEnum.BillingStatus_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			paramQuery,
		);
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	getBillRecipient(event?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 50,
			page: 1,
		};
		return this.requestService.sendRequest(
			BillingRecipientUrlsEnum.BillingRecipient_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			paramQuery,
		);
	}

	getProvider(name?, id?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
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
	 * intelecience for search
	 * @param event
	 */
	getJobStatus() {
		return this.requestService.sendRequest(
			BillingRecipientUrlsEnum.BillingJobStatus,
			'GET',
			REQUEST_SERVERS.fd_api_url,
		);
	}

	/**
	 * intelecience for search
	 * @param event
	 */
	searchEmployer(data: any) {
		var params: ParamQuery = { filter: true, order: OrderEnum.ASC, pagination: false , name: data } as any;

		return this.requestService.sendRequest(
			EmployerUrlsEnum.Employer_list_GET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			params,
		);
	}


	/**
	 * intelecience for search
	 * @param event
	 */
	 getAttorney(event?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 100,
			page: 1,
		};
		return this.requestService
			.sendRequest(AttorneyUrlsEnum.attorney_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, {
				...paramQuery,
				...{ insurance_name: event },
			});
	}

	searchAttorney(queryParams?){
		
		let paramQuery: ParamQuery = {
			...queryParams,
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			dropDownFilter:true,
			per_page: queryParams ? queryParams.per_page : 10,
			page: queryParams ? queryParams.page : 1,
		};

		return this.requestService.sendRequest(
			AttorneyUrlsEnum.attorney_list_GET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(paramQuery)
		);
	}
	/**
	 * intelecience for search
	 * @param event
	 */
	 getInsurance(event?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
			order_by: 'insurance_name',
		};
		return this.requestService.sendRequest(
			InsuranceUrlsEnum.Insurance_list_GET,
			'GET',
			REQUEST_SERVERS.billing_api_url,
			{ ...paramQuery, ...{ insurance_name: event.target.value } },
		);
	}

	filterResponse(filterFormData: any) {
		const filters = removeEmptyAndNullsFormObject(filterFormData);
		if (filters.bill_date_from) {
			filters.bill_date_from = changeDateFormat(filters.bill_date_from);
		}
		if (filters.bill_date_to) {
			filters.bill_date_to = changeDateFormat(filters.bill_date_to);
		}
		if (filters.bill_date_range1) {
			filters.bill_date_range1 = changeDateFormat(filters.bill_date_range1);
		}
		if (filters.bill_date_range2) {
			filters.bill_date_range2 = changeDateFormat(filters.bill_date_range2);
		}
        if (filters.visit_date_range_1) {
			filters.visit_date_range_1 = changeDateFormat(filters.visit_date_range_1);
		}
		if (filters.visit_date_range_2) {
			filters.visit_date_range_2 = changeDateFormat(filters.visit_date_range_2);
		}
		if (filters.scan_upload_date_from) {
			filters.scan_upload_date_from = changeDateFormat(filters.scan_upload_date_from);
		}
		if (filters.scan_upload_date_to) {
			filters.scan_upload_date_to = changeDateFormat(filters.scan_upload_date_to);
		}
		if (filters.pom_date) {
			filters.pom_date = changeDateFormat(filters.pom_date);
		}
		if (filters.created_at) {
			filters.created_at = changeDateFormat(filters.created_at);
		}
		if (filters.updated_at) {
			filters.updated_at = changeDateFormat(filters.updated_at);
		}		
		if (filters.patient_ids && !filters.patient_ids.length ) {
			filters.patient_ids = [filters.patient_ids];
		}
		if (filters.firm_ids && !filters.firm_ids.length ) {
			filters.firm_ids = [filters.firm_ids];
		}
		if(filters?.type_ids){
			filters.type_id=[filters.type_ids]
		}
		return filters;
	}
}
