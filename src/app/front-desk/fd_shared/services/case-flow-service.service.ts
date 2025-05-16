import { Observable, zip, BehaviorSubject, throwError, Subject, pipe, of, fromEvent } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, map } from 'rxjs';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { catchError, take } from 'rxjs/operators';


import { NF2Urls } from '@appDir/front-desk/caseflow-module/case-insurance/insurance/insuranceUrls';
import { envelope_providers } from '@appDir/shared/models/nf2/nf2Info';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';

import { CaseCategorySlugEnum, CaseModel, DialogEnum, MRI } from '../models/Case.model';
import { CaseTypeEnum, PurposeVisitSlugEnum } from '../models/CaseTypeEnums';
import { AclService } from '@appDir/shared/services/acl.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { CaseFlowUrlsEnum } from '../models/CaseFlowUrlsEnum';
import { CaseStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/CaseStatus-Urls-Enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { CategoryOptionSlugEnum } from '@appDir/shared/components/general.enum';
import { CaseTypeUrlsEnum } from '@appDir/front-desk/masters/providers/caseType/case.type.enum';
import { GenderEnum } from '../models/Patient.model';
@Injectable({
	providedIn: 'root',
})
export class CaseFlowServiceService {
	onCaseUpdated: BehaviorSubject<any> = new BehaviorSubject(null);
	envelopeProviders: Subject<envelope_providers[]> = new Subject();
	caseFlowRoutes: CaseFlowProgression;
	loadSpin: boolean = false;
	routes: Step[];
	public languages: any =  [] ;
	commentsCategory: any[] =[];
	documentSocketId:any;
	nf2Status: BehaviorSubject<string> = new BehaviorSubject('No');
	acc_info: any;
	patient: any;
	basic_info: any;
	form_filler: any;
	emg_info: any;
	guarantor_info: any;
	phy_info: any;
	ins: any;
	emp: any;
	pov: any;
	vehicle: any;
	accident: any;
	house_hold_info: any;
	med_treatment: any;
	gen_details: any;
	mri: any;
	route_link: any;
	constructor(
		public aclService: AclService,
		private requestService: RequestService,
		private router: Router,
		private location: Location,
		private route: ActivatedRoute,
		private toasterService: ToastrService
	) {
		this.caseFlowRoutes = new CaseFlowProgression(aclService);
		this.routes = [
			{
				route: 'cases/list',
				permission: USERPERMISSIONS.patient_case_list_listing,
				children: [],
				shouldAllow: this.shouldShowCaseList.bind(this),
			},
			{
				route: 'patient/patient_summary',
				permission: USERPERMISSIONS.patient_case_list_patient_summary,
				children: [],
				shouldAllow: this.shouldShowPatientSummary.bind(this),
			},
			{
				route: 'patient/case-info',
				permission: USERPERMISSIONS.patient_case_list_case_info_menu,
				children: [],
			},
			{
				route: 'patient/personal-information/personal',
				permission: USERPERMISSIONS.patient_case_list_personal_information_personal_tab,
				children: [],
				shouldAllow: this.shouldShowEmploymentInfoForm.bind(this),
			},
			{
				route: 'patient/personal-information/basic-contact',
				permission: USERPERMISSIONS.patient_case_list_personal_information_basic_contact_tab,
				children: [],
				shouldAllow: this.shouldShowBasicContact.bind(this),
			},
			{
				route: 'patient/personal-information/form-filler',
				permission: USERPERMISSIONS.patient_case_list_personal_information_form_filler_tab,
				children: [],
				shouldAllow: this.shouldShowFormFiller.bind(this),
			},
			{
				route: 'patient/personal-information/emergency-contact',
				permission: USERPERMISSIONS.patient_case_list_personal_information_emergency_contact_tab,
				children: [],
				shouldAllow: this.shouldShowEmergencyContact.bind(this),
			},
			{
				route: 'patient/personal-information/guarantor',
				permission: USERPERMISSIONS.patient_case_list_personal_information_gurantor_tab,
				children: [],
				shouldAllow: this.shouldShowGuarantor.bind(this),
			},
			{
				route: 'referrals',
				permission: USERPERMISSIONS.patient_case_list_referrals_menu,
				children: [],
				shouldAllow: this.isNotLawEnforcementAgent.bind(this),
			},
			{
				route: 'case-insurance/insurance',
				permission: USERPERMISSIONS.patient_case_list_insurance_insurance_tab,
				children: [],
				shouldAllow: this.shouldShowInsurance.bind(this),
			},
			{
				route: 'case-insurance/attorney',
				permission: USERPERMISSIONS.patient_case_list_insurance_attorney_tab,
				children: [],
				shouldAllow: this.shouldShowAttorney.bind(this),
			},
			{
				route: 'case-insurance/employer',
				permission: USERPERMISSIONS.patient_case_list_insurance_employer_tab,
				children: [],
				shouldAllow: this.shouldShowEmployer.bind(this),
			},
			{
				route: 'case-insurance/accident',
				permission: USERPERMISSIONS.patient_case_list_insurance_accident_tab,
				children: [],
				shouldAllow: this.shouldShowAccident.bind(this),
			},
			{
				route: 'case-insurance/vehicle',
				permission: USERPERMISSIONS.patient_case_list_insurance_vehicle_tab,
				children: [],
				shouldAllow: this.shouldShowVehicle.bind(this),
			},
			{
				route: 'case-insurance/house-hold-info',
				permission: USERPERMISSIONS.patient_case_list_insurance_household_tab,
				children: [],
				shouldAllow: this.shouldShowHouseHoldInformation.bind(this),
			},
			{
				route: 'case-insurance/medical-treatment',
				permission: USERPERMISSIONS.patient_case_list_insurance_medical_treatment_tab,
				children: [],
				shouldAllow: this.shouldShowMedical.bind(this),
			},
			{
				route: 'case-insurance/mri-intakes',
				permission: 'no-permission',
				children: [],
				shouldAllow: this.shouldShowMRI.bind(this),
			},
			{
				route: 'injury',
				permission: USERPERMISSIONS.patient_case_list_injury_menu,
				children: [],
				shouldAllow: this.shouldShowInjury.bind(this),
			},
			{
				route: 'marketing',
				permission: USERPERMISSIONS.patient_case_list_marketing_menu,
				children: [],
				shouldAllow: this.shouldShowMarketting.bind(this),
			},
			{
				route: 'document',
				permission: USERPERMISSIONS.patient_case_list_docs_menu,
				children: [],
				shouldAllow: this.shouldShowDocument.bind(this),
			},
			{
				route: 'scheduler',
				permission: USERPERMISSIONS.patient_case_list_scheduler_menu,
				children: [],
				shouldAllow: this.shouldShowScheduler.bind(this),
			},
			{
				route: 'visits',
				permission: USERPERMISSIONS.patient_case_list_visits_menu,
				children: [],
				shouldAllow: this.shouldShowVisit.bind(this),
			},
			{
				route: 'billing',
				permission: USERPERMISSIONS.patient_case_list_billing_menu,
				children: [],
				shouldAllow: this.shouldShowBilling.bind(this),
			},
		];

		this.caseFlowRoutes.routes = this.routes;
	}

	isNotLawEnforcementAgent() {
		return !this.isLawEnforcemnetAgent();
	}
	case: CaseModel;
	softCase: any;
	casetype: any;
	check_duplication_of_soft_case = true;
	data = {};
	/**
	 * This function checks if case is available and provides if it is, else fetches from the backend.
	 */

	getCase(id, route?): Observable<any> {
		debugger;
		this.loadSpin = true;
		if (!route) {
			let urlarr = this.router.url.split('/');
			route = urlarr[urlarr.length - 1].replace('-', '_');
		}
		if(this.data[route]) {
			delete this.data['attorney'];
		}
		if (
			this.case &&
			this.case.id == id &&
			this.data[route] &&
			route !== 'patient_summary' &&
			route !== 'insurance' &&
			this.data['insurance'] &&
			route !== 'accident'
		) {
			//   console.log(this.data['employer']['result']['data']['employer']);
			this.loadSpin = true;
			this.case.employer =
				this.data &&
				this.data['employer'] &&
				this.data['employer']['result'] &&
				this.data['employer']['result']['data'] &&
				this.data['employer']['result']['data']['employer'] &&
				this.data['employer']['result']['data']['employer'];
			//   console.log(this.data.employer.result.data.employer);
			//   this.case.employer=this.data.employer.result.data.employer;
			let response = { message: 'success', status: 200, result: { data: this.case } };
			setTimeout(() => {
						this.loadSpin = false;
					},1000);
			return new Observable((subscriber) => subscriber.next(response)).pipe(take(1));
		} else {
			if (this.case && this.case.id != id) {
				this.data = {};
				this.case = null;
			}
			if (route === 'patient_summary') {
				this.data = {};
			}
			this.loadSpin = true;
			return this.getCaseFromBackend(id, route)
			    .pipe(
				  map((response) => {
					this.loadSpin = true;
					setTimeout(() => {
						this.loadSpin = false;
					},1000);
					if(route=='study_details' || route=='surgery_details')
					{
						if(!this.case.mri)
								{
									this.case.mri=new MRI();
								}
						switch(route)
						{
							case 'surgery_details':
								this.case.mri.mri_intake_1['is_prior_surgery']=response['result']['data']?response['result']['data'].is_prior_surgery:null;
								this.case.mri.mri_intake_1['prior_surgery_details']=response['result']['data']?response['result']['data'].prior_surgery_details:null
							break;
							case 'study_details':
								this.case.mri.mri_intake_1['is_imaging_study']=response['result']['data']?response['result']['data'].is_imaging_study:null;
								this.case.mri.mri_intake_1['imaging_study_details']=response['result']['data']?response['result']['data'].imaging_study_details:null
						}
						
					}
					else
					{
						this.case = { ...this.case, ...response['result']['data'] };
					}
					
					if(route!="mri" && route!="surgery_details" && route!="study_details")
					{
						this.data[route] = response;
					}
					if(this.case) {
						this.acc_info = this.case?.accident_information ? this.case?.accident_information : this.acc_info;
						this.patient = this.case?.patient ? this.case?.patient : this.patient;
						this.basic_info = (route === 'all_info' || route === 'basic_contact') ? this.case?.basic_information : this.basic_info;
						this.form_filler = (route === 'all_info' || route === 'form_filler') ? this.case?.form_filler_information : this.form_filler;
						this.emg_info = (route === 'all_info' || route === 'emergency_contact') ? this.case?.emergency_information : this.emg_info;
						this.guarantor_info = (route === 'all_info' || route === 'guarantor') ? this.case?.guarantor_information : this.guarantor_info;
						this.phy_info = (route === 'all_info' || route === 'referrals') ? this.case['physician'] : this.phy_info;
						this.ins = this.case?.insurance ? this.case?.insurance : this.ins;
						this.emp = (route === 'all_info' || route === 'employer') ? this.case?.employer : this.emp;
						this.pov = (route === 'all_info' || route === 'employer') ? this.case?.purpose_of_visit : this.pov;
						this.vehicle = (route === 'all_info' || route === 'vehicle') ? this.case['object_involved'] : this.vehicle;
						this.accident = (route === 'all_info' || route === 'accident') ? this.case?.accident : this.accident;
						this.house_hold_info = (route === 'all_info' || route === 'house_hold_info') ? this.case['house_hold_information'] : this.house_hold_info;
						this.med_treatment = (route === 'all_info' || route === 'medical_treatment') ? this.case['medical_treatment'] : this.med_treatment;
						this.gen_details = (route === 'all_info' || route === 'medical_treatment') ? this.case['general_details'] : this.gen_details;
						this.mri = (route === 'all_info' || route === 'mri') ? this.case?.mri : this.mri;
						this.route_link = route;
					}
					this.onCaseUpdated.next(true);
					return response;
				}))
				.pipe(
					catchError((err: HttpErrorResponse) => {
					setTimeout(() => {
						this.loadSpin = false;
					},1000);
					this.toasterService.error(err && err.error && err.error.message ? err.error.message : 'Something went wrong' , 'Error');
					return throwError(err);
				}));
		}
	}
	
	getLanguageList(filter?): Observable<any> {
		let _languages = [...this.languages];
		if (_languages && _languages.length < 1) {
			return this.requestService.getLanguageList().pipe(
				map((result: any) => {
					this.languages = result.data ? result.data : [];
					if (filter) {
						_languages = this.languages.filter((lang) => {
							return lang.name.toLowerCase().startsWith(filter.toLowerCase());
						});

						// 	languages=languages.filter(lang => {
						// 			return lang.name.toLowerCase().includes(filter.toLowerCase())
						// 	})
						// 	let first = [];
						// 	let others = [];
						// for (var i = 0; i < languages.length; i++) {
						// 	if (languages[i].name.toLowerCase().startsWith(filter.toLowerCase())) {
						//         first.push(languages[i]);
						//     } else {
						//         others.push(languages[i]);
						//     }
						// }
						// first.sort();
						// others.sort();
						// return(first.concat(others));
					}
					return _languages.sort(function (a, b) {
						let x = a.name.toUpperCase(),
							y = b.name.toUpperCase();
						return x == y ? 0 : x > y ? 1 : -1;
					});
				}),
			);
		} else {
		
			if (filter) {
				_languages = _languages.filter((lang) => {
					return lang.name.toLowerCase().startsWith(filter.toLowerCase());
				});
			}
			_languages = _languages.sort(function (a, b) {
				let x = a.name.toUpperCase(),
					y = b.name.toUpperCase();
				return x == y ? 0 : x > y ? 1 : -1;
			});
			return of(_languages);
		}
	}
	getUpdatedMedicationsLists(id) {
		this.loadSpin = true;
		return this.requestService
			.sendRequest(
				CaseFlowUrlsEnum.GetCaseDetailMedication,
				'get',
				REQUEST_SERVERS.kios_api_path,
				{ id: id, route: CaseFlowUrlsEnum.GetMedicationRoute },
			).pipe(
			map((response) => {
				this.loadSpin = false;
				return response;
			})).pipe(
				catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
	}

	deleteIntake_2_Medication(medications_ids) {
		this.loadSpin = true;
		return this.requestService
			.sendRequest(
				CaseFlowUrlsEnum.sessionMri,
				'delete_with_body',
				REQUEST_SERVERS.kios_api_path,
				medications_ids,
			)
			.pipe(
			map((response) => {
				this.loadSpin = false;
				return response;
			}))
			.pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
	}

	add_Edit_Intake_2_Medication(medicationObject) {
		this.loadSpin = true;
		return this.requestService
			.sendRequest(
				CaseFlowUrlsEnum.addEditMedication,
				'put',
				REQUEST_SERVERS.kios_api_path,
				medicationObject,
			).pipe(
			map((response) => {
				this.loadSpin = false;
				return response;
			}))
			.pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
	}
	resetCaseAndDataObject() {
		this.case = null;
		this.data = {};
	}

	getPersonalInformation(id) {
		return this.getCaseFromBackend(id, 'personal')
		.pipe(
		map((response) => {
			this.case = { ...this.case, ...response['result']['data'] };
			this.data['personal'] = response;
			return response;
		}));
	}


 updateNF2Status(data:any):Observable<any> {
    this.loadSpin = true;
    return this.requestService.sendRequest(NF2Urls.update_nf2_status, 'put', REQUEST_SERVERS.kios_api_path, data)
	.pipe(
	map(response => {
      this.loadSpin = false;
      return response;
    }))
	.pipe(
	catchError((err: HttpErrorResponse) => {
      this.loadSpin = false;
      this.toasterService.error(err.error.message, 'Error')
      return throwError(err)
    }));

  }

	getNf2Status() {
		return this.nf2Status;
	}
	setNf2Status(status: any) {
		this.nf2Status.next(status);
	}

	public getCaseFromBackend(id, route) {
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.GetCaseDetail,
			'get',
			REQUEST_SERVERS.kios_api_path,
			{ id: id, route: route },
		);
	}

	searchPractice(queryParams?) {
		let paramQuery: any = {
			order: OrderEnum.ASC,
			filter: queryParams?.filter ? true : false,
			pagination: true,
			per_page: queryParams ? queryParams.per_page : 10,
			dropDownFilter:true,
			page: queryParams ? queryParams.page : 1,
			facility_location_ids: queryParams.facility_location_ids?queryParams.facility_location_ids:null
		};

		return this.requestService.sendRequest(
			FacilityUrlsEnum.Facility_list_dropdown_GET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(paramQuery),
		);
		// return this.requestService.sendRequest('search_clinic', 'get', REQUEST_SERVERS.fd_api_url, params)
	}
	searchMultipleSoftPatient(queryParams?,URL?) {
		let paramQuery = removeEmptyAndNullsFormObject(queryParams);
		return this.requestService.sendRequest(
			URL.Api_URL,
			'get',
			URL.Main_URL,
			paramQuery,
		);
	}


getCaseRefferalInfo() {
		debugger;
		return;;
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.CaseFlowReferralInfo,
			'GET',
			REQUEST_SERVERS.fd_api_url
		);
	}


	searchCaseTypes(queryParams?) {
		debugger;
		let paramQuery:any = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: true,
			dropDownFilter:true,
			per_page: queryParams ? queryParams.per_page : 10,
			page: queryParams ? queryParams.page : 1,
			name: queryParams && queryParams.name ? queryParams.name : null
		};

		return this.requestService.sendRequest(
			CaseTypeUrlsEnum.CaseType_list_GET,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(paramQuery)
		);
	}
	searchEmployer(queryParams?){
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
			CaseStatusUrlsEnum.Case_all_employer,
			'get',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObject(paramQuery)
		);
	}
	searchCaseStatus(queryParams?) {
		debugger;
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			dropDownFilter:true,
			per_page: queryParams ? queryParams.per_page : 10,
			page: queryParams ? queryParams.page : 1,
		};

		return this.requestService.sendRequest(
			CaseStatusUrlsEnum.CaseStatus_list_GET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			paramQuery,
		);
	}

	searchPracticeTypahead(queryParams?) {
		debugger;
		let params: ParamQuery = {
			filter: queryParams.name ? true : false,
			order: OrderEnum.ASC,
			pagination: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			name: queryParams.name,
		} as any;

		params = removeEmptyAndNullsFormObject(params);
		return this.requestService.sendRequest(
			FacilityUrlsEnum.Facility_list_dropdown_GET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			params,
		);
		// return this.requestService.sendRequest('search_clinic', 'get', REQUEST_SERVERS.fd_api_url, params)
	}
	searchMultipleTypahead(queryParams?,URL?) {
		let params = removeEmptyAndNullsFormObject(queryParams);
		return this.requestService.sendRequest(
			URL.Api_URL,
			'get',
			URL.Main_URL,
			params,
		);
	}
	searchCaseStatusTypahead(queryParams?) {
		debugger;
		let params: ParamQuery = {
			filter: queryParams.name ? true : false,
			order: OrderEnum.ASC,
			pagination: true,
			per_page: queryParams.per_page || 10,
			page: queryParams.page || 1,
			name: queryParams.name,
		} as any;

		params = removeEmptyAndNullsFormObject(params);
		return this.requestService.sendRequest(
			 CaseStatusUrlsEnum.CaseStatus_list_GET,
			'get',
			REQUEST_SERVERS.fd_api_url,
			params,
		);
		// return this.requestService.sendRequest('search_clinic', 'get', REQUEST_SERVERS.fd_api_url, params)
	}
	recursiveRemoveEmptyAndNullsFormObject(obj: any) {
		// Object.keys(obj).forEach(key => {
		//   if (key == 'work_stop') {
		//     ;
		//   }
		//   if (obj[key] === null || obj[key] === '') {
		//     delete obj[key]
		//   } else if (typeof obj[key] === 'object') {
		//     this.recursiveRemoveEmptyAndNullsFormObject(obj[key])
		//   }
		// });

		return obj;
	}
	updateCase(id, data) {
		let urlarr = this.router.url.split('/');

		let route = urlarr[urlarr.length - 1].replace(/-/g, '_');

		if (!data.case_type_id && this.case.case_type_id) {
			data.case_type_id = this.case.case_type_id;
		}
		this.loadSpin = true;

		return this.requestService
			.sendRequest(
				`${CaseFlowUrlsEnum.UpdateSession}?caseId=${id}`,
				'put',
				REQUEST_SERVERS.kios_api_path,
				data,
			)
			.pipe(
			map((response) => {
				this.loadSpin = false;
				// this.case = null;
				delete this.data[route];
				return response;
			}))
			.pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				if(!(err.status == 406))
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
		// .map(response => {
		//   if (response['status'] == 200) {
		//     let urlarr = this.router.url.split('/');
		//     let route = urlarr[urlarr.length - 1].replace('-', '_');
		//     this.getCase(id, route).subscribe(data => {
		//       this.goToNextStep()
		//     })
		//   }
		// })
	}

	deleteSessionMri( data) {
		let urlarr = this.router.url.split('/');

		let route = urlarr[urlarr.length - 1].replace(/-/g, '_');

		// if (!data.case_type_id && this.case.case_type_id) {
		// 	data.case_type_id = this.case.case_type_id;
		// }
		// let _data = this.recursiveRemoveEmptyAndNullsFormObject(data)
		// console.log(data, _data)
		this.loadSpin = true;

		return this.requestService
			.sendRequest(
				CaseFlowUrlsEnum.sessionMri,
				'delete_with_body',
				REQUEST_SERVERS.kios_api_path,
				data,
			)
			.pipe(
			map((response) => {
				this.loadSpin = false;
				// this.case = null;
				delete this.data[route];
				return response;
			}))
			.pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
		// .map(response => {
		//   if (response['status'] == 200) {
		//     let urlarr = this.router.url.split('/');
		//     let route = urlarr[urlarr.length - 1].replace('-', '_');
		//     this.getCase(id, route).subscribe(data => {
		//       this.goToNextStep()
		//     })
		//   }
		// })
	}


	submitNF2(data) {
		this.loadSpin = true;

		return this.requestService
			.sendRequest(NF2Urls.NF2_Info_Submitted, 'post', REQUEST_SERVERS.kios_api_path, data)
			.pipe(
			map((response) => {
				this.loadSpin = false;
				// this.case = null;
				//   delete this.data[route]
				return response;
			})).pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
		// .map(response => {
		//   if (response['status'] == 200) {
		//     let urlarr = this.router.url.split('/');
		//     let route = urlarr[urlarr.length - 1].replace('-', '_');
		//     this.getCase(id, route).subscribe(data => {
		//       this.goToNextStep()
		//     })
		//   }
		// })
	}

	getNF2Info(id) {
		this.loadSpin = true;

		return this.requestService
			.sendRequest(`${NF2Urls.NF2_Info_Get}?case_id=${id}`, 'Get', REQUEST_SERVERS.kios_api_path)
			.pipe(
			map((response) => {
				this.loadSpin = false;

				return response;
			})).pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
	}

	generateNF2PDFFrontDesk(data) {
		this.loadSpin = true;
		return this.requestService
			.sendRequest(
				NF2Urls.NF2_Info_generate_PDF_front_desk,
				'post',
				REQUEST_SERVERS.kios_api_path,
				data,
			)
			.pipe(
			map((response) => {
				this.loadSpin = false;
				// this.case = null;
				//   delete this.data[route]
				return response;
			}))
			.pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
	}

	get_nf2_latest_files_by_caseId(data) {
		this.loadSpin = true;
		return this.requestService
			.sendRequest(NF2Urls.NF2_get_latest_files_by_caseId, 'post', REQUEST_SERVERS.fd_api_url, data)
			.pipe(
			map((response) => {
				this.loadSpin = false;
				// this.case = null;
				//   delete this.data[route]
				return response;
			}))
			.pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
	}

	envelopNF2(data) {
		this.loadSpin = true;
		return this.requestService
			.sendRequest(
				NF2Urls.NF2_Info_generate_envelop_front_desk,
				'post',
				REQUEST_SERVERS.kios_api_path,
				data,
			)
			.pipe(
			map((response) => {
				this.loadSpin = false;
				// this.case = null;
				//   delete this.data[route]
				return response;
			})).pipe(
			catchError((err: HttpErrorResponse) => {
				this.loadSpin = false;
				this.toasterService.error(err.error.message, 'Error');
				return throwError(err);
			}));
	}

	goToNextStep(defaultCreateCaseInforoute?, caseid?) {
		debugger;
		let case_id = this.case && this.case.id ? this.case.id : caseid;
		var route = 'front-desk/cases/edit/' + case_id + '/';
		let urlarr = this.router.url.split('/');
		let _route = urlarr[urlarr.length - 1];
		let url: any;
		if (defaultCreateCaseInforoute) {
			url = this.caseFlowRoutes.getNextStep(defaultCreateCaseInforoute);
		} else {
			url = this.caseFlowRoutes.getNextStep(_route);
		}

		let finalRoute = url ? route + url.route : this.router.url;
		if (url) {
			this.router.navigate([route + url.route]);
		}
		// else
		// {
		// 	this.router.navigateByUrl(finalRoute, { skipLocationChange: true }).then(page => { window.location.reload(); });
		// 	// this.router.navigateByUrl('/', {skipLocationChange: true})
		// 	// .then(() => {
		// 	// 	this.router.navigate([finalRoute])});
		// }
		// this.router.navigateByUrl(finalRoute);
		// this.router.navigate(['../'], { relativeTo: this.route });
	}

	// route: Step[] = [
	//   {
	//     name: 'Personal Information', route: 'personal-information', children: [
	//       {

 
  // getCasePractices() {
  //   return this.requestService.sendRequest(CaseFlowUrlsEnum.GetCasePractices, 'get', REQUEST_SERVERS.kios_api_path)
  // }

  // getCaseCategories(){
  //   return this.requestService.sendRequest()
  // }
 
 

	checkAge() {
		return this.case && this.case.patient && this.calculateAge(this.case.patient.dob) < 18;
	}
	checkIsGuarantor() {
		let isFormFillerGuarantor =
			this.case &&
			this.case.form_filler_information &&
			this.case.form_filler_information.is_guarantor;
		let isEmergencyGuarantor =
			this.case && this.case.emergency_information && this.case.emergency_information.is_guarantor;
		if (isFormFillerGuarantor == DialogEnum.yes || isFormFillerGuarantor == DialogEnum.skip) {
			return false;
		} else if (isEmergencyGuarantor == DialogEnum.yes || isEmergencyGuarantor == DialogEnum.skip) {
			return false;
		} else {
			return true;
		}
	}
	shouldShowGuarantorOption() {
		let ageCondition = this.checkAge();
		// let isGuarantorCondition = this.checkIsGuarantor()
		let isLawEnforcemnetAgent = this.isLawEnforcemnetAgent();
		if (ageCondition && !isLawEnforcemnetAgent) {
			return true;
		}
		return false;
	}
	shouldShowGuarantor() {
		let ageCondition = this.checkAge();
		let isGuarantorCondition = this.checkIsGuarantor();
		let isLawEnforcemnetAgent = this.isLawEnforcemnetAgent();
		let skip_basic_contact =
			this.case &&
			this.case.basic_information &&
			this.case.basic_information.is_form_filler === DialogEnum.skip
				? true
				: false;
		if (ageCondition && isGuarantorCondition && !isLawEnforcemnetAgent && !skip_basic_contact) {
			return true;
		}
		return false;
	}
	shouldShowFormFiller() {
		if (
			(this.case &&
				this.case.basic_information &&
				this.case.basic_information.is_form_filler != DialogEnum.other) ||
			this.isLawEnforcemnetAgent()
		) {
			return false;
		}
		return true;
	}
	shouldShowEmergencyContact() {
		let is_emergency =
			this.case &&
			this.case.form_filler_information &&
			this.case.form_filler_information.is_emergency == DialogEnum.yes
				? true
				: false;
		let is_law_enforcement_agent = this.isLawEnforcemnetAgent() ? true : false;
		let skip_basic_contact =
			this.case &&
			this.case.basic_information &&
			this.case.basic_information.is_form_filler === DialogEnum.skip
				? true
				: false;
		if (is_emergency || is_law_enforcement_agent || skip_basic_contact) {
			return false;
		}
		return true;
	}
	shouldShowBasicContact() {
		if (this.isLawEnforcemnetAgent()) {
			return false;
		}
		return true;
	}

	showValidationIconPersonal() {
		let patient_at_time_of_accident = this.acc_info?.patient_at_time_of_accident;
		let driver_type = this.acc_info?.driver_type;
		let at_time_of_accident_other_description = this.acc_info?.at_time_of_accident_other_description;
		let patient_details = this.patient;
		if(this.case?.case_type.slug == CaseTypeEnum.auto_insurance || this.case?.case_type.slug == CaseTypeEnum.auto_insurance_worker_compensation) {
			if(!patient_at_time_of_accident || (patient_at_time_of_accident == 'driver' && !driver_type)
			|| (patient_at_time_of_accident == 'other' && !at_time_of_accident_other_description)) {
				return true
			}
		}
		if(!patient_details?.first_name || !patient_details?.last_name || !patient_details?.dob ||
			!patient_details?.gender || (patient_details?.gender != GenderEnum.male && !patient_details?.is_pregnant) || 
			patient_details?.need_translator == null || (this.route_link == 'personal' && !patient_details['patient_allergy_status']) || 
			(this.case?.case_type.slug == CaseTypeEnum.corporate && !patient_details?.is_law_enforcement_agent) || 
			(this.case.category.slug == CaseCategorySlugEnum.DIAGNOSTIC && !patient_details?.weight_lbs)) {
				return true
		}
		return false
	}

	showValidationIconBasicContact() {
		let basic_info = this.basic_info;
		let mail_add = basic_info?.mail_address;
		let res_add = basic_info?.residential_address;
		if(!basic_info?.cell_phone || basic_info?.is_resedential_same == null || !basic_info?.is_form_filler ||
			!mail_add?.street || !mail_add?.city || !mail_add?.state ||
			(!basic_info?.is_resedential_same && (!res_add?.street || !res_add?.city || !res_add?.state))) {
				return true
		}
		return false
	}

	showValidationIconFormFiller() {
		let form_filler_info = this.form_filler;
		let ageCondition = this.checkAge();
		if(!form_filler_info?.first_name || !form_filler_info?.last_name || !form_filler_info?.cell_phone ||
			!form_filler_info['contactPersonRelation'] || !form_filler_info?.is_emergency
			 || (ageCondition && form_filler_info?.is_emergency == 'yes' && !form_filler_info?.is_guarantor)) {
			return true
		}
		return false
	}

	showValidationIconEmergencyContact() {
		let emg_info = this.emg_info;
		let ageCondition = this.checkAge();
		if(!emg_info?.first_name || !emg_info?.last_name || !emg_info?.cell_phone ||
			!emg_info['contactPersonRelation'] || (ageCondition && !emg_info?.is_guarantor)) {
			return true
		}
		return false
	}

	showValidationIconGuarantor() {
		let guarantor_info = this.guarantor_info;
		if(!guarantor_info?.first_name || !guarantor_info?.last_name || !guarantor_info?.cell_phone ||
			!guarantor_info['contactPersonRelation']) {
			return true
		}
		return false
	}

	showValidationIconPhyInfo() {
		let phy_info = this.phy_info;
		if(!phy_info || phy_info?.primary_care_physician_dialog == 'none' || phy_info?.reffer_by_physician_dialog == 'none'
		 || (phy_info?.primary_care_physician_dialog == 'yes' && 
		 (!phy_info?.primary_physician?.first_name || !phy_info?.primary_physician?.last_name || !phy_info?.primary_physician?.cell_phone))
		  || (phy_info?.reffer_by_physician_dialog == 'yes' && (!phy_info?.reffering_physician?.physician?.first_name || !phy_info?.reffering_physician?.physician?.last_name))) {
			return true
		}
		return false
	}

	shouldShowInjury() {
		let is_not_law_enfocement_agent = !this.isLawEnforcemnetAgent();
		let is_not_self_pay =
			this.case && this.case.case_type && this.case.case_type.slug != CaseTypeEnum.self_pay 
				? true
				: false;
		let is_not_drug_testing =
			this.case && this.case.case_type && this.case.case_type.slug != CaseTypeEnum.corporate
				? true
				: false;
		let is_not_category_diagnostic =
		this.case && this.case.category && this.case.category.slug == CaseCategorySlugEnum.DIAGNOSTIC
			? false
			: true;
		return is_not_law_enfocement_agent && is_not_self_pay && is_not_drug_testing && is_not_category_diagnostic;
	}

	shouldShowMarketting() {
		return this.aclService.hasPermission(USERPERMISSIONS.patient_case_list_marketing_menu);
	}
	shouldShowDocument() {
		return this.aclService.hasPermission(USERPERMISSIONS.patient_case_list_docs_menu);
	}
	shouldShowScheduler() {
		return this.aclService.hasPermission(USERPERMISSIONS.patient_case_list_scheduler_menu);
	}
	shouldShowVisit() {
		return this.aclService.hasPermission(USERPERMISSIONS.patient_case_list_visits_menu);
	}
	shouldShowBilling() {
		return this.aclService.hasPermission(USERPERMISSIONS.patient_case_list_billing_menu);
	}
	isLawEnforcemnetAgent() {
		// return false;
		return (
			this.case &&
			this.case.patient &&
			this.case.case_type &&
			this.case.case_type.slug === CaseTypeEnum.corporate &&
			this.case.patient.is_law_enforcement_agent == DialogEnum.yes
		);
	}

  shouldShowVehicle() {
    // console.log('object involved', this.isObjectInvolved())
    // let object_involved = this.case.accident.object_involved.
    if (this.case && this.case.case_type && (( this.case&& this.case.case_type && this.case.case_type.slug === CaseTypeEnum.auto_insurance && this.case.purpose_of_visit.slug !== PurposeVisitSlugEnum.Speciality) || ( this.case&& this.case.case_type&&this.case.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation)))
      return true
    else
      return this.shouldShowInsurance() && (this.case.case_type &&( this.case&& this.case.case_type&&this.case.case_type.slug !== CaseTypeEnum.corporate) && (this.case&& this.case.case_type&& this.case.case_type.slug !== CaseTypeEnum.private_health_insurance) && ( this.case&& this.case.case_type&&this.case.case_type.slug !== CaseTypeEnum.lien)) && this.isObjectInvolved()
  }
 
  shouldShowHouseHoldInformation() {
    return this.case && this.case.case_type &&(( this.case.case_type.slug === CaseTypeEnum.auto_insurance && this.case.purpose_of_visit.slug !== PurposeVisitSlugEnum.Speciality) || ( this.case.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation)) && !this.isLawEnforcemnetAgent()
  }

	// shouldShowVehicleTab() {
	//   if ((this.case && this.case.case_type_id == CaseTypeIdEnum.auto_insurance) || (this.case && this.case.case_type_id == CaseTypeIdEnum.worker_compensation && this.case.accident.object_involved.vehicle_involved)) {
	//     // return true;

	//     // return false;
	//   }
	//   // return false;
	//   return true;
	// }
	// shouldShowHouseHoldTab() {
	//   if ((this.case && this.case.case_type_id == CaseTypeIdEnum.auto_insurance)) {
	//     return false;
	//     // return true;
	//   }
	//   return true;
	//   // return false;
	// }
	// shouldShowMedicalTreatmentTab() {
	//   if ((this.case && this.case.case_type_id == CaseTypeIdEnum.auto_insurance) || (this.case && this.case.case_type_id == CaseTypeIdEnum.worker_compensation)) {
	//     return false;
	//     // return true;
	//   }
	//   return true;
	//   // return false;
	// }
	shouldShowInsurance() {
		let is_not_self_pay =
			this.case && this.case.case_type && this.case.case_type.slug != CaseTypeEnum.self_pay;

		if (is_not_self_pay && !this.isLawEnforcemnetAgent()) {
			return true;
		} else {
			return false;
		}
	}

	shouldShowPrimary() {
		if (
			this.case &&
			((this.case.case_type && this.case.case_type.slug == CaseTypeEnum.auto_insurance) ||
				(this.case.case_type && (this.case.case_type.slug == CaseTypeEnum.worker_compensation || this.case.case_type.slug == CaseTypeEnum.worker_compensation_employer)) ||
				(this.case.case_type &&
					this.case.case_type.slug == CaseTypeEnum.auto_insurance_worker_compensation))
		) {
			return true;
		}
		return false;
	}
	shouldShowOccupationalDiseaseAccident() {
		if (this.case.case_type && (this.case.case_type.slug == CaseTypeEnum.worker_compensation || this.case.case_type.slug == CaseTypeEnum.worker_compensation_employer)) {
			return true;
		}
		return false;
	}

	getPrimaryTitle() {
		let title = '';
		if (!this.case || !this.case.case_type) return title;
		switch (this.case.case_type.slug) {
			case CaseTypeEnum.worker_compensation:
				title = 'Worker Compensation';
				break;
			case CaseTypeEnum.worker_compensation_employer:
				title = 'Worker Compensation (Employer)';
				break;
			case CaseTypeEnum.auto_insurance:
				title = 'No-Fault';
				break;
			case CaseTypeEnum.auto_insurance_worker_compensation:
				title = 'No Fault/Workers Comp';
				break;
			default:
				title = 'Primary Insurance';
				break;
		}
		return title;
	}
	// getCasePractices() {
	//   return this.requestService.sendRequest(CaseFlowUrlsEnum.GetCasePractices, 'get', REQUEST_SERVERS.kios_api_path)
	// }

	// getCaseCategories(){
	//   return this.requestService.sendRequest()
	// }
	getCaseMasters() {
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.GetCaseMasters,
			'get',
			REQUEST_SERVERS.kios_api_path,
		);
	}
	allFacilityLocationsAgainstPatientLocation(data) {
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.allFacilityLocationsAgainstPatientLocation,
			'get',
			REQUEST_SERVERS.fd_api_url,
			data,
		);
	}
	allFacilityLocations() {
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.allFacilityLocations,
			'get',
			REQUEST_SERVERS.fd_api_url,
			{},
		);
	}
	getfacilitylocationsNames(data) {
		return this.requestService.sendRequest(
			CaseFlowUrlsEnum.allFacilityLocationsNames,
			'get',
			REQUEST_SERVERS.fd_api_url,
			data,
		);
	}
	shouldShowObjectInvolved() {
		if (this.case && this.case.case_type && this.case.case_type.slug == CaseTypeEnum.lien) {
			return false;
		} else {
			return true;
		}
	}
	shouldShowEmploymentInfoForm() {
		if (
			this.case &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug != CaseTypeEnum.auto_insurance &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug != CaseTypeEnum.worker_compensation &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug != CaseTypeEnum.worker_compensation_employer &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug != CaseTypeEnum.auto_insurance_worker_compensation
		) {
			return false;
		}
		return true;
	}

	shouldShowCaseList() {
		if (!this.aclService.hasPermission(USERPERMISSIONS.patient_case_list_listing)) {
			return false;
		}
		return true;
	}

	shouldShowPatientSummary() {
		if (!this.aclService.hasPermission(USERPERMISSIONS.patient_case_list_patient_summary)) {
			return false;
		}
		return true;
	}


	shouldShowAttorney() {
		return (
			this.shouldShowInsurance() &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug !== CaseTypeEnum.corporate &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug !== CaseTypeEnum.private_health_insurance &&
			!this.isLawEnforcemnetAgent()
		);
	}

	shouldShowEmployer() {
		return this.shouldShowInsurance();
	}
	shouldShowAccident() {
		return (
			this.shouldShowInsurance() &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug !== CaseTypeEnum.corporate &&
			this.case &&
			this.case.case_type &&
			this.case.case_type.slug !== CaseTypeEnum.private_health_insurance
		);
	}

	calculateAge(dob) {
		let today = new Date();
		let birthDate = new Date(dob);
		let age = today.getFullYear() - birthDate.getFullYear();
		const month = today.getMonth() - birthDate.getMonth();
		if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}
	isObjectInvolved() {
		// console.log(this.case.accident)
		// return this.case ? this.case.accident ? this.case.accident.object_involved ? this.case.accident.object_involved.vehicle_involved === DialogEnum.yes && this.case.case_type_id === CaseTypeIdEnum.worker_compensation ? true : false : true : true : true
		return this.case &&
			this.case.accident &&
			this.case.accident.object_involved &&
			this.case.accident.object_involved.vehicle_involved === DialogEnum.yes &&
			this.case.case_type &&
			(this.case.case_type.slug === CaseTypeEnum.worker_compensation || this.case.case_type.slug === CaseTypeEnum.worker_compensation_employer)
			? true
			: false;
	}

	shouldShowMedical() {
		return (
			this.shouldShowInsurance() &&
			this.case.case_type &&
			this.case.case_type.slug !== CaseTypeEnum.corporate &&
			this.case.case_type.slug !== CaseTypeEnum.private_health_insurance &&
			this.case.case_type.slug !== CaseTypeEnum.lien
		);
	}

	shouldShowMRI() {
		return (
			
			this.case &&
			this.case.category &&
			this.case.category.slug===CategoryOptionSlugEnum.Diagnostic

		);
	}
	showValidationIconInsurance() {
		let insurance = this.ins;
		let private_insurance = insurance?.private_health_insurance;
		let secondary_insurance = insurance?.secondary_insurance;
		let tertiary_insurance = insurance?.tertiary_insurance;
		if(this.case?.case_type?.slug !== CaseTypeEnum.corporate &&
			this.case?.case_type?.slug !== CaseTypeEnum.private_health_insurance &&
			this.case?.case_type?.slug !== CaseTypeEnum.lien) {
			if(!insurance || private_insurance?.private_health_dialog == 'none' || secondary_insurance?.secondary_dialog == 'none'
			 || (secondary_insurance?.secondary_dialog == 'yes' && tertiary_insurance?.tertiary_dialog == 'none')) {
				return true
			}
		}
		if(this.case?.case_type?.slug === CaseTypeEnum.corporate ||
			this.case?.case_type?.slug === CaseTypeEnum.private_health_insurance ||
			this.case?.case_type?.slug === CaseTypeEnum.lien) {
			if(!insurance || private_insurance?.private_health_dialog == 'none' || secondary_insurance?.secondary_dialog == 'none'
			 || tertiary_insurance?.tertiary_dialog == 'none') {
				return true
			}
		}
		return false
	}
	showValidationIconEmployer() {
		let employer = this.emp;
		let purpose_of_visit = this.pov;
		if(this.case?.case_type.slug == CaseTypeEnum.auto_insurance || this.case?.case_type.slug == CaseTypeEnum.auto_insurance_worker_compensation) {
			if(!employer || !employer?.employment_information || (employer?.primary_employer_dialog == 'no' && employer?.employment_information?.unemployment_benefits == 'none')
			  || (employer?.primary_employer_dialog == 'yes' && (!employer?.case_employers?.[0]?.employer_name || !employer?.case_employers?.[0]?.phone_no
				 || !employer?.case_employers?.[0]?.street_address || employer?.case_employers?.[0]?.is_time_looses == null || !employer?.employment_information?.title
				  || !employer?.employment_information?.activities || (purpose_of_visit?.slug !== PurposeVisitSlugEnum.Speciality && !employer?.employment_information?.type)
				   || (purpose_of_visit?.slug !== PurposeVisitSlugEnum.Speciality && employer?.return_to_work?.work_stop == null) || employer?.return_to_work?.return_to_work == null
				    || (employer?.return_to_work?.return_to_work && (!employer?.return_to_work?.return_to_work_date || !employer?.return_to_work?.current_employment_status
						|| !employer?.return_to_work['type_of_assignment'])) || (purpose_of_visit?.slug !== PurposeVisitSlugEnum.Speciality && employer?.return_to_work?.illness_notice == null)
						 || (employer?.return_to_work?.illness_notice && (!employer?.return_to_work?.contact_person?.first_name || !employer?.return_to_work?.contact_person?.last_name || !employer?.return_to_work['given_notice_type']))))) {
				return true
			}
		}
		else if(this.case?.case_type.slug == CaseTypeEnum.worker_compensation || this.case?.case_type.slug == CaseTypeEnum.worker_compensation_employer) {
			if(!employer || !employer?.case_employers?.[0]?.employer_name || !employer?.case_employers?.[0]?.phone_no
				|| !employer?.case_employers?.[0]?.street_address || employer?.case_employers?.[0]?.is_time_looses == null
				 || !employer?.employment_information?.title || !employer?.employment_information?.activities || (purpose_of_visit?.slug !== PurposeVisitSlugEnum.Speciality && !employer?.employment_information?.type)
				  || (purpose_of_visit?.slug !== PurposeVisitSlugEnum.Speciality && employer?.return_to_work?.work_stop == null) || employer?.return_to_work?.return_to_work == null
				   || (employer?.return_to_work?.return_to_work && (!employer?.return_to_work?.return_to_work_date || !employer?.return_to_work?.current_employment_status
					 || !employer?.return_to_work['type_of_assignment'])) || (purpose_of_visit?.slug !== PurposeVisitSlugEnum.Speciality && employer?.return_to_work?.illness_notice == null) || (employer?.return_to_work?.illness_notice
						 && (!employer?.return_to_work?.contact_person?.first_name || !employer?.return_to_work?.contact_person?.last_name || !employer?.return_to_work['given_notice_type']))) {
				return true
			}
		}
		else if(this.case?.case_type.slug == CaseTypeEnum.lien || this.case?.case_type.slug == CaseTypeEnum.private_health_insurance) {
			if(!employer || employer?.primary_employer_dialog == null || employer?.primary_employer_dialog == 'none' || (employer?.primary_employer_dialog == 'yes'
				 && (!employer?.case_employers?.[0]?.employer_name || !employer?.case_employers?.[0]?.phone_no
					|| !employer?.case_employers?.[0]?.street_address || employer?.case_employers?.[0]?.is_time_looses == null))) {
				return true
			}
		}
		else if(this.case?.case_type.slug == CaseTypeEnum.corporate) {
			if(!employer || employer?.primary_employer_dialog == null || employer?.primary_employer_dialog == 'none' || ((employer?.primary_employer_dialog == 'yes' || !employer?.primary_employer_dialog) 
				&& (!employer?.case_employers?.[0]?.employer_name || !employer?.case_employers?.[0]?.phone_no
					|| !employer?.case_employers?.[0]?.street_address || employer?.case_employers?.[0]?.is_time_looses == null))) {
				return true
			}
		}
		return false
	}
	showValidationIconVehicle() {
		let vehicle = this.vehicle;
		if(!vehicle || vehicle?.accident_reported == null || (vehicle?.accident_reported && (!vehicle?.reporting_date
			 || !vehicle?.state || !vehicle?.city)) || !vehicle?.was_this_car) {
			return true
		}
		return false
	}
	showValidationIconAccident() {
		let accident = this.accident;
		if(
			this.case?.case_type.slug !== CaseTypeEnum.worker_compensation
			 && this.case?.case_type.slug !== CaseTypeEnum.worker_compensation_employer
			  && this.case?.case_type.slug !== CaseTypeEnum.lien
			  ) {
			if(this.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality && this.case?.case_type.slug === CaseTypeEnum.auto_insurance) {
				if(!accident?.accident_information?.accident_happend || !accident?.accident_information?.nature_of_accident 
					|| !accident?.accident_information?.accident_date
				) {
					return true
				}
			}	
			else if(!accident?.accident_information?.state || !accident?.accident_information?.activity_at_injury
				|| !accident?.accident_information?.accident_happend || !accident?.accident_information?.nature_of_accident
				 || accident?.object_involved?.object_involved == null || (accident?.object_involved?.object_involved && !accident?.object_involved?.object_involved_description)) {
				return true
			}
		}
		else if(this.case?.case_type.slug === CaseTypeEnum.worker_compensation || this.case?.case_type.slug === CaseTypeEnum.worker_compensation_employer) {
			if(this.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality) {
				if(!accident?.accident_information?.accident_happend || !accident?.accident_information?.nature_of_accident 
					|| !accident?.accident_information?.accident_date|| accident?.accident_information?.occupational_disease == null
				) {
					return true
				}
			}
			else {
				if(accident?.accident_information?.occupational_disease == null || (!accident?.accident_information?.occupational_disease && !accident?.accident_information?.accident_date)
				 || !accident?.accident_information?.state || !accident?.accident_information?.activity_at_injury
					|| !accident?.accident_information?.accident_happend || !accident?.accident_information?.nature_of_accident
					 || accident?.object_involved?.object_involved == null || (accident?.object_involved?.object_involved && !accident?.object_involved?.object_involved_description)
					  || !accident?.object_involved?.vehicle_involved || (accident?.object_involved?.vehicle_involved == 'yes' && (!accident?.accident_information?.patient_at_time_of_accident
						 || (accident?.accident_information?.patient_at_time_of_accident == 'driver' && !accident?.accident_information?.driver_type)))) {
					return true
				}
			}
		}
		else if(this.case?.case_type.slug === CaseTypeEnum.lien) {
			if(!accident?.accident_information?.patient_at_time_of_accident || (accident?.accident_information?.patient_at_time_of_accident == 'driver' && !accident?.accident_information?.driver_type)
			 || accident?.accident_information?.injured_at_work_location == null || !accident?.accident_information?.accident_happend) {
				return true
			}
		}
		return false
	}
	showValidationIconHouseholdInfo() {
		let house_hold_info = this.house_hold_info;
		if(!house_hold_info || house_hold_info?.household_information_dialog == 'none' || 
		(house_hold_info?.household_information_dialog == 'yes'
		 && (!house_hold_info?.data?.[0]?.contact_information?.first_name || !house_hold_info?.data?.[0]?.contact_information?.last_name))) {
			return true
		}
		return false
	}
	showValidationIconMedicalTreatment() {
		let medical_treatment = this.med_treatment;
		let general_details = this.gen_details;
		if(this.case?.case_type.slug !== CaseTypeEnum.worker_compensation && this.case?.case_type.slug !== CaseTypeEnum.worker_compensation_employer) {
			if(this.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality && this.case?.case_type.slug === CaseTypeEnum.auto_insurance) {
				if(medical_treatment?.had_ime == null) {
					return true
				}
			}
			else {
				if(!medical_treatment || medical_treatment?.same_injury_body_part == null || (medical_treatment?.same_injury_body_part && (medical_treatment?.were_you_treated == null || medical_treatment?.is_prev_injury_work_related == null))
				 || (medical_treatment?.were_you_treated && (!medical_treatment?.contact_information?.previous_treated_by?.data?.[0]?.first_name || !medical_treatment?.contact_information?.previous_treated_by?.data?.[0]?.last_name))
				 || (medical_treatment?.is_prev_injury_work_related && medical_treatment?.same_employer == null)
				 || medical_treatment?.had_ime == null || !general_details || general_details?.other_expenses == null ||
				  (general_details?.other_expenses && !general_details?.expense_description) || general_details?.more_health_treatment == null) {
					return true
				}
			}
		}
		else if(this.case?.case_type.slug === CaseTypeEnum.worker_compensation || this.case?.case_type.slug === CaseTypeEnum.worker_compensation_employer) {
			if(this.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality) {
				if(medical_treatment?.had_ime == null) {
					return true
				}
			}
			else if(!medical_treatment || medical_treatment?.same_injury_body_part == null || (medical_treatment?.same_injury_body_part && (medical_treatment?.were_you_treated == null || medical_treatment?.is_prev_injury_work_related == null))
			|| (medical_treatment?.were_you_treated && (!medical_treatment?.contact_information?.previous_treated_by?.data?.[0]?.first_name || !medical_treatment?.contact_information?.previous_treated_by?.data?.[0]?.last_name))
			 || (medical_treatment?.is_prev_injury_work_related && medical_treatment?.same_employer == null)
			|| medical_treatment?.had_ime == null) {
				return true
			}
		}
		return false
	}
	showValidationIconDiagnosticIntake() {
		let mri = this.mri;
		let mri_intake_1 = mri?.mri_intake_1;
		let mri_intake_2 = mri?.mri_intake_2;
		let mri_intake_3 = mri?.mri_intake_3;
		let mri_intake_4 = mri?.mri_intake_4;
		let mri_intake_6 = mri?.mri_intake_6;
		let mri_radiology_montage = mri?.mri_radiology_montage;
		let gender = this.case?.patient?.gender
		// MRI Intake 1
		if(!mri_intake_1?.medical_symptoms || mri_intake_1?.is_prior_surgery == null || (mri_intake_1?.is_prior_surgery && (!mri_intake_1?.prior_surgery_details?.[0]?.date
			 || mri_intake_1?.prior_surgery_details?.[0]?.is_body_part == null || !mri_intake_1?.prior_surgery_details?.[0]?.surgery_type?.name))
			  || mri_intake_1?.is_imaging_study == null || (mri_intake_1?.is_imaging_study && (!mri_intake_1?.imaging_study_details?.[0]?.mri_body_part?.body_part?.name
				 || !mri_intake_1?.imaging_study_details?.[0]?.type_of_study?.name)) || mri_intake_1?.is_previous_problem == null || (mri_intake_1?.is_previous_problem && !mri_intake_1?.previous_problem_description)) {
			return true
		}
		// MRI Intake 2
		if(!mri_intake_2 || mri_intake_2?.eye_injury_metallic_object == null || (mri_intake_2?.eye_injury_metallic_object && !mri_intake_2?.eye_injury_metallic_object_description)
		 || mri_intake_2?.injury_by_metallic_object == null || (mri_intake_2?.injury_by_metallic_object && !mri_intake_2?.injury_by_metallic_object_description)
		 || mri_intake_2?.recently_taken_medication == null || (mri_intake_2?.recently_taken_medication && !mri_intake_2?.medicines?.[0]?.name)) {
			return true
		}
		// MRI Intake 3
		if(!mri_intake_3 || mri_intake_3?.is_alergic_to_food_medication == null || (mri_intake_3?.is_alergic_to_food_medication && mri_intake_3?.iodine_contrast == null)
			 || (mri_intake_3?.is_alergic_to_food_medication && mri_intake_3?.latex_allergy == null) || (mri_intake_3?.is_alergic_to_food_medication && mri_intake_3?.food_allergy == null) || (mri_intake_3?.food_allergy && !mri_intake_3?.others)) {
			return true
		}
		// MRI Intake 4
		if(!mri_intake_4 || mri_intake_4?.is_history == null || mri_intake_4?.is_chemotherapy == null
			 || mri_intake_4?.is_radiation_therapy == null || mri_intake_4?.is_anemia_disease == null) {
			return true
		}
		// MRI Radiology Montage
		if(!mri_radiology_montage || mri_radiology_montage?.aneurysm_clip == null || mri_radiology_montage?.body_piercing == null || mri_radiology_montage['body_weight'] == null
			 || mri_radiology_montage?.cardiac_pacemaker == null || mri_radiology_montage?.cardioverter == null || mri_radiology_montage?.dentures == null
			  || mri_radiology_montage?.diaphragm == null || mri_radiology_montage?.hearing_aid == null || mri_radiology_montage?.infusion_device == null
			   || mri_radiology_montage?.magnetically_activated == null || mri_radiology_montage?.mechanical_heart_valves == null || mri_radiology_montage?.metallic_fragment == null
			    || mri_radiology_montage?.metallic_stent == null || mri_radiology_montage?.spinal_cord_stimulator == null) {
			return true
		}
		// MRI Intake 6
		if(gender !== GenderEnum.male) {
			if(!mri_intake_6?.date_of_period || mri_intake_6?.is_post_menopausal == null || mri_intake_6?.late_menstural_period_id == null
				 || mri_intake_6?.is_hormonal_treatment == null || mri_intake_6?.is_fertility_treatment == null
				  || (mri_intake_6?.is_fertility_treatment && !mri_intake_6?.description) || mri_intake_6?.is_breastfeeding == null) {
				return true
			}
		}
		return false
	}
	WcCaseForMedicalTreatment() {
		return (
			this.case &&
			this.case.case_type &&
			(this.case.case_type.slug === CaseTypeEnum.worker_compensation || this.case.case_type.slug === CaseTypeEnum.worker_compensation_employer)
		);
	}
	WcCaseAccidentForMedicalTreatment() {
		return this.case &&
			this.case.accident &&
			this.case.accident.object_involved &&
			this.case.accident.object_involved.vehicle_involved === DialogEnum.yes
			? false
			: true;
	}

	goBack() {
		// this.location.back()
		debugger;
		var route = 'front-desk/cases/edit/' + this.case.id + '/';
		let urlarr = this.router.url.split('/');
		let _route = urlarr[urlarr.length -1];

		let url = this.caseFlowRoutes.getPreviousStep(_route);
		if (url.route == 'cases/list') {
			route = 'front-desk/';
		}
		this.router.navigate([route + url.route]);
	}

	getCaseIdFromRoute() {
		let id = null;
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!id) id = path.params.caseId;
			}
		});
		return id;
	}

	DialogEnumValidator() {
		return (control: AbstractControl): { [key: string]: any } => {
			if (control.value === DialogEnum.none) {
				return { dialogError: true };
			}
			return null;
		};
	}
	showSkipReferral() {
		return this.case && this.case.case_type && this.case.case_type.slug == CaseTypeEnum.corporate;
	}
	addScrollClasses() {
		let element = document.getElementById("wrapper");
		let main = document.getElementById("main");
		let body = document.getElementsByTagName("body")[0];
		let header = document.getElementById("header");
		element.classList.add("height-auto-scroll-error");
		body.classList.add("add-overflow_hidden-scroll");
		header.classList.add("add-header-sticky-scroll");
		main.classList.add("add-main-padd-top-scroll");
	}
	removeScrollClasses() {
		let element = document.getElementById("wrapper");
		let main = document.getElementById("main");
		let body = document.getElementsByTagName("body")[0];
		let header = document.getElementById("header");
		element.classList.remove("height-auto-scroll-error");
		body.classList.remove("add-overflow_hidden-scroll");
		header.classList.remove("add-header-sticky-scroll");
		main.classList.remove("add-main-padd-top-scroll");
	}
	scrollToFirstInvalidControl(firstInvalidControl,comp=110) { // COMP SET DEFAULT 110 FOR CASE FLOW

		firstInvalidControl.scrollIntoView({ 
			behavior: 'smooth',
			block: 'center',
			inline: 'start',
		});	
		fromEvent(window, 'scroll')
		  .pipe(debounceTime(100), take(1))
		  .subscribe(() => firstInvalidControl.focus());
	  }
	
}

export class CaseFlowProgression {
  routes: Step[];
  constructor(public aclService: AclService) { }

  findPreviousAllowed(index) {
    for (let i = index - 1; i >= 0; i--) {
      let route = this.routes[i];
      let should = route.shouldAllow ? (route.shouldAllow() && this.aclService.hasPermission(route.permission)) : false;
      if (should) {
        return this.routes[i];
      }
    }
  }

  findNextAllowed(index): Step {
    for (let i = index + 1; i < this.routes.length; i++) {

      let route = this.routes[i];
      let should = route.shouldAllow ? (route.shouldAllow() && this.aclService.hasPermission(route.permission)) : false;
      if (should) {
        return this.routes[i];
      }
    }
    return null;
    // return { route: '', children: [] }
  }
  getPreviousStep(current_route) {
    let index = -1;
    // if (current_route == 'insurance') {
    //   index = 8;
    // } else {
      index = this.routes.findIndex((route) => route.route.includes(current_route));
    // }
    if (index > -1) {
      return this.findPreviousAllowed(index);
    } else {
      return { route: '', children: [] } as Step;
    }
  }
  getNextStep(current_route) {
    let index = -1;
    // if (current_route == 'insurance') {
    //   index = 8;
    // } else {
      index = this.routes.findIndex((route) => route.route.includes(current_route));
    // }
    if (index > -1) {
      return this.findNextAllowed(index);
    } else {
      return { route: '', children: [] } as Step;
    }
  }

  findRoute(route_name, routes: Step[]) {
    return routes.find((route) => route.route === route_name);
  }
}
export interface Step {
  route: string;
  permission: string;
  children: Step[];

  shouldAllow?: any;
  // goToNextStep() { }
}
