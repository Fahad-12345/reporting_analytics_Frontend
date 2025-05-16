import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild, ElementRef, AfterContentChecked, AfterViewChecked } from '@angular/core';
import { ErxService } from '@appDir/erx/erx.service';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { CodesUrl } from '@appDir/front-desk/masters/billing/codes/codes-url.enum';
import { erx_url } from '../erx-url.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { cloneDeep,isEqual,transform, isObject } from 'lodash';
import { LocalStorage } from '@shared/libs/localstorage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Subject } from 'rxjs';
import { environment } from 'environments/environment';
import { LogInUrlsEnum } from '@appDir/pages/content-pages/login/logIn-Urls-Enum';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';



@Component({
	selector: 'app-prescribe',
	templateUrl: './prescribe.component.html',
	styleUrls: ['./prescribe.component.scss'],
})
export class PrescribeComponent implements OnInit,AfterViewChecked {
	erxDisableTitle = "";
	compDisableTitle="";
	buttonDisableTitle="";
	@Output() patientEmit = new EventEmitter();
	@Input() refresh: Subject<boolean> = new Subject<boolean>();
	viewSummaryCheck: any = false;
	protected ngUnsubscribe: Subject<void> = new Subject<void>();
	@ViewChild('scrollMe') public myScrollContainer: ElementRef;
	@ViewChild('selectedValue') public selectedValue: NgSelectComponent;
	@Input() patientIn: any;
	caseId: any = null;
	public isOpenFilters: any = false;
	leftSection: any = true;
	minDate = new Date()
	maxDate = new Date();
	xyremCheck = true;
	offset = 1;
	oldMed = -1;
	medSearchType: any = 'erx';
	rightSection: any = true;
	oldMedString: any = '';
	// allComment: any = ''
	// allReason: any = ''
	replaceCheck: any = false;
	alertChecks: any = [];
	allALertReasonCheck: any = [];
	total_count_check: any = false;
	// hamzaasss
	searchByName: any = '';
	searchByChart: any = '';
	searchByCase: any = '';
	startDateOn = new Date();
	searchMed: any = '';
	labelsData: any = '';
	advisoryData: any = '';
	presResponseReason: any = '';
	medicineData: any = [];
	favMedicineData:any=[];
	lstICDcodes: any = [];
	reasonCode: any = [];
	drugPricingData: any = [];
	medicationObj: any = [];
	alertObj: any = {};
	currentDate: any = formatDate(new Date(), 'yyyy-MM-dd', 'en');
	selectedMedicine: any = '';
	selectedReasonValue: any = '';
	addToFav: any = false;
	brandMedically: any = false;
	startDate: any = '';
	despense: any = '';
	daySupply: any = '';
	refill: any = '';
	refillAsNeeded: any = false;
	internalNotes: any = '';
	notesToPharmacy: any = '';
	searchPharmacy: any = '';
	pharmacyType: any = '';
	version: any = 'v6';
	patientDefault: any = false;
	pharmacyData: any = '';
	selectedIndex: any = '';
	taskid: any = '';
	taskdetail: any = '';
	pharmacy_types: any = [];
	other_ids: any = [];
	zip_code: any = '';
	city: any = '';
	state: any = '';
	address_line: any = '';
	type_check = false;
	patient: any;
	keyword = 'name';
	keywordCase = 'id';
	erxButton = true;
	keywordChart = 'chart_id';
	refillChange: any = false;
	prescriber_info: any = [];
	show_pharmacy = [];
	data = [];
	dataChart = [];
	dataCase = [];
	patient_check = false;
	patient_info = {
		id: '',
		ssn: '',
		suffix: null,
		name: '',
		firstName: '',
		middleName: '',
		lastName: '',
		prefix: null,
		gender: '',
		dob: '',
		height: '',
		height_ft:null,
		height_in:null,
		weight: '',
		primaryPhone: {
			number: '',
			extension: '',
			smsSupported: null,
		},
		addressLine1: '',
		addressLine2: '',
		city: '',
		stateProvince: '',
		postalCode: '',
		countryCode: 'US',
		cellPhone: '',
		patAllergies:[]
	};
	overRideReasons = [];
	caseIn: any;

	medDaySupply:any;
	schDaySupply:any;
	isC2Schedule: boolean = false;
	checkMedicLenght = 0;
	alertsCollapse: boolean = false;
	labelAlertsCollapse: boolean = false;
	advisoryCollapse: boolean = false;
	drugFoodCollapse: boolean = false;
	drugDrugCollapse: boolean = false;
	drugAllergyCollapse: boolean = false;
	duplicateTherapyCollapse: boolean = false;
	otherCollapse: boolean = false;
	focuscheck: boolean = false;
	dotCheck: boolean = false;
	errDisplayCount = 0;
	errDisplay = true;
	lastErrDisplay = 0;
	quantityMeasure: any;
	strengthData: any;
	strId: any;
	compDispense: any;
	isMediIdentider: number;
	@ViewChild('contentAuthenticate') private contentAuthenticate: any;
	@ViewChild('contentOpt') private contentOpt: any;
	@ViewChild('contentSupervisor') private contentSupervisor: any;
	@ViewChild('contentPrompt') private contentPrompt: any;
	otpLoader: any;
	optAuth: any = "";
	loadingBar: any = "0%";
	enableOtp: boolean = false;
	disableTouch: any = true;
	tempData: any;
	public hideLeftSection: any = false; // Adding class using ngStyle for text Editor (Left Arrow)
	spiCheck: boolean = false;
	containSupervisor: any;
	confirmPass: any;
	pollingCount: number = 0;
	repeatQuery: any;
	transactionId: any = "";
	supervisors: any;
	delegatorInfo: any;
	selectedSupervisor: any;
	supervisorId: number;
	supervisor:any;
	canFinalize: number;
	erxDisable: boolean;
	choosenSupervisor:boolean=false;
	isCompound:boolean=false;
	isAccepted:any=0;
	prevRefill: any;
	passwordForm:FormGroup;
	scheduleIIdrugs=[];
	startDayCheck:boolean=false;
	defaultPharmId:number;
	selectedfromHome: boolean=false;
	loadSpin: boolean;
	multipleCompund:any=[];
	compRxChange:boolean=false;
	compSelectedIndex: number;
	initCompLenght: number;
	prevDeniedRefill=0;
	approveDisableReason="";
	clinicQuan: boolean;
	dropCheck: boolean=false;
	tempAlerts:any=[];
 	scheduler:any;
	infDate: Date;
	scrollCheck: boolean;
	constructor(
		private modalService: NgbModal,
		private activatedRoute: ActivatedRoute,
		private storageData: StorageData,
		public cdr: ChangeDetectorRef,
		public _service: ErxService,
		public toaster: ToastrService,
		protected requestService: RequestService,
		public _router: Router,
		private localStorage: LocalStorage,
	) {
		// this.taskid=6;

	

		this.passwordForm = new FormGroup({
			'confirm_password': new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(24)])
		});
	}
	ngAfterViewChecked(): void {
		if(this.scrollCheck){
			this.scrollToBottom()
			this.scrollCheck=false;
		}
	}
	
	clearData(e, check?) {
		if (check) {
			this.searchByChart = '';
			this.dataChart = [];
		} else {
			this.searchByName = '';
			this.data = [];
		}
		this.cdr.detectChanges();
	}
	ngAfterViewInit() {
		this.tempData = JSON.parse(localStorage.getItem('cm_data'));
		this.containSupervisor = this.tempData.role.has_supervisor;
		this.canFinalize=this.tempData.role.can_finalize;
		if( this.tempData.role.medical_identifier==1){
		
		
		this.prescriber_info = this.tempData.basic_info;
		if ((this.tempData.basic_info.epcs_status_id == 2 || this.tempData.basic_info.epcs_status_id == 5))
		{
			
				this.modalService.open(this.contentAuthenticate, { 
					size: 'sm',
					backdrop: 'static',
					keyboard: false }).result.then((result) => {
					if (result == 'Save click') {
					}
					if (result == 'Close click') {
						this._service.erxCheck=1;
					}
				})

		}
		
	}

	

	}
	ngOnInit() {

		this._service.updated=false;
    	this._service.neededReadySign=0;
    	this._service.readySigned=false;
		this.taskid=null;
		this._service.data.taskId=null;
		
		if(this._router.url.includes('template-manager'))
		{
			 this.scheduler= this.storageData.getSchedulerInfo();
			 console.log('scheduler',this.scheduler)
			 this.patientIn=this.scheduler.template_instance.patientId;
			 this.onChangeSearch(this.patientIn, true);
		}
		var year = this.maxDate && this.maxDate.getFullYear();
		var month = this.maxDate && this.maxDate.getMonth();
		var day = this.maxDate && this.maxDate.getDate();
		this.maxDate = new Date(year, month + 6, day);
		this.infDate=new Date(8640000000000000);
		this.tempData = JSON.parse(localStorage.getItem('cm_data'));
		this.getEpcsStatus();
			this.requestService
				.sendRequest(
					erx_url.license + 'user_id=' + this.storageData.getUserId() + '& license_status=1',
					'get',
					REQUEST_SERVERS.erx_fd_api,
				)
				.subscribe((response: any) => {
					if (
						response.result.data.length == 0 ||
						response.result.data[0].user_license_status.slug != 'active'
					) {
						this.erxButton = false;
						this._service.erxCheck = 1;
					}
				});

			this.refresh.subscribe((response) => {
				if (response) {
					this.caseIn = null;
					this.activatedRoute.snapshot.pathFromRoot.forEach((path) => {
						if (path && path.params && path.params.caseId) {
							if (!this.caseIn) {
								this.caseIn = path.params.caseId;
							}
						}
					});
					this.oldMed = -1;
					this.taskid = this._service.taskid;
					if (this.taskid != '' && this.taskid != null) {
						this.taskDetail();
					} else {
						if (this.caseIn) {
							this.onChangeSearchCase(this.caseIn);
						} else {
							this.onChangeSearch(this.patientIn, true);
						}
					}
					this._service.taskid = null;
					this.pharmacyTypes();
					this.overrideReason();
				}
			});
			this.caseIn = null;
			this.activatedRoute.snapshot.pathFromRoot.forEach((path) => {
				if (path && path.params && path.params.caseId) {
					if (!this.caseIn) {
						this.caseIn = path.params.caseId;
					}
				}
			});
			this.oldMed = -1;
			this.taskid = this._service.taskid;
			if (this.taskid != '' && this.taskid != null) {
				this.taskDetail();
			} else {
				if (this.caseIn) {
					this.onChangeSearchCase(this.caseIn);
				} else {
					this.onChangeSearch(this.patientIn, true);
				}
			}
			this._service.taskid = null;
			this.pharmacyTypes();
			this.overrideReason();
		this._service.denyChange=false; // ready to sign disable for deny incomplete status
	}
	overrideReason() {
		this.requestService
			.sendRequest(erx_url.override, 'get', REQUEST_SERVERS.erx_fd_api)
			.subscribe((response: any) => {
				this.overRideReasons = response.result.data;
			});
	}


	//Hassan's Code
	pharmacyTypes() {
		this.requestService
			.sendRequest(erx_url.pharmacy_types, 'get', REQUEST_SERVERS.erx_fd_api)
			.subscribe((response) => {
				this.other_ids = [];
				this.pharmacy_types = [];
				response['result']['data'].forEach((item) => {
					if (item.id == 1 || item.id == 2) {
						this.pharmacy_types.push(item);
					} else {
						this.other_ids.push(item.id.toString());
					}
				});
				this.pharmacy_types.push({ id: 3, name: 'others' });
				this.other_ids = this.other_ids.toString();
			});
	}

	oneTimeApi = true;
	tempPatientSearch: any = {};
	
	onTMPatientLoad(id:any) {
		this.oneTimeApi = false;
		this.requestService
			.sendRequest(
				erx_url.patient_search + `?id=${id}`,
				'get',
				REQUEST_SERVERS.kios_api_path,
			)
			.subscribe((res) => {

			},err=>{
						
			});
	}
	
	onChangeSearch(name: string, check?) {
		if (name != '') {
			let url = check ? '&id=' + name : '&name=' + name;
			if (this.oneTimeApi) {
				this.oneTimeApi = false;
				this.requestService
					.sendRequest(
						erx_url.patient_search + '?filter=true&per_page=10&page=1&pagination=1' + url,
						'get',
						REQUEST_SERVERS.kios_api_path,
					)
					.subscribe((res) => {
						
						this.oneTimeApi = true;
						if (this.tempPatientSearch && this.tempPatientSearch.name) {
							this.onChangeSearch(this.tempPatientSearch.name, this.tempPatientSearch.check);
						}
						this.tempPatientSearch = {};
						if (check) {
							this.dataChart = res['result']['data'];
							if (this.patientIn && this.dataChart.length) {
								this.selectEvent(this.dataChart[0], 2);
							}
						} else {
							res['result']['data'].forEach((item:any)=>{
								item['name']= item.middle_name ? item.first_name + ' '+item.middle_name+' '+item.last_name : item.first_name + ' '+item.last_name
							})
							this.data = res['result']['data'];
							console.log('----',this.data);
						}
					},err=>{
						
					});
			} else {
				this.tempPatientSearch = {
					name: name,
					check: check,
				};
			}
		}
	}

	Filter(e,index?) {
		let page = e ? e : 1;
		var reqObj = {};
		if (this.pharmacyType == '3') {
			reqObj['pharmacy_type_id'] = this.other_ids;
		} else {
			reqObj['pharmacy_type_id'] = this.pharmacyType;
		}
		if(index=== undefined){

			this.medicationObj[this.selectedIndex].pharmacy = {};
		}
		let checkPatient = this.patientDefault ? '&patient_id=' + this.patient_info.id : '';
		let checkPharmType=this.pharmacyType=='3'? this.other_ids :this.pharmacyType;
		let pharParams='?per_page=5&order=desc&pagination=1&page=' +
		page +
		'&is_npi=true&erx_service_levels[]=1'+
		'&zip_code=' +
		this.zip_code +
		'&city=' +
		this.city +
		'&state_province=' +
		this.state +
		'&address_line1=' +
		this.address_line +
		'&organization_name=' +
		this.searchPharmacy +
		'&pharmacy_type_id=' +
		checkPharmType +
		'&version='
		+ this.version +
		checkPatient+'&is_current=1';

		if(this._service.erxCheck!=2)
		{
			let ind=index?index:this.selectedIndex;
			if(this.medicationObj && this.medicationObj[ind] && this.medicationObj[ind].medication && 
				this.medicationObj[ind].medication.rawMed && this.medicationObj[ind].medication.rawMed.rawData &&
				this.medicationObj[ind].medication.rawMed.rawData.FederalDEAClassCode!='0')
			{
				pharParams+='&erx_service_levels[]=5';
			}
		}
		else if(this._service.erxCheck==2)
		{
			for(let i=0;i<this.medicationObj.length;i++){
				if(this.medicationObj && this.medicationObj[i] && this.medicationObj[i].medication && 
					this.medicationObj[i].medication.rawMed && this.medicationObj[i].medication.rawMed.rawData &&
					this.medicationObj[i].medication.rawMed.rawData.FederalDEAClassCode!='0')
				{
					pharParams+='&erx_service_levels[]=5';
					break;
				}
			}

		}
		if (e != 0) {
			this.loadSpin=true;
			this.requestService
				.sendRequest(
					erx_url.all_pharmacy +
					pharParams,
					'get',
					REQUEST_SERVERS.erx_fd_api,
				)
				.subscribe((res) => {
					this.loadSpin=false;
					this.pharmacyData = res['result']['data'];
					this.totalPharmacy = parseInt(res['result'].last_page);
					this.current_page = parseInt(res['result'].current_page);
					this.scrollCheck=true;
					if(this.medicationObj?.[this.selectedIndex]?.pharmacy?.id) {
						this.pharmacyData[this.selectedIndex]['default_pharmacy'] = true;
					}
				},err=>{
					this.loadSpin=false;
				}
				);
		}
		else {
			this.pharmacyData = null;
			this.totalPharmacy = 0;
			this.current_page = 0;
		}
	}
	totalPharmacy = 1;
	current_page = 1;
	mapGenderStringToChar(gender) {
		if (gender == 'M' || gender == 'F' || gender == 'U') return gender;
		const genders = {
			male: 'M',
			female: 'F',
			x: 'U',
		};

		return genders[gender];
	}
	Reset() {

		this.pharmacyType = '';
		this.zip_code = '';
		this.city = '';
		this.address_line = '';
		this.searchPharmacy = '';
		this.state = '';
		this.patientDefault=false;
		this.Filter(0);
	}

	onSelectMedicine(data,index,check?) {
		this.searchMed = '';
		if(this._service.erxCheck==2)
		{
			if(this.medicineData.length>0)
			this.medicineData=[];
		}

		var pId=null;
		if (check && this._service.erxCheck!=2) {
			this.medicationObj = [];
		}
		var sigData={
			offset: 1,
			limit: 1000,
		}
		if( data.DispensableDrugID )
		{

			sigData['prescribableDrugId']=data.DispensableDrugID;
			
		}
		else if(data.rawMed && data.rawMed.rawData && data.rawMed.rawData.DispensableDrugID)
		{
			sigData['prescribableDrugId']=data.rawMed.rawData.DispensableDrugID;
		}
		else if(data.PrescribableDrugID) 
		{
			sigData['prescribableDrugId']=data.PrescribableDrugID;
			
		}
		else if(data.rawMed && data.rawMed.rawData && data.rawMed.rawData.PrescribableDrugID)
		{
			sigData['prescribableDrugId']=data.rawMed.rawData.PrescribableDrugID
		}
		
		this._service
		.getSig('',sigData )
			.subscribe((res: any) => {
				let sig = res.result.data;
				if (this._service.erxCheck != 2) {
					this.medicationObj.push({
						medication: {
							icd10Codes: { codes: [] },
							rawMed:
								this.medSearchType == 'dispense'
									? {
										rawData: data,
										drugName: data.DispensableDrugDesc,
										drugId: data.DispensableDrugID,
										type: 2,
									}
									: data.PrescribableDrugID || data.PackagedDrugID
										? {
											rawData: data,
											drugName: data.PackagedDrugDesc
												? data.PackagedDrugDesc
												: data.RepresentativeERXPackagedDrug.PackagedDrugDesc,
											drugId: data.PackagedDrugID
												? data.PackagedDrugID
												: data.RepresentativeERXPackagedDrug.PackagedDrugID,
											type: data.PackagedDrugID ? 1 : 3,
										}
										: data.rawMed,
							sig: data.PrescribableDrugID ? null : data.sig ? data.sig : null,
							scriptDate: new Date(), //has to be of current date
							effectiveDate: new Date(), //can be of future 
							quantity: "1",
							refill: 0,
							substitute: 0,
							daysSupply: null,
							internalComments: '',
							pharmacyNotes:'',
							allALertCheck:{check: false, allReason: '', allComment: ''},
							alerts: [],
						},
						pharmacy: {},
						favourite: 0,
						rawSig: sig,
					});
					let mindex=this.medicationObj.length-1;
					this.medicineData = [];
					if(this.checkCIISchedule(mindex)){
						let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[mindex].medication.rawMed.drugId);
						if(rindex==-1){
							this.checkDaySupply(this.medicationObj[mindex].medication.rawMed.drugId);
						}
						else if(rindex!=-1)
						{
							this.scheduleIIdrugs[rindex].count+=1;
						}
						
					}
				}
				else if (this._service.erxCheck == 2) {
					if(this.compRxChange==false){
						this.medicationObj.push({
							medication: {
								icd10Codes: { codes: [] },
								rawMed:
									this.medSearchType == 'dispense'
										? {
											rawData: data,
											drugName: data.DispensableDrugDesc,
											drugId: data.DispensableDrugID,
											type: 2,
										}
										: data.PrescribableDrugID || data.PackagedDrugID
											? {
												rawData: data,
												drugName: data.PackagedDrugDesc
													? data.PackagedDrugDesc
													: data.RepresentativeERXPackagedDrug.PackagedDrugDesc,
												drugId: data.PackagedDrugID
													? data.PackagedDrugID
													: data.RepresentativeERXPackagedDrug.PackagedDrugID,
												type: data.PackagedDrugID ? 1 : 3,
											}
											: data.rawMed,
								sig: data.PrescribableDrugID ? null : data.sig ? data.sig : null,
								scriptDate: new Date(), //has to be of current date
								effectiveDate: new Date(), //can be of future
								quantity: "1",
								compoundQuantity: "1", // In case of compound Medicine
								refill: 0,
								substitute: 0,
								daysSupply: null,
								internalComments: '',
								pharmacyNotes: '',
								description: '',
								strengthFormId: null,
								strengthFormCode: null,
								quantityUnitOfMeasureCode: null,
								quantityUnitOfMeasureName: null,
								quantityUnitOfMeasureId:null,
								strengthFormName: null,
								allALertCheck:{check: false, allReason: '', allComment: ''},
								alerts: [],
							},
							pharmacy: {},
							favourite: 0,
							rawSig: sig,
						});
						let mindex=this.medicationObj.length-1;
						if(this.checkCIISchedule(mindex)){
							this.checkDaySupply(this.medicationObj[mindex].medication.rawMed.drugId);
							
		
						}
	
						this.drugPricing(this.medicationObj.length - 1);
					}
					else{
					let medicationObj=[];
						medicationObj.push({
							medication: {
								icd10Codes: { codes: [] },
								rawMed:
									this.medSearchType == 'dispense'
										? {
											rawData: data,
											drugName: data.DispensableDrugDesc,
											drugId: data.DispensableDrugID,
											type: 2,
										}
										: data.PrescribableDrugID || data.PackagedDrugID
											? {
												rawData: data,
												drugName: data.PackagedDrugDesc
													? data.PackagedDrugDesc
													: data.RepresentativeERXPackagedDrug.PackagedDrugDesc,
												drugId: data.PackagedDrugID
													? data.PackagedDrugID
													: data.RepresentativeERXPackagedDrug.PackagedDrugID,
												type: data.PackagedDrugID ? 1 : 3,
											}
											: data.rawMed,
								sig: data.PrescribableDrugID ? null : data.sig ? data.sig : null,
								scriptDate: new Date(), //has to be of current date
								effectiveDate:new Date(), //can be of future
								quantity: "1",
								compoundQuantity: "1", // In case of compound Medicine
								refill: 0,
								substitute: 0,
								daysSupply: null,
								internalComments: '',
								pharmacyNotes: '',
								description: 'New Compound Medicine',
								strengthFormId: null,
								strengthFormCode: null,
								quantityUnitOfMeasureCode: null,
								quantityUnitOfMeasureName: null,
								quantityUnitOfMeasureId:null,
								strengthFormName: null,
								allALertCheck:{check: false, allReason: '', allComment: ''},			
								alerts: [],
							},
							pharmacy: {},
							favourite: 0,
							rawSig: sig,
						});
						if(this.multipleCompund.length==this.initCompLenght){
							this.medicationObj=[];
							this.multipleCompund.push(medicationObj);
							this.compSelectedIndex=this.initCompLenght;
							this.medicationObj=this.multipleCompund[this.compSelectedIndex];

						}
						else{
							this.compSelectedIndex=this.multipleCompund.length-1;
							this.medicationObj=this.multipleCompund[this.compSelectedIndex];
							this.medicationObj.push(medicationObj[0]);
							this.multipleCompund[this.compSelectedIndex]=this.medicationObj;
						}

					}
				}
				
				this.getAlerts();
				if (check) {
					this.showDetailMedicine(0);
				}
				if(this._service.erxCheck==2)
				{
					this.showDetailMedicine(0);
				}
			});
	}
	medRefill(value) {
		this.medicationObj[this.selectedIndex].medication.refill = value == '' ? null : value;
	}
	daysSupply(e) {
		this.medicationObj[this.selectedIndex].medication.daysSupply = e == '' ? null : e;
		

	}

	/**
	 * get ICDCode through intellicence
	 * @param event
	 */
	getICDcodes(event) {
		if (event.target.value.length > 0) {
			this.focuscheck = true;
		}
		if (event.target.value.length == 0) {
			this.focuscheck = false;
		}
		var paramQuery: ParamQuery = {
			filter: true,
			pagination: 1,
			order: OrderEnum.ASC,
			order_by: 'name',
			code_type_id: 1,
			type: 'ICD',
			name:event.target.value
		} as any;
		this.requestService
			.sendRequest(erx_url.icd10, 'get', REQUEST_SERVERS.erx_fd_api, paramQuery)
			.subscribe((res) => {
				this.lstICDcodes =
					res['result']['data'] && res['result']['data'].length
						? res['result']['data'].map((x) => {
							return {
								id: x.id,
								name: x.name,
								description: x.description,
								full_ict: x.name + ' - ' + x.description,
							};
						})
						: [];
			});
	}
	onClick() {
		this.focuscheck = true;

	}
	removeICDcodeFromList(event) {
		event.map(function (v) {
			delete v.full_ict;
		});
		this.medicationObj[this.selectedIndex].medication.icd10Codes.codes = event;
		this.selectedValue.searchTerm = "";
	}

	addToFavFun(e) {
		this.medicationObj[this.selectedIndex].favourite = e == true ? 1 : 0;
	}
	refillFun(e) {
		
		this.refillChange = this.refillChange == -1 ? -1 : true;
		this.refillAsNeeded = e;
		if (e == true) {
			this.prevRefill=this.medicationObj[this.selectedIndex].medication.refill;
			this.medicationObj[this.selectedIndex].medication.refill = 99;
		} else {
			this.medicationObj[this.selectedIndex].medication.refill = this.prevRefill;
		}
	}

	checkFav(check?) {
		if (
			this.medicationObj[this.selectedIndex].medication.sig != '' &&
			this.medicationObj[this.selectedIndex].medication.sig != null &&
			(this.medicationObj[this.selectedIndex].favourite != 1 || check)
		) {
			this.loadSpin=true;
			this._service
				.favCheck({
					prescriberId: this.storageData.getUserId(),
					drugName: this.medicationObj[this.selectedIndex].medication.rawMed.drugName,
					sig: this.medicationObj[this.selectedIndex].medication.sig,
				})
				.subscribe((res: any = []) => {
					this.medicationObj[this.selectedIndex].favourite = res.result.data;
					this.loadSpin=false;
				},err=>{
					this.loadSpin=false;
				});
		}
	}

	sigChange(e) {
		if(e){
		if (e && e.SigText.length > 999) {
			this.toaster.error("Can't select sig contianing more than 1000 characters.", 'Error');
			this.medicationObj[this.selectedIndex].medication.sig = '';
		} else {
			this.medicationObj[this.selectedIndex].medication.sig = e ? e.SigText : '';
		}
		this.checkFav(1);
		this.getAlerts(true);
		}
		else {
			if(this.medicationObj[this.selectedIndex].favourite==1)
			{
				this.medicationObj[this.selectedIndex].favourite=0;
			}
			this.medicationObj[this.selectedIndex].medication.alerts=this.medicationObj[this.selectedIndex].medication.alerts.filter((value:any)=> value.alertType!='other');
			this.alertChecks[this.selectedIndex]['other'] = false;
		}
	}
	addTagFn(name) {
		if(name.length<=1000){
		return { SigText: name, tag: true };
		}
	}
	removeMedicine(index) {
		this.dropCheck=false;
		if( this._service.data && this._service.data.draftOrder && this._service.data.draftOrder[index] && this._service.data.draftOrder[index].medication['id'] && (this._service.taskid!=null || this._service.data.taskId)){
			
			this.drugPricingData.splice(index, 1);
		// uncheck to be fixed later
				let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[index].medication.rawMed.drugId);
				
				if(rindex!=-1 && this.checkCIISchedule(index))
				{
					this.scheduleIIdrugs[rindex].count=this.scheduleIIdrugs[rindex].count-1;
					
				}
				this.medicationObj.splice(index, 1);
				
		}
		else if (this.medicationObj[index].subTaskId) {
			this.deleteMed(
				this.medicationObj[index].subTaskId,
				this.medicationObj[index].medication.medDetailId,
				6,
				index,
			);
		} else {
			if (this._service.erxCheck == 2 && index == 0 && this.medicationObj.length>1) {

				let prevMedObj = this.medicationObj[index];
				this.medicationObj.splice(index, 1);
				prevMedObj.medication.rawMed = this.medicationObj[index].medication.rawMed;
				this.medicationObj[index] = prevMedObj;
			} else {
				let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[index].medication.rawMed.drugId);
				
				if(rindex!=-1 && this.checkCIISchedule(index))
				{
					if(this.scheduleIIdrugs[rindex].count==1)
					{
						this.scheduleIIdrugs.splice(rindex, 1);
					}
					else{
					this.scheduleIIdrugs[rindex].count-=1;
					}
				}
				this.medicationObj.splice(index, 1);
				this.drugPricingData.splice(index, 1);
			}
		}
		if (this.medicationObj.length == 0) {
			this.selectedIndex = '';
		}
		this.getAlerts();
	}
	clinicalQuantity() {
		this._service
			.getClinicalQuantity({
				id: this.medicationObj[this.selectedIndex].medication.rawMed.drugId,
				type: this.medicationObj[this.selectedIndex].medication.rawMed.type,
			})
			.subscribe((res: any) => {
				if (res.result.data.ClinicalQuantity != null) {
				this.clinicQuan=true;
					this.medicationObj[this.selectedIndex].medication.rawMed.rawData['ClinicalQuantity'] =
						res.result.data.ClinicalQuantity;
				} else {
					this.clinicQuan=false;
					if(!this.medicationObj[this.selectedIndex].medication.rawMed.rawData['ClinicalQuantity']){
						this.medicationObj[this.selectedIndex].medication.rawMed.rawData['ClinicalQuantity']= {
							ClinicalQuantityDesc: "",
							SubUnitQuantity: 0,
							SubUnitOfMeasureDesc: "",
							PackageDesc: null,
							eRxQuantity: 1,
							eRxScriptPotencyUnitCode: "",
							eRxScriptUnitOfMeasureDesc: null
						}
					}
				}
			});
	}
	onChangeSupply(event) {
		if (event.target.value.includes('.')) {
			let dotIndex = event.target.value.indexOf('.');
			event.target.value = event.target.value.substring(0, dotIndex);
		}
		if (event.target.value.length != 0) {
			if(this._service.erxCheck!=2){
				if (
					this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode == '2'
				) {
					
					this.checkSameDrugSchedule(this.medicationObj[this.selectedIndex].medication.rawMed.drugId)
					if (parseInt(event.target.value) > parseInt(this.schDaySupply)) {
						this.medicationObj[this.selectedIndex].medication.daysSupply=this.schDaySupply;
						event.target.value = this.medicationObj[this.selectedIndex].medication.daysSupply;
					} else if (parseInt(event.target.value) < 0) {
						event.target.value = '';
						this.medicationObj[this.selectedIndex].medication.daysSupply = event.target.value == '' ? null : event.target.value;
					}
				
				


				} else {
					if (parseInt(event.target.value) > 999) {
						event.target.value = '999';
						this.medicationObj[this.selectedIndex].medication.daysSupply=event.target.value
					} else if (parseInt(event.target.value) < 1) {
						event.target.value = '';
						this.medicationObj[this.selectedIndex].medication.daysSupply = event.target.value == '' ? null : event.target.value;
					}
				}
			}
			else if(this._service.erxCheck==2)
			{
				for(let k=0;k<this.medicationObj.length;k++)
				{
					if(this.checkCIICompSchedule()){
						if (parseInt(event.target.value) > parseInt(this.schDaySupply)) {
							this.medicationObj[this.selectedIndex].medication.daysSupply=this.schDaySupply;
							event.target.value = this.medicationObj[this.selectedIndex].medication.daysSupply;
						} else if (parseInt(event.target.value) < 0) {
							event.target.value = '';
							this.medicationObj[this.selectedIndex].medication.daysSupply = event.target.value == '' ? null : event.target.value;
						}
					}
					else{
						if (parseInt(event.target.value) > 999) {
							event.target.value = '999';
							this.medicationObj[this.selectedIndex].medication.daysSupply=event.target.value
						} else if (parseInt(event.target.value) < 1) {
							event.target.value = '';
							this.medicationObj[this.selectedIndex].medication.daysSupply = event.target.value == '' ? null : event.target.value;
						}	
					}
				}

			}
		}
		else {

			event.target.value = '';
			this.medicationObj[this.selectedIndex].medication.daysSupply = event.target.value == '' ? null : event.target.value;
		}
	}
	checkSameDrugSchedule(id){
		
		this.schDaySupply=this.medDaySupply;
		for(let i=0;i<this.medicationObj.length;i++)
		{
			if(this.medicationObj[i].medication.rawMed.drugId==id && i!==this.selectedIndex)
			{
				
				
				this.schDaySupply=this.schDaySupply-this.medicationObj[i].medication.daysSupply;
				
			}
		}
	}
	onChangeRefill(event) {
		if (event.target.value.length != 0) {
			event.target.value = event.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
			if(this._service.erxCheck!=2){
			if (this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode == '3' || this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode == '4') {
					if (parseInt(event.target.value) > 5) {
						event.target.value = '5';
					}
				} else {
					if (parseInt(event.target.value) < 0) {
						event.target.value = '0';
					} else if (parseInt(event.target.value) > 99) {
						event.target.value = '99';
					}
				}
			}
			else if(this._service.erxCheck==2)
			{
				for(let m=0;m<this.medicationObj.length;m++){
					if (this.medicationObj[m].medication.rawMed.rawData.FederalDEAClassCode == '3' || this.medicationObj[m].medication.rawMed.rawData.FederalDEAClassCode == '4') {
						if (parseInt(event.target.value) > 5) {
							event.target.value = '5';
							return;
						}
					} else {
						if (parseInt(event.target.value) < 0) {
							event.target.value = '0';
						} else if (parseInt(event.target.value) > 99) {
							event.target.value = '99';
						}
					}
			}

			}
		}
		else{
			event.target.value = '';
		}
		
	}
	checkFavoriteSelection()
	{
		if( this.medicationObj.length>0  && this.medicationObj[this.selectedIndex] && this.medicationObj[this.selectedIndex].favourite==1 && this.dropCheck==true )
		{
			this.medSearchType='favourite';
			return true
		}
		return false
	}
	checkPackageSelection()
	{
		if(this.medicationObj[this.selectedIndex] && this.medicationObj[this.selectedIndex].favourite!=1 && this.medicationObj[this.selectedIndex].medication.rawMed.type==1 &&  this.medicationObj.length>0 && this.dropCheck==true)
		{
			this.medSearchType='package';
			return true
		}
		return false
	}
	checkDispenseSelection()
	{
		if(this.medicationObj[this.selectedIndex] && this.medicationObj[this.selectedIndex].favourite!=1 && this.medicationObj[this.selectedIndex].medication.rawMed.type==2 && this.medicationObj.length>0 && this.dropCheck==true)
		{
			this.medSearchType='dispense';
			return true
		}
		return false
	}
	checkErxSelection()
	{
		if(this.medicationObj[this.selectedIndex] && this.medicationObj[this.selectedIndex].favourite!=1 && this.medicationObj[this.selectedIndex].medication.rawMed.type==3 || this.medicationObj.length==0)
		{
			this.medSearchType='erx';
			return true
		}
		return false
	}
	
	showDetailMedicine(index,checkAlerts?) {
		
		this.dropCheck=true;
		if(this._service.erxCheck!=2 && this.checkCIISchedule(index)){
			
		let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[index].medication.rawMed.drugId);
		
			if(rindex!=-1)
			{
				if(this.scheduleIIdrugs && this.scheduleIIdrugs[rindex].count>1)
				{
				this.startDayCheck=true;
				}
				else{
					this.startDayCheck=false;
				}
			}
			else{
			this.startDayCheck=false;
			}
		}
		else{
			this.startDayCheck=false;
			}
		{ 
			if(this.medicationObj && this.medicationObj[index] && this.medicationObj[index].pharmacy && Object.keys(this.medicationObj[index].pharmacy).length !== 0)
			{
				this.searchPharmacy=this.medicationObj[index].pharmacy.name;
				this.Filter(1,index);
				
			}
			if(this._service.erxCheck!=2){
				if(this.medicationObj && this.medicationObj[index] && this.medicationObj[index].medication.rawMed.rawData['DefaultETCID'] == "5619")
				{
					if(this.medicationObj && this.medicationObj[index] && this.medicationObj[index].medication.pharmacyNotes==null || this.medicationObj[index].medication.pharmacyNotes=='')
					{
						this.medicationObj[index].medication.pharmacyNotes='GHB:';
					}
					
				}
			}
			else if(this._service.erxCheck==2)
			{
				for(let count=0;count<this.medicationObj.length;count++){
					if(this.medicationObj && this.medicationObj[count] && this.medicationObj[count].medication.rawMed.rawData['DefaultETCID'] == "5619")
					{
						if(this.medicationObj && this.medicationObj[count] && this.medicationObj[count].medication.pharmacyNotes==null || this.medicationObj[count].medication.pharmacyNotes=='')
						{
							this.medicationObj[0].medication.pharmacyNotes='GHB:'+this.medicationObj[0].medication.pharmacyNotes;
						}
						
					}
				}
			}
		}
		
		
		this.xyremCheck = true;
		this.selectedIndex = index;
		if (this._service.erxCheck != 2) {
			this.medicationObj[index].medication.rawMed.type!=2  && this.drugPricing(this.selectedIndex);
		}
		this.isC2Schedule = false;
		this.labelWarning();
		this.counselingMessage();
		// uncheck to be fixed later
	
		if (this._service.erxCheck == 2) {
			this.getQuantityMeasure();
			this.getStrengthForm();
		}

		if (this.medSearchType == 'dispense' && !this.medicationObj[this.selectedIndex].medication.rawMed.rawData['ClinicalQuantity']) {
			this.clinicQuan=false;
			this.medicationObj[this.selectedIndex].medication.rawMed.rawData['ClinicalQuantity'] = {
				ClinicalQuantityDesc: "",
				SubUnitQuantity: 0,
				SubUnitOfMeasureDesc: "",
				PackageDesc: null,
				eRxQuantity: 1,
				eRxScriptPotencyUnitCode: "",
				eRxScriptUnitOfMeasureDesc: null
			};
		}
		this.medicationObj[index].medication.rawMed.type==1 && this.clinicalQuantity();
		if (!this.medicationObj[index].rawSig || this.medicationObj[index].rawSig == '') {
			this._service
				.getSig('', {
					prescribableDrugId: this.medicationObj[index].medication.rawMed.rawData.DispensableDrugID
						? this.medicationObj[index].medication.rawMed.rawData.DispensableDrugID
						: this.medicationObj[index].medication.rawMed.rawData.PrescribableDrugID
							? this.medicationObj[index].medication.rawMed.rawData.PrescribableDrugID
							: this.medicationObj[index].medication.rawMed.rawData.rawMed.rawData.PrescribableDrugID,
					offset: 1,
					limit: 1000,
				})
				.subscribe((res: any) => {
					this.medicationObj[index].rawSig = res.result.data;
					this.checkFav();
				});
		} else {
			this.checkFav();
			this.cdr.detectChanges();
		}
		if(checkAlerts)
		{

		}
	}
	orderRx() {
		this._service.redirectfrom = 'prescribe';
		this.viewSummaryCheck = true;
	}
	selectEvent(patient, check?) {
		this.scheduleIIdrugs=[];
		this.checkPatientDefaultPharmacy(patient);
		if (check) {
			this.caseId = null;
			if (check == 2) this.searchByName = '';
			else this.searchByChart = '';
			this.searchByCase = '';
		}
		this.medicationObj = [];
		let pheight=0;
		if(patient['height_ft'])
		{
			pheight=12*patient['height_ft'];
			if(patient['height_in'])
			{
				pheight=pheight+patient['height_in'];
			}
		}
		this.patient_info = {
			id: patient['id'],
			ssn: patient['ssn'] === '' ? null : patient['ssn'],
			suffix: null,
			name: patient.middle_name
				? patient.first_name + ' ' + patient.middle_name + ' ' + patient.last_name
				: patient.first_name + ' ' + patient.last_name,
			firstName: patient['first_name'],
			middleName: patient['middle_name'] === '' ? null : patient['middle_name'],
			lastName: patient['last_name'],
			prefix: null,
			gender: patient['gender'],
			dob: patient['dob'],
			height_ft:patient['height_ft'],
			height_in:patient['height_in'],
			height:pheight? pheight.toString():null,
			weight: patient['weight_lbs'] ? patient['weight_lbs'].toString() : null,
			primaryPhone: {
				number: patient.self ? patient.self.cell_phone : null,
				extension: patient.self ? patient.self.ext : null,
				smsSupported: null,
			},
			addressLine1: patient.self
				? patient.self.contact_information.mail_address
					? patient.self.contact_information.mail_address.street
					: null
				: null,
			addressLine2: patient.self
				? patient.self.contact_information.mail_address
					? patient.self.contact_information.mail_address.apartment
					: null
				: null,
			city: patient.self
				? patient.self.contact_information.mail_address
					? patient.self.contact_information.mail_address.city
					: null
				: null,
			stateProvince: patient.self
				? patient.self.contact_information.mail_address
					? patient.self.contact_information.mail_address.state
					: null
				: null,
			postalCode: patient.self
				? patient.self.contact_information.mail_address
					? patient.self.contact_information.mail_address.zip
					: null
				: null,
			countryCode: 'US',
			cellPhone: patient.cell_phone,
			patAllergies:patient.allergy_types
		};
		this.patient_info.addressLine2 =
			this.patient_info.addressLine2 == '' ? null : this.patient_info.addressLine2;
		this.patient_info.postalCode = this.patient_info && this.patient_info.postalCode && this.patient_info.postalCode.replace('-', '');
		this.patient_check = true;
		const userId = this.tempData.user_id;
		this.getEpcsStatus();
		this.isMediIdentider = this.tempData.role.medical_identifier;
		this.containSupervisor = this.tempData.role.has_supervisor;
		const facLocId = this.tempData.current_location_ids;
		this.canFinalize=this.tempData.role.can_finalize;
		this.prescriber_info = this.tempData.basic_info;
		this.prescriber_info['id'] = userId;
		this.getMedicalIdentifierData();
		}
	async getMedicalIdentifierData( erxAlreadychecked?)
	{
		const userId = this.tempData.user_id;
		if (this.containSupervisor == 1 && this.canFinalize==0) {
			
			if(erxAlreadychecked){
			await this.getProofingStatus(this.prescriber_info.id,1)
			await this.getEpcsStatus(this.prescriber_info.id);
			this.loadSpin=true;
			this.requestService
				.sendRequest('get_medical_identifier_by_id', 'get', REQUEST_SERVERS.erx_fd_api, {
					user_id: this.prescriber_info.id,
				})
				.subscribe(async (res) => {
					this.loadSpin=false;
					this.prescriber_info['npi'] = res['result']['data']['npi'];
					this.prescriber_info['spi'] = res['result']['data']['spi'];
					this.prescriber_info['spis'] = await res['result']['data']['spis'];
					if(!erxAlreadychecked){
					if (this.prescriber_info.spis.length > 0) {
						this.spiCheck = true;
					}
					else {
						this.spiCheck = false;
					}
					if(!erxAlreadychecked){
						this._service.erxCheck = !(this.spiCheck && this.erxButton && this.isMediIdentider == 1 && this.tempData.basic_info.epcs_status_id==3) ? 1 : this.isCompound?2:0;
					}
				}
					this.prescriber_info['dean'] = res['result']['data']['dea_number'];
					this.prescriber_info['stateLicenseNumber'] =
						res['result']['data'].license_detail && res['result']['data'].license_detail[0]
							? res['result']['data'].license_detail[0].medical_license
							: null;
					this.prescriber_info['nadean'] = res['result']['data']['nadean_number'];
				},err=>{
					this.loadSpin=false;
				});
			}else{
				this.showSupervisorsModal(userId);
			}

		}
		else {
				this.prescriber_info = this.tempData.basic_info;
				this.prescriber_info['id'] = userId;
			
			
				this.requestService
				.sendRequest('get_medical_identifier_by_id', 'get', REQUEST_SERVERS.erx_fd_api, {
					user_id: userId,
				})
				.subscribe(async (res) => {
					this.prescriber_info['npi'] = res['result']['data']['npi'];
					this.prescriber_info['spi'] = res['result']['data']['spi'];
					this.prescriber_info['spis'] = await res['result']['data']['spis'];
					
					if(!erxAlreadychecked){
					if (this.prescriber_info && this.prescriber_info.spis && this.prescriber_info.spis.length > 0) {
						this.spiCheck = true;
					}
					else {
						this.spiCheck = false;
					}

					this._service.erxCheck = !(this.spiCheck && this.erxButton && this.isMediIdentider == 1 && this.tempData.basic_info.epcs_status_id==3) ? 1 : this.isCompound?2:0;
				}
					this.prescriber_info['dean'] = res['result']['data']['dea_number'];
					this.prescriber_info['stateLicenseNumber'] =
						res['result']['data'].license_detail && res['result']['data'].license_detail[0]
							? res['result']['data'].license_detail[0].medical_license
							: null;
					this.prescriber_info['nadean'] = res['result']['data']['nadean_number'];
				});
		}
	}
	showSupervisorsModal(userId,erxAlreadychecked?){
	
			this.getSupervisors(userId);

				this.modalService.open(this.contentSupervisor, { 
					size: 'sm',
					backdrop: 'static',
					keyboard: false }).result.then((result) => {
					if (result == 'Save click') {
						this.choosenSupervisor=true;
						this.requestService
							.sendRequest('get_medical_identifier_by_id', 'get', REQUEST_SERVERS.erx_fd_api, {
								user_id: this.supervisorId,
							})
							.subscribe(async (res) => {
								this.prescriber_info['npi'] = res['result']['data']['npi'];
								this.prescriber_info['spi'] = res['result']['data']['spi'];
								this.prescriber_info['spis'] = await res['result']['data']['spis'];
								await this.getProofingStatus(this.supervisorId)
								this.getEpcsStatus(this.supervisorId);
								if(!erxAlreadychecked){
								if (this.prescriber_info.spis && this.prescriber_info.spis.length > 0) {
									this.spiCheck = true;
								}
								else {
									this.spiCheck = false;
								}

								this._service.erxCheck = !(this.spiCheck && this.erxButton && this.isMediIdentider == 1 && this.tempData.basic_info.epcs_status_id==3) ? 1 : 0;
							}
								this.prescriber_info['dean'] = res['result']['data']['dea_number'];
								this.prescriber_info['stateLicenseNumber'] =
									res['result']['data'].license_detail && res['result']['data'].license_detail[0]
										? res['result']['data'].license_detail[0].medical_license
										: null;
								this.prescriber_info['nadean'] = res['result']['data']['nadean_number'];


							});
					}
					else if(result == 'Cross click')
					{
						
					}
				});
		
	}

	mapPharmacyType(types) {
		return types.map((type) => {
			return {
				id: type.id,
				name: type.name,
			};
		});
	}
	selectPharmacy(pharmacy) {
		if(pharmacy?.id == this.medicationObj[this.selectedIndex]?.pharmacy?.id) {
			this.medicationObj[this.selectedIndex].pharmacy = {};
			return
		}
		this.medicationObj[this.selectedIndex].pharmacy = {
			id: pharmacy['id'],
			ncpdpId: pharmacy['ncpdp_id'],
			npi: pharmacy['npi'],
			name: pharmacy['organization_name'],
			addressLine1: pharmacy['address_line1'],
			city: pharmacy['city'],
			stateProvince: pharmacy['state_province'],
			postalCode: pharmacy['postal_code'],
			countryCode: pharmacy['country_code'],
			primaryPhone: {
				number: pharmacy.primary_telephone,
				extension: pharmacy.primary_telephone_ext,
				smsSupported: pharmacy.primary_telephone_support_sms,
			},
		};
		this.show_pharmacy[this.selectedIndex] = true;
	}
	isErrorRepeat(draftOrder, redirect) {
		let errCount = 0;
		if(this._service.erxCheck!=2){
			if (this.medicationObj[this.selectedIndex].medication.effectiveDate == null || this.medicationObj[this.selectedIndex].medication.effectiveDate == "") {
			errCount += 1;
		}
		if (draftOrder[this.selectedIndex].medication.rawMed.rawData['DefaultETCID'] == "571") {
			errCount += 1;
		}
		else if (draftOrder[this.selectedIndex].medication.rawMed.rawData['DefaultETCID'] == "5619") {
			errCount += 1;
		}
		for (let i = 0; i < draftOrder.length; i++) {
			if (draftOrder[i].medication.quantity == '' || draftOrder[i].medication.quantity == null) {
				errCount += 1;
			}
			if (this.medicationObj[this.selectedIndex].medication.effectiveDate == null || this.medicationObj[this.selectedIndex].medication.effectiveDate == "") {
				errCount += 1;
			}
			if (
				redirect === 1 &&
				(draftOrder[i].pharmacy == null ||
					Object.keys(draftOrder[i].pharmacy).length === 0)
			) {
				errCount += 1;
			}
			if (draftOrder[i].medication.sig == '' || draftOrder[i].medication.sig == null) {
				errCount += 1;
			}
			if (
				draftOrder[i].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
				''
			) {
				errCount += 1;
			}
			if (draftOrder[i].medication.refill == null) {
				errCount += 1;
			}
		}

		if (this.lastErrDisplay == 0) {
			this.lastErrDisplay = Date.now();
		}
		if (errCount == this.errDisplayCount) {
			this.errDisplay = false;
			var currTime = Date.now();
			if (currTime - this.lastErrDisplay > 5000) {
				this.lastErrDisplay = currTime;
				this.errDisplay = true;

			}
		}
		else if (errCount != this.errDisplayCount) {
			this.errDisplayCount = errCount;
			this.errDisplay = true;

		}
		}
		else{
			this.errDisplay=true;
		}
	}
	addToDraftBtn(redirect) {
		let draftOrder: any = cloneDeep(this.medicationObj);
		this.isErrorRepeat(draftOrder, redirect);
		let currentDate = new Date();
		let dateError = false;
		if(draftOrder && this._service.erxCheck != 2) {
			draftOrder.forEach(x => {
				if(new Date(x?.medication?.effectiveDate).getFullYear() < currentDate.getFullYear()) 
				{
					dateError = true;
				}
				else if(new Date(x?.medication?.effectiveDate).getFullYear() == currentDate.getFullYear()) {
					if(new Date(x?.medication?.effectiveDate).getMonth() < currentDate.getMonth()) {
						dateError = true;
					}
					else if(new Date(x?.medication?.effectiveDate).getMonth() == currentDate.getMonth()) {
						if(new Date(x?.medication?.effectiveDate).getDate() < currentDate.getDate()) {
							dateError = true;
						}
					}
				}
			})
		}
		if(draftOrder && this._service.erxCheck == 2) {
			draftOrder.forEach(x => {
				if(new Date(draftOrder?.[0]?.medication?.effectiveDate).getFullYear() < currentDate.getFullYear()) 
				{
					dateError = true;
				}
				else if(new Date(draftOrder?.[0]?.medication?.effectiveDate).getFullYear() == currentDate.getFullYear()) {
					if(new Date(draftOrder?.[0]?.medication?.effectiveDate).getMonth() < currentDate.getMonth()) {
						dateError = true;
					}
					else if(new Date(draftOrder?.[0]?.medication?.effectiveDate).getMonth() == currentDate.getMonth()) {
						if(new Date(draftOrder?.[0]?.medication?.effectiveDate).getDate() < currentDate.getDate()) {
							dateError = true;
						}
					}
				}
			})
		}
		if(dateError) {
			this.toaster.error(`Start date should be greater or equal to current date `,'Error');
			return
		}
		if(this._service.erxCheck == 2 && this.medicationObj.length < 2 && (redirect != 0 || (redirect == 0 && this.containSupervisor))) {
			this.toaster.error("Please select a least 2 medicine for a compound Medication !", "Error")
			return;
		} 
		else {
			this.xyremCheck = false;
			if (this._service.erxCheck != 2) {
				for (let i = 0; i < draftOrder.length; i++) {
					delete draftOrder[i].rawSig;
					if (!draftOrder[i].pharmacy) {
						draftOrder[i].pharmacy = {};
					}
					if ((draftOrder[i].medication.quantity == '' || draftOrder[i].medication.quantity == null)) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Add dispense for the ${this.medicationObj[i].medication.rawMed.drugName} medicine`,
								'Error',
							);
						}
						return;
					}
					
					if ((draftOrder[i].medication.quantity == 0)) {
							this.toaster.error(
								`Dispense should be greater than 0 for ${this.medicationObj[i].medication.rawMed.drugName} medicine`,
								'Error',
							);
						return;
					}
					if (draftOrder[i].medication.sig == null) {
						draftOrder[i].medication.sig = '';
					}

					if (
						!draftOrder[i].medication.icd10Codes.id &&
						draftOrder[i].medication.icd10Codes.codes.length == 0
					) {
						delete draftOrder[i].medication.icd10Codes;
					}
				}
			}
			else if (this._service.erxCheck == 2) {

				delete draftOrder[0].rawSig;
				if (!draftOrder[0].pharmacy) {
					draftOrder[0].pharmacy = {};
				}
				if ((draftOrder[0].medication.compoundQuantity == '' || draftOrder[0].medication.compoundQuantity == null)) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Add dispense for the compound medicine`,
							'Error',
						);
					}
					return;
				}
				for(let m=0;m<draftOrder.length;m++){
					if (draftOrder[m].medication.rawMed.rawData['DefaultETCID'] == "5619") {
					
						if(draftOrder[0].medication.pharmacyNotes == '' || draftOrder[0].medication.pharmacyNotes == null)
					{
						if (this.errDisplay == true) {
							this.toaster.error("Please provide medical reason for compound medicine!", "Error")
						}
						return;
					}
					else{
						let notes=draftOrder[0].medication.pharmacyNotes.split(':');
						
						if(notes[0]!="GHB")
						{
							this.toaster.error("'GHB:' is required in this format for compound Medicine!", "Error")
							return 
						}
						else if(notes[1]==null ||notes[1]=="")
						{
							this.toaster.error("Please provide medical reason for compound medicine!", "Error")
							return;
						}
					}
				}
			}
				
				if (draftOrder[0].medication.compoundQuantity == 0) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Dispense should be greater than 0 for compound medicine`,
							'Error',
						);
					}
					return;
				}
				for(let j=0;j<draftOrder.length;j++){
					if ((draftOrder[j].medication.quantity == 0)) {
						this.toaster.error(
							`Dispense should be greater than 0 for ${this.medicationObj[j].medication.rawMed.drugName} medicine`,
							'Error',
						);
					return;
					}
				}


				if (draftOrder[0].medication.sig == null) draftOrder[0].medication.sig = '';
				if (
					!draftOrder[0].medication.icd10Codes.id &&
					draftOrder[0].medication.icd10Codes.codes.length == 0
				) {
					delete draftOrder[0].medication.icd10Codes;
				}

			}
			let body;
			if (this._service.erxCheck != 2) {
				if(this._service.erxCheck==1){
					for(let i=0;i<draftOrder.length;i++)
					{
						delete draftOrder[i].pharmacy;
					}
			}
			
			
				body = {
					taskId: this.taskid ? this.taskid : null,
					draftOrder: draftOrder,
					patient: {
						id: this.patient_info.id,
						ssn: this.patient_info.ssn,
						firstName: this.patient_info.firstName,
						middleName: this.patient_info.middleName,
						lastName: this.patient_info.lastName,
						weight: this.patient_info.weight,
						height_ft:this.patient_info.height_ft,
						height_in:this.patient_info.height_in,
						height: this.patient_info.height,
						dob: this.patient_info.dob,
						gender: this.mapGenderStringToChar(this.patient_info.gender),
						addressLine1: this.patient_info.addressLine1,
						addressLine2: this.patient_info.addressLine2,
						city: this.patient_info.city,
						stateProvince: this.patient_info.stateProvince,
						postalCode: this.patient_info.postalCode,
						countryCode: this.patient_info.countryCode,
						primaryPhone: this.patient_info.primaryPhone,
					},
					prescriber: {
						id: parseInt(this.prescriber_info['id']),
						npi: this.prescriber_info['npi'],
						dean: this.prescriber_info['dean'],
						stateLicenseNumber: this.prescriber_info['stateLicenseNumber'],

						nadean: this.prescriber_info['nadean'],
						spi: this.prescriber_info['spi'],
						firstName: this.prescriber_info['first_name']? this.prescriber_info['first_name']:this.prescriber_info['firstName'],
						middleName: this.prescriber_info['middle_name']? this.prescriber_info['middle_name']:this.prescriber_info['middle_name'],
						lastName: this.prescriber_info['last_name']?this.prescriber_info['last_name']:this.prescriber_info['lastName'],
						addressLine1: this.prescriber_info['address']?this.prescriber_info['address']:this.prescriber_info['addressLine1'],
						city: this.prescriber_info['city'],
						stateProvince: this.prescriber_info['state']?this.prescriber_info['state']:this.prescriber_info['stateProvince'],
						postalCode:this.prescriber_info['zip']?this.prescriber_info['zip'].replace('-', ''): this.prescriber_info['postalCode'] && this.prescriber_info['postalCode'].replace('-', ''),
						countryCode: this.patient_info.countryCode,
						primaryPhone: this.prescriber_info.cell_no? {
							number: this.prescriber_info.cell_no}:this.prescriber_info['primaryPhone'],
					},
					task: this.taskdetail.task,
					case: {
						id: this._router.url.includes('template-manager')? this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail == '' ? null : this.taskdetail.case.id,
					},
					visit: {
						id: this._router.url.includes('template-manager')? this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId: this.taskdetail == '' ? null : this.taskdetail.visit.id,
					},
				};
				if(this.containSupervisor==1 && this.canFinalize==0)
				{
					body['delegator']={
						id:this.tempData.user_id
					}
				}

				
				
			}
			else if (this._service.erxCheck == 2) {

				let compMed = [];
				let compAlerts = draftOrder[0].medication.alerts;
				for (let k = 0; k < draftOrder.length; k++) {
					compMed.push({
						quantity: draftOrder[k].medication.quantity,
						rawMed: draftOrder[k].medication.rawMed,
						id:draftOrder[k].medication.medId
					})
				}

				// checks for deleting empty id in case of compound Medication
				for (let k = 0; k < compMed.length; k++) {
					if(!compMed[k].id){
						delete compMed[k].id
					}
				}


				for (let m = 1; m < draftOrder.length; m++) {
					compAlerts.concat(draftOrder[m].medication.alerts);
				}
				let compDraftOrder = [];
				compDraftOrder.push({
					medication: {
						compoundMedication: compMed,
						quantityUnitOfMeasureCode: draftOrder[0].medication.quantityUnitOfMeasureCode,
						quantityUnitOfMeasureName: draftOrder[0].medication.quantityUnitOfMeasureName,
						quantityUnitOfMeasureId:draftOrder[0].medication.quantityUnitOfMeasureId,
						description: draftOrder[0].medication.description,
						strengthFormId: draftOrder[0].medication.strengthFormId,
						strengthFormCode: draftOrder[0].medication.strengthFormCode,
						strengthFormName: draftOrder[0].medication.strengthFormName,
						sig: draftOrder[0].medication.sig,
						scriptDate: draftOrder[0].medication.scriptDate,
						effectiveDate: draftOrder[0].medication.effectiveDate,
						quantity: draftOrder[0].medication.compoundQuantity,
						refill: draftOrder[0].medication.refill,
						medDetailId:draftOrder[0].medication.medDetailId?draftOrder[0].medication.medDetailId:null,
						substitute: draftOrder[0].medication.substitute,
						daysSupply: draftOrder[0].medication.daysSupply,
						internalComments: draftOrder[0].medication.internalComments,
						pharmacyNotes: draftOrder[0].medication.pharmacyNotes,
						icd10Codes: draftOrder[0].medication['icd10Codes'],
						alerts: compAlerts,
						allALertCheck:this.medicationObj[0].medication.allALertCheck
					},
					pharmacy: draftOrder[0].pharmacy,
					favourite:0,
					subTaskId:draftOrder[0].subTaskId?draftOrder[0].subTaskId:null
				})
	
				for(let i=0;i<compDraftOrder.length;i++){
					if(!compDraftOrder[i].subTaskId)
					{
						delete compDraftOrder[i].subTaskId;

					}
					if(!compDraftOrder[i].medication.medDetailId)
					{
						delete compDraftOrder[i].medication.medDetailId;
					}

				}

				

				body = {
					isCompoundMed: true,
					taskId: this.taskid ? this.taskid : null,
					draftOrder: compDraftOrder,
					patient: {
						id: this.patient_info.id,
						ssn: this.patient_info.ssn,
						firstName: this.patient_info.firstName,
						middleName: this.patient_info.middleName,
						lastName: this.patient_info.lastName,
						weight: this.patient_info.weight,
						height: this.patient_info.height,
						height_ft:this.patient_info.height_ft,
						height_in:this.patient_info.height_in,
						dob: this.patient_info.dob,
						gender: this.mapGenderStringToChar(this.patient_info.gender),
						addressLine1: this.patient_info.addressLine1,
						addressLine2: this.patient_info.addressLine2,
						city: this.patient_info.city,
						stateProvince: this.patient_info.stateProvince,
						postalCode: this.patient_info.postalCode,
						countryCode: this.patient_info.countryCode,
						primaryPhone: this.patient_info.primaryPhone,
					},
					prescriber: {
						id: parseInt(this.prescriber_info['id']),
						npi: this.prescriber_info['npi'],
						dean: this.prescriber_info['dean'],
						stateLicenseNumber: this.prescriber_info['stateLicenseNumber'],

						nadean: this.prescriber_info['nadean'],
						spi: this.prescriber_info['spi'],
						firstName: this.prescriber_info['first_name']? this.prescriber_info['first_name']:this.prescriber_info['firstName'],
						middleName: this.prescriber_info['middle_name']? this.prescriber_info['middle_name']:this.prescriber_info['middle_name'],
						lastName: this.prescriber_info['last_name']?this.prescriber_info['last_name']:this.prescriber_info['lastName'],
						addressLine1: this.prescriber_info['address']?this.prescriber_info['address']:this.prescriber_info['addressLine1'],
						city: this.prescriber_info['city'],
						stateProvince: this.prescriber_info['state']?this.prescriber_info['state']:this.prescriber_info['stateProvince'],
						postalCode:this.prescriber_info['zip']?this.prescriber_info['zip'].replace('-', ''): this.prescriber_info['postalCode'] && this.prescriber_info['postalCode'].replace('-', ''),
						countryCode: this.patient_info.countryCode,
						primaryPhone: this.prescriber_info.cell_no? {
							number: this.prescriber_info.cell_no}:this.prescriber_info['primaryPhone'],
					},
					task: this.taskdetail.task,
					case: {
						id: this._router.url.includes('template-manager')? this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail == '' ? null : this.taskdetail.case.id,
					},
					visit: {
						id: this._router.url.includes('template-manager')? this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId: this.taskdetail == '' ? null : this.taskdetail.visit.id,
					},
				};
				if(this.containSupervisor==1 && this.canFinalize==0)
				{
					body['delegator']={
						id:this.tempData.user_id
					}
				}

			}
			if (this.caseId != null) {
				body.case.id = this.caseId;
			}
			if (redirect === 1 || redirect === 2) {
				
				//For orderRx
				let pharmaCheck = true;
				if (this._service.erxCheck != 2) {
					for (let index = 0; index < draftOrder.length; index++) {
							if (
								draftOrder[index].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
								'' || draftOrder[index].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc == null
							) {
								if (this.errDisplay == true) {
									this.toaster.error(
										`Add dispense unit for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
										'Error',
									);
								}
								pharmaCheck = false;
								break;
							}
							
							if(this.checkCIISchedule(index)){
								let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[index].medication.rawMed.drugId);
								if(rindex!=-1 && this.scheduleIIdrugs[rindex].count>1){
									if (draftOrder[index].medication.effectiveDate == null || draftOrder[index].medication.effectiveDate == "")
									 {
												
												this.toaster.error(
													`Start Date is ${this.medicationObj[index].medication.rawMed.drugName} Required`,
													'Error',
												);
										
										pharmaCheck = false;
									}
								}
								if (draftOrder[index].medication.daysSupply == null || draftOrder[index].medication.daysSupply == 0) {
										
										this.toaster.error(
											`Days Supply for ${this.medicationObj[index].medication.rawMed.drugName} is Required`,
											'Error',
										);
								
								pharmaCheck = false;
							}
							}

						if(draftOrder[index].medication.effectiveDate!=null)
						{
							let date1=new Date(draftOrder[index].medication.effectiveDate).setHours(0,0,0,0);
							let date2=new Date(this.minDate).setHours(0, 0, 0, 0);

							if(date1<date2)
							{
								
							}
							if(date1==date2)
							{
								
							}
							if(date1>date2)
							{
								
							}
							
							 	if(date1<date2)
								{
								this.toaster.error(
									`Start date should be greater or equal to current date `,'Error',
								);
							pharmaCheck = false;
							break;
							}
						}

						if(draftOrder[index].medication.effectiveDate!=null && draftOrder[index].medication.effectiveDate>this.getMaxStartDate())
							{
							this.toaster.error(
							`Earliest fill date for ${draftOrder[index].medication.rawMed.drugName} should be less than 6 months`, 'Error'
							);
							pharmaCheck = false;
							break;
						}
						if (draftOrder[index].medication.sig == '' || draftOrder[index].medication.sig == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Select a sig for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
									'Error',
								);
							}
							pharmaCheck = false;
							break;
						}
						if (
							redirect === 1 && this._service.erxCheck!=1 &&
							(draftOrder[index].pharmacy == null ||
								Object.keys(draftOrder[index].pharmacy).length === 0)
						) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Select a pharmacy for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
									'Error',
								);
							}
							pharmaCheck = false;
							break;
						}
						if (draftOrder[index].medication.rawMed.rawData['DefaultETCID'] == "5619") {
							
								if(draftOrder[index].medication.pharmacyNotes == '' || draftOrder[index].medication.pharmacyNotes == null)
							{
								if (this.errDisplay == true) {
									this.toaster.error(`Please provide medical reason for ${this.medicationObj[index].medication.rawMed.drugName} medicine!`, "Error")
								}
								return;
							}
							else{
								let notes=draftOrder[index].medication.pharmacyNotes.split(':');
								
								
								if(notes[0]!="GHB")
								{
									this.toaster.error("'GHB:' is required in this format for compound Medicine!", "Error")
									return 
								}
								else if(notes[1]==null ||notes[1]=="")
								{
									this.toaster.error(`Please provide medical reason for ${this.medicationObj[index].medication.rawMed.drugName} medicine!`, "Error")
									return;
								} 
							}
						}

						if (
							draftOrder[index].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
							''
						) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Add dispense unit for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
									'Error',
								);
							}
							pharmaCheck = false;
							break;
						}
						if (draftOrder[index].medication.refill == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Refill can't be empty.Please enter refill for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
								);
							}
							return;
						}
					}
				}
				else if (this._service.erxCheck == 2) {

					if(this.checkCIICompSchedule()){
						if (draftOrder[this.selectedIndex].medication.effectiveDate == null || draftOrder[this.selectedIndex].medication.effectiveDate == "") 
							{										
										this.toaster.error(
											`Start Date For Compound Medicine is Required`,
											'Error',
										);
								
								pharmaCheck = false;
							
						}
						if (draftOrder[this.selectedIndex].medication.daysSupply == null || draftOrder[this.selectedIndex].medication.daysSupply == 0) {
								
								this.toaster.error(
									`Days Supply For Compound Medicine is Required`,
									'Error',
								);
						
						pharmaCheck = false;
					}
					}

					if(draftOrder[0].medication.effectiveDate!=null)
						{
							let date1=new Date(draftOrder[0].medication.effectiveDate).setHours(0,0,0,0);
							let date2=new Date(this.minDate).setHours(0, 0, 0, 0);

							if(date1<date2)
							{
								
							}
							if(date1==date2)
							{
								
							}
							if(date1>date2)
							{
								
							}
							
							 	if(date1<date2)
								{
								this.toaster.error(
									`Start date should be greater or equal to current date `,'Error',
								);
							pharmaCheck = false;
							
							}
						}

						if(draftOrder) {
							draftOrder.forEach(x => {
								if(new Date(draftOrder?.[0]?.medication?.effectiveDate) != null && new Date(draftOrder?.[0]?.medication?.effectiveDate) > this.getMaxStartDate() 
								&& (x?.medication?.rawMed?.rawData?.FederalDEAClassCode == '3' || x?.medication?.rawMed?.rawData?.FederalDEAClassCode == '4')) {
									this.toaster.error(
										`Earliest fill date for ${x?.medication?.rawMed?.drugName} should be less than 6 months`, 'Error'
										);
										pharmaCheck = false;
								}
							})
						}

					if (draftOrder[0].medication.sig == '' || draftOrder[0].medication.sig == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a sig for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}
					if (draftOrder[0].medication.description == '' || draftOrder[0].medication.description == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Enter a name for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}
					if (draftOrder[0].medication.strengthFormId == '' || draftOrder[0].medication.strengthFormId == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a strenght form for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}
					if (draftOrder[0].medication.quantityUnitOfMeasureCode == '' || draftOrder[0].medication.quantityUnitOfMeasureCode == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a dispense unit for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}
					if (
						redirect === 1 &&
						(draftOrder[0].pharmacy == null ||
							Object.keys(draftOrder[0].pharmacy).length === 0)
					) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a pharmacy for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}

					if (
						draftOrder[0].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
						''
					) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Add dispense unit for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}
					if (draftOrder[0].medication.refill == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Refill can't be empty.Please enter refill for the compound medicine`,
							);
						}
						return;
					}


				}

				if (!pharmaCheck) {
					return;
				}
				for (let i = 0; this._service.data && this._service.data.draftOrder && i < this._service.data.draftOrder.length; i++) {
				if(!this._service.data.draftOrder[i].medication.lastFillDate){
					delete this._service.data.draftOrder[i].medication.lastFillDate;
				}
				if (!this._service.data.draftOrder[i].medication.icd10Codes){
					delete this._service.data.draftOrder[i].medication.icd10Codes;
				}

				if (!this._service.data.draftOrder[i].medication.id){
					delete this._service.data.draftOrder[i].medication.id;
				}
				
				if (this._service.data.draftOrder[i].medication.icd10Codes &&
					!this._service.data.draftOrder[i].medication.icd10Codes.id &&
					this._service.data.draftOrder[i].medication.icd10Codes.codes.length == 0
				) {
					delete this._service.data.draftOrder[i].medication.icd10Codes;
				}

				delete this._service.data.draftOrder[i].medication.rxfillStatus;
				delete this._service.data.draftOrder[i].medication.rxfillNote;
				}
				
				if(this._service.erxCheck==2 && this._service.data && this._service.data.draftOrder)
				{
					this._service.data.draftOrder[0].medication['isMedicationChanged']=0
					delete this._service.data.draftOrder[0].medication['isMedicationChanged'];

				}
				const tempService=cloneDeep(this._service.data && this._service.data.draftOrder);
				const tempBody=cloneDeep(body.draftOrder);
				for(let k=0;tempService && k<tempService.length;k++)
				{
					tempService[k].medication.alerts={}

				}
				for(let l=0;tempBody && l<tempBody.length;l++)
				{
					tempBody[l].medication.alerts={}
					
				}

				
				if(isEqual(tempService, tempBody)){
					
					this._service.updated=false;
				}
				else{
					if(this._service.erxCheck!=2){
						this._service.updated=true;
					}
					else if( this._service.erxCheck==2 && this._service.data && this._service.data.draftOrder){
						let cmpDiff=this.difference(this._service.data.draftOrder, body.draftOrder)
						
						let changes=cmpDiff[0].medication
						if(changes){
							if(Object.keys(changes).length === 0){
								this._service.updated=false;
								
							}
							else if(Object.keys(changes).length > 0){
								this._service.updated=true;
								
							}
						} 

					}
					
				}
				
				
				

				this._service.action = 'normal';
				if (redirect == 2) {
					this._service.data = cloneDeep(body);
					this.orderRx();
					return;
				}
			}

			if (this.medicationObj.length != 0) {
				delete body.task;
				// checks for add to draft for a delegator
				if (this.containSupervisor==1 && this.canFinalize==0) {
					//For orderRx
					let pharmaCheck = true;
					if (this._service.erxCheck != 2) {
						for (let index = 0; index < draftOrder.length; index++) {
							
							if(this.checkCIISchedule(index)){
								let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[index].medication.rawMed.drugId);
								if(rindex!=-1 && this.scheduleIIdrugs[rindex].count>1){
									if (draftOrder[index].medication.effectiveDate == null || draftOrder[index].medication.effectiveDate=="") {
												
												this.toaster.error(
													`Start Date is ${this.medicationObj[index].medication.rawMed.drugName} Required`,
													'Error',
												);
										
										pharmaCheck = false;
									}
								}
								if (draftOrder[index].medication.daysSupply == null || draftOrder[index].medication.daysSupply == 0) {
										
										this.toaster.error(
											`Days Supply for ${this.medicationObj[index].medication.rawMed.drugName} is Required`,
											'Error',
										);
								
								pharmaCheck = false;
							}
							}
							if(this.medicationObj[this.selectedIndex].medication.effectiveDate!=null)
						{
							let date1=new Date(this.medicationObj[this.selectedIndex].medication.effectiveDate).setHours(0,0,0,0);
							let date2=new Date(this.minDate).setHours(0, 0, 0, 0);

							if(date1<date2)
							{
								
							}
							if(date1==date2)
							{
								
							}
							if(date1>date2)
							{
								
							}
							
							 	if(date1<date2)
								{
								this.toaster.error(
									`Start date should be greater or equal to current date `,'Error',
								);
							pharmaCheck = false;
							break;
							}
						}





							if (draftOrder[index].medication.sig == '' || draftOrder[index].medication.sig == null) {
								if (this.errDisplay == true) {
									this.toaster.error(
										`Select a sig for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
										'Error',
									);
								}
								pharmaCheck = false;
								break;
							}
							if (
								(draftOrder[index].pharmacy == null ||
									Object.keys(draftOrder[index].pharmacy).length === 0) && this._service.erxCheck!=1)
							 {
								if (this.errDisplay == true) {
									this.toaster.error(
										`Select a pharmacy for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
										'Error',
									);
								}
								pharmaCheck = false;
								break;
							}

							if (
								draftOrder[index].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
								''
							) {
								if (this.errDisplay == true) {
									this.toaster.error(
										`Add dispense unit for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
										'Error',
									);
								}
								pharmaCheck = false;
								break;
							}
							if (draftOrder[index].medication.refill == null) {
								if (this.errDisplay == true) {
									this.toaster.error(
										`Refill can't be empty.Please enter refill for the ${this.medicationObj[index].medication.rawMed.drugName} medicine`,
									);
								}
								return;
							}
						}
					}
					else if (this._service.erxCheck == 2) {

						if (draftOrder[0].medication.sig == '' || draftOrder[0].medication.sig == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Select a sig for the compound medicine`,
									'Error',
								);
							}
							pharmaCheck = false;

						}
						if (draftOrder[0].medication.description == '' || draftOrder[0].medication.description == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Enter a name for the compound medicine`,
									'Error',
								);
							}
							pharmaCheck = false;

						}
						if (draftOrder[0].medication.strengthFormId == '' || draftOrder[0].medication.strengthFormId == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Select a strenght form for the compound medicine`,
									'Error',
								);
							}
							pharmaCheck = false;

						}
						if (draftOrder[0].medication.quantityUnitOfMeasureCode == '' || draftOrder[0].medication.quantityUnitOfMeasureCode == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Select a dispense unit for the compound medicine`,
									'Error',
								);
							}
							pharmaCheck = false;

						}
						if (
							
							draftOrder[0].pharmacy == null ||
								Object.keys(draftOrder[0].pharmacy).length === 0)
						{
							if (this.errDisplay == true) {
								this.toaster.error(
									`Select a pharmacy for the compound medicine`,
									'Error',
								);
							}
							pharmaCheck = false;

						}

						if (
							draftOrder[0].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
							''
						) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Add dispense unit for the compound medicine`,
									'Error',
								);
							}
							pharmaCheck = false;

						}
						if (draftOrder[0].medication.refill == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Refill can't be empty.Please enter refill for the compound medicine`,
								);
							}
							return;
						}


					}

					if (!pharmaCheck) {
						return;
					}
				}
				if (this._service.taskid == null && this._service.data && this._service.data.taskId==null && body.taskId==null) {
					
					if(this._service.erxCheck==2 && !this.checkScheduleDrugs())
					{
						this.modalService.open(this.contentPrompt, { 
							size: 'sm',
							backdrop: 'static',
							keyboard: false }).result.then((result) => {
							if (result == 'Save click') {
								this.loadSpin=true;
								this._service.addtodraft('', body).subscribe((response: any = []) => 
					{
						this._service.data.taskId = response.result.data.taskId;
						this._service.data=cloneDeep(response.result.data);
						this._service.data.task_list=false;
						this.loadSpin=false;						
						if(response.status==200)
						{
							if(redirect==0)
							{
							this.prescLogsActionRecords(1,1,response && response.result);
							this.toaster.success(response.message, 'Success');
								if (!this.patientIn) this._router.navigate([this._router.url.replace('prescribe', '')]);
								else this.patientEmit.emit('erx');
							}
							else{
							this.prescLogsActionRecords(1,1,response && response.result);
							if (this._service.erxCheck != 2) {
								for (var i = 0; i < this.medicationObj.length; i++) {
									if (
										this.medicationObj[i].medication.sig == '' ||
										this.medicationObj[i].medication.sig == null
									) {
										this.toaster.error('Sig is required', 'Error');
										return;
									}
								}
								}
								this.orderRx();
							}
						}
						else if(response.status!=200)
						{

						}

						if (response.status == 200) {

							if (redirect == 1) {
								if (this._service.erxCheck != 2) {
									for (var i = 0; i < this.medicationObj.length; i++) {
										if (
											this.medicationObj[i].medication.sig == '' ||
											this.medicationObj[i].medication.sig == null
										) {
											this.toaster.error('Sig is required', 'Error');
											return;
										}
									}
								}
							} else {
								
							}
						} else {
							this.toaster.error(response.message, 'Error');
						}
					}
					,(error)=>{
						this.loadSpin=false;
					});
							}
							if (result == 'Close click') {

							}
						})
					}
					else{
						
						this.loadSpin=true;
						this._service.addtodraft('', body).subscribe((response: any = []) => 
					{
						this._service.data.taskId = response.result.data.taskId;
						this._service.data=cloneDeep(response.result.data);
						this._service.data.task_list=false;
						this.loadSpin=false;						
						if(response.status==200)
						{
							if(redirect==0)
							{
							this.prescLogsActionRecords(1,1,response && response.result);
							this.toaster.success(response.message, 'Success');
								if (!this.patientIn) this._router.navigate([this._router.url.replace('prescribe', '')]);
								else this.patientEmit.emit('erx');
							}
							else{
							this.prescLogsActionRecords(1,1,response && response.result);
							if (this._service.erxCheck != 2) {
								for (var i = 0; i < this.medicationObj.length; i++) {
									if (
										this.medicationObj[i].medication.sig == '' ||
										this.medicationObj[i].medication.sig == null
									) {
										this.toaster.error('Sig is required', 'Error');
										return;
									}
								}
								}
								this.orderRx();
							}
						}
						else if(response.status!=200)
						{
							
						}

						if (response.status == 200) {

							if (redirect == 1) {
								if (this._service.erxCheck != 2) {
									for (var i = 0; i < this.medicationObj.length; i++) {
										if (
											this.medicationObj[i].medication.sig == '' ||
											this.medicationObj[i].medication.sig == null
										) {
											this.toaster.error('Sig is required', 'Error');
											return;
										}
									}
								}
							} else {
								
							}
						} else {
							this.toaster.error(response.message, 'Error');
						}
					}
					,(error)=>{
						this.loadSpin=false;
						});
					}
				}
				else {
					if(!body['taskId']){
					body['taskId'] = this._service.data && this._service.data.taskId? this._service.data.taskId:this._service.taskid;
					}
					
					
					
					if(this._service.erxCheck!=2)
        			{
          				for(let j=0;j<body.draftOrder.length;j++)
						{
								if(body.draftOrder[j] && body.draftOrder[j].medication && body.draftOrder[j].medication.compoundMedication){
									delete body.draftOrder[j].medication.compoundMedication;
								}
						}
        			}
					if(this._service.erxCheck==2 && !this.checkScheduleDrugs())
					{
						this.modalService.open(this.contentPrompt, { 
							size: 'sm',
							backdrop: 'static',
							keyboard: false }).result.then((result) => {
							if (result == 'Save click') {
								this.loadSpin=true;
								this._service.addtodraft('', body).subscribe((response: any = []) => 
							{
							this._service.data=cloneDeep(response.result.data);
							this._service.data.taskId = response.result.data.taskId;
							this.loadSpin=false;
							this._service.data.task_list=false;
							if(response.status==200)
							{
								if(redirect==0){
								this.toaster.success(response.message, 'Success');
								if (!this.patientIn) this._router.navigate([this._router.url.replace('prescribe', '')]);
								else this.patientEmit.emit('erx');
								if(this._service.updated==true){
									this.prescLogsActionRecords(1,2,response.result);
								}
								}
								else{
								if(this._service.updated==true){
									this.prescLogsActionRecords(1,2,response.result);
								}
								else{

								}
								this.orderRx();
								}
							}
							else
							{
								if(this._service.updated==true){
									if((this._service.neededReadySign==1 || this._service.neededReadySign==2) && this._service.readySigned==true)
									{
										this.prescriptionsLogRecordsIndex(2,11,-1);
									}else{

										this.prescLogsActionRecords(2,2,response.result);
									}
								
								}
								else{
									this.prescLogsActionRecords(2,7,response.result);
								}
								this.orderRx();
							}
							if (response.status == 200) {

								if (redirect == 1) {
									if (this._service.erxCheck != 2) {
										for (var i = 0; i < this.medicationObj.length; i++) {
											if (
												this.medicationObj[i].medication.sig == '' ||
												this.medicationObj[i].medication.sig == null
											) {
												this.toaster.error('Sig is required', 'Error');
												return;
											}
										}
									}
								} else {
									
								}
							} else {
								this.toaster.error(response.message, 'Error');
							}
						}
						,(error)=>{
							this.loadSpin=false;
						});		
							}
							if (result == 'Close click') {
								
							}
						})
					}
					else{
						this.loadSpin=true;
						this._service.addtodraft('', body).subscribe((response: any = []) => 
						{
							this._service.data=cloneDeep(response.result.data);
							this._service.data.taskId = response.result.data.taskId;
							this.loadSpin=false;
							this._service.data.task_list=false;
							if(response.status==200)
							{
								if(redirect==0){
								this.toaster.success(response.message, 'Success');
								if (!this.patientIn) this._router.navigate([this._router.url.replace('prescribe', '')]);
								else this.patientEmit.emit('erx');
								if(this._service.updated==true){
									this.prescLogsActionRecords(1,2,response.result);
									}
								}
								else{
								if(this._service.updated==true){
									this.prescLogsActionRecords(1,2,response.result);
								}
								else{
									
								}
								this.orderRx();
								}
							}
							else
							{
								if(this._service.updated==true){
									if((this._service.neededReadySign==1 || this._service.neededReadySign==2) && this._service.readySigned==true)
									{
										this.prescriptionsLogRecordsIndex(2,11,-1);
									}else{

										this.prescLogsActionRecords(2,2,response.result);
									}
								
								}
								else{
									this.prescLogsActionRecords(2,7,response.result);
								}
								this.orderRx();
							}
							if (response.status == 200) {

								if (redirect == 1) {
									if (this._service.erxCheck != 2) {
										for (var i = 0; i < this.medicationObj.length; i++) {
											if (
												this.medicationObj[i].medication.sig == '' ||
												this.medicationObj[i].medication.sig == null
											) {
												this.toaster.error('Sig is required', 'Error');
												return;
											}
										}
									}
								} else {
									
								}
							} else {
								this.toaster.error(response.message, 'Error');
							}
						}
						,(error)=>{
							this.loadSpin=false;
						});
					}
				}
			} else {
				this.toaster.error('No Medication Selected', 'Error');
			}
		}
	}


	checkDuplicatesAlerts(index,screenMessage)
	{
		
		
		if (this.medicationObj[index].medication.alerts.some(e => e.screenMessage === screenMessage)) {
			/* vendors contains the element we're looking for */
			return false;
		  
		}
		return true;
		  
	}

	/// to be checked in the morning
	checkCompoundDuplicatesAlerts(index,screenMessage)
	{
		
		
		if (this.medicationObj[index].medication.alerts.some(e => e.screenMessage === screenMessage)) {
			/* vendors contains the element we're looking for */
			return false;
		  
		}
		return true;
		  
	}

	getAlerts(sig?) {
	
		console.log('alert')
		{	this.tempAlerts=[];
			for(let k=0;k<this.medicationObj.length;k++)
			{
				this.tempAlerts.push(cloneDeep(this.medicationObj[k].medication.alerts));
			}
			
		}
		// PatientProfile to be added by the lahore api
		// ScreenAllergens to be fecthed by the lahore api
		let gender=''
		let Allergens=[];

			
			this.patient_info.patAllergies.forEach((value:any,index:any)=>{
				value.allergies.forEach((element:any,index:any) => {
					if(element?.status?.slug =='active') {
						let reaction=[]
						element.reactions.forEach((val2:any)=>{
							reaction.push(val2.reaction.name)
						});
						let allergy= {
							AllergenConceptType:value.allergy_type.internal_name,
							AllergenID:element.allergy.fdb_id && element.allergy.fdb_id.toString(),
							Severity:element.severity && element.severity.name?element.severity.name:"",
							Reaction:reaction.length>0?reaction.join(','):"",
						}
						Allergens.push(allergy);
					}
				});
			})

		

		let object = {
			PatientProfile: {
				BirthDate: this.patient_info.dob,
				PatientWeight: this.patient_info.weight,
				PatientWeightUnits: 'Pounds',
				Sex: this.patient_info.gender=='male'?"Male":this.patient_info.gender=='female'?"Female":"Undifferentiated",
			},
			ScreenDrugs: [],
			ScreenAllergens:Allergens
		};
		for (let i = 0; i < this.medicationObj.length; i++) {
			object.ScreenDrugs.push({
				Prospective: true,
				DrugID: this.medicationObj[i].medication.rawMed.drugId,
				DrugConceptType: this.getDrugConceptType(this.medicationObj[i].medication.rawMed.type),
			});
			if (
				this.medicationObj[i].medication.sig != '' &&
				this.medicationObj[i].medication.sig != null
			) {
				for (let j = 0; this.medicationObj && this.medicationObj[i] && this.medicationObj[i].rawSig && j<this.medicationObj[i].rawSig.length; j++) {
					
					if (this.medicationObj[i].medication.sig == this.medicationObj[i].rawSig[j].SigText) {
						object.ScreenDrugs[object.ScreenDrugs.length - 1] = {
							...object.ScreenDrugs[object.ScreenDrugs.length - 1],
							...{
								DrugDose: {
									SingleDoseAmount: this.medicationObj[i].rawSig[j].LowDoseAmount,
									SingleDoseUnit: this.medicationObj[i].rawSig[j].DoseUnitDesc,
									DosingFrequencyInterval: this.medicationObj[i].rawSig[j].FrequencyShortDesc,
								},
							},
						};

						if (
							object.ScreenDrugs[object.ScreenDrugs.length - 1].DrugDose.SingleDoseAmount == null ||
							object.ScreenDrugs[object.ScreenDrugs.length - 1].DrugDose.SingleDoseUnit == null ||
							object.ScreenDrugs[object.ScreenDrugs.length - 1].DrugDose.DosingFrequencyInterval ==
							null
						) {
							delete object.ScreenDrugs[object.ScreenDrugs.length - 1].DrugDose;
						}
						break;
					}
				}
			}
		}
		if (object.ScreenDrugs.length) {
			this.loadSpin=true;
			this._service.getAlerts('', object).subscribe((res: any) => {
				this.loadSpin=false;
				this.alertObj = res.result.data;
				
				this.alertChecks = [];
				for (let t = 0; t < this.medicationObj.length; t++) {
					this.medicationObj[t].medication.alerts = [];
					this.alertChecks.push({
						duplicatetherapy: false,
						drugdruginteraction: false,
						drugfoodinteraction: false,
						drugallergyinteraction: false,
						other: false,
					});
				}
				if(this._service.erxCheck!=2){
				//DPTScreenResponse
				for (let i = 0; i < this.alertObj.DPTScreenResponse.DPTScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								
								if(this.checkDuplicatesAlerts(m,this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenMessage)===true){
	
								
								this.medicationObj[m].medication.alerts.push({
									screenMessage: this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenMessage,
									alertType: 'duplicatetherapy',
									reason: this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
								}
								this.alertChecks[m]['duplicatetherapy'] = true;
							}
						}
					}
				}

				// Remove Duplicates 
				
				
				//DDIScreenResponse
				for (let i = 0; i < this.alertObj.DDIScreenResponse.DDIScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(m,this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenMessage)===true){
	
								this.medicationObj[m].medication.alerts.push({
									screenMessage: this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenMessage,
									alertType: 'drugdruginteraction',
									severity: this.alertObj.DDIScreenResponse.DDIScreenResults[i].Severity,
									reason: this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
							}
								this.alertChecks[m]['drugdruginteraction'] = true;
							}
						}
					}
				}
				//DFIScreenResponse
				for (let i = 0; i < this.alertObj.DFIScreenResponse.DFIScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(m,this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenMessage)===true){
								this.medicationObj[m].medication.alerts.push({
									screenMessage: this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenMessage,
									alertType: 'drugfoodinteraction',
									reason: this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
								}
								this.alertChecks[m]['drugfoodinteraction'] = true;
							}
						}
					}
				}
				//DAScreenResponse
				for (let i = 0; i < this.alertObj.DAScreenResponse.DAScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(m,this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenMessage)===true){
								this.medicationObj[m].medication.alerts.push({
									screenMessage: this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenMessage,
									alertType: 'drugallergyinteraction',
									reason: this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?this.medicationObj[m].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[m] &&  this.medicationObj[m].medication && this.medicationObj[m].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
								}
								this.alertChecks[m]['drugallergyinteraction'] = true;
							}
						}
					}
				}
				//MinMaxScreenResponse
				for (let i = 0; i < this.alertObj.MinMaxScreenResponse.MinMaxScreenResults.length; i++) {
						if (
							this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult
							.HasMessage && !this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult.Status.includes('Unable')
						) {
							if(this.checkDuplicatesAlerts(i,this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult.ScreenMessage)===true){
							this.medicationObj[i].medication.alerts.push({
								screenMessage:
									this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult
										.ScreenMessage,
								alertType: 'other',
								reason: this.medicationObj[i] &&  this.medicationObj[i].medication && this.medicationObj[i].medication.allALertCheck.check?this.medicationObj[i].medication.allALertCheck.allReason:null,
								comment:this.medicationObj[i] &&  this.medicationObj[i].medication && this.medicationObj[i].medication.allALertCheck.check?this.medicationObj[i].medication.allALertCheck.allComment: null,
								alertCheck:this.medicationObj[i] &&  this.medicationObj[i].medication && this.medicationObj[i].medication.allALertCheck.check?true:false,
								drugName:this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].ScreenDrug.DrugDesc
							});
							}
							this.alertChecks[i]['other'] = true;
						}
				}

				{
					for(let count=0;count<this.medicationObj.length;count++)
					{
						for(let k=0;this.medicationObj[count].medication && this.medicationObj[count].medication.alerts && k<this.medicationObj[count].medication.alerts.length;k++)
						{
							let alert=this.medicationObj[count].medication.alerts[k];
							
							for(let m=0;m<this.tempAlerts[count].length;m++)
							{
								
								if(this.tempAlerts[count][m].screenMessage==alert.screenMessage)
								{
									
									
									this.medicationObj[count].medication.alerts[k]=cloneDeep(this.tempAlerts[count][m]);
									this.cdr.detectChanges();
									break;
								}
							}

						}
						
					}
					
				}
			}
			if(this._service.erxCheck==2){

				
				//DPTScreenResponse
				for (let i = 0; i < this.alertObj.DPTScreenResponse.DPTScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								
								if(this.checkDuplicatesAlerts(0,this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenMessage)===true){
	
								
								this.medicationObj[0].medication.alerts.push({
									screenMessage: this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenMessage,
									alertType: 'duplicatetherapy',
									reason: this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
								}
								this.alertChecks[0]['duplicatetherapy'] = true;
							}
						}
					}
				}

				// Remove Duplicates 
				
				
				//DDIScreenResponse
				for (let i = 0; i < this.alertObj.DDIScreenResponse.DDIScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(0,this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenMessage)===true){
	
								this.medicationObj[0].medication.alerts.push({
									screenMessage: this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenMessage,
									alertType: 'drugdruginteraction',
									severity: this.alertObj.DDIScreenResponse.DDIScreenResults[i].Severity,
									reason: this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
							}
								this.alertChecks[0]['drugdruginteraction'] = true;
							}
						}
					}
				}
				//DFIScreenResponse
				for (let i = 0; i < this.alertObj.DFIScreenResponse.DFIScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(0,this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenMessage)===true){
								this.medicationObj[0].medication.alerts.push({
									screenMessage: this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenMessage,
									alertType: 'drugfoodinteraction',
									reason: this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
								}
								this.alertChecks[0]['drugfoodinteraction'] = true;
							}
						}
					}
				}
				//DAScreenResponse
				for (let i = 0; i < this.alertObj.DAScreenResponse.DAScreenResults.length; i++) {
					for (let m = 0; m < this.medicationObj.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.medicationObj[m].medication.rawMed.drugId ==
								this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(0,this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenMessage)===true){
								this.medicationObj[0].medication.alerts.push({
									screenMessage: this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenMessage,
									alertType: 'drugallergyinteraction',
									reason: this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason:null,
									comment:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment: null,
									alertCheck:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?true:false,
									drugName:this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs[sd].DrugDesc
								});
								}
								this.alertChecks[0]['drugallergyinteraction'] = true;
							}
						}
					}
				}
				//MinMaxScreenResponse
				for (let i = 0; i < this.alertObj.MinMaxScreenResponse.MinMaxScreenResults.length; i++) {
						if (
							this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult
							.HasMessage 
						) {

							if(this.checkDuplicatesAlerts(0,this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult.ScreenMessage)===true){
							this.medicationObj[0].medication.alerts.push({
								screenMessage:
									this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult
										.ScreenMessage,
								alertType: 'other',
								reason: this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason:null,
								comment:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment: null,
								alertCheck:this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.allALertCheck.check?true:false,
								drugName:this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].ScreenDrug.DrugDesc
							});
							}
							this.alertChecks[0]['other'] = true;
						}
				}

				{
					{
						for(let k=0;this.medicationObj[0].medication && this.medicationObj[0].medication.alerts && k<this.medicationObj[0].medication.alerts.length;k++)
						{
							let alert=this.medicationObj[0].medication.alerts[k];
							
							for(let m=0;m<this.tempAlerts[0].length;m++)
							{
								
								if(this.tempAlerts[0][m].screenMessage==alert.screenMessage)
								{
									
									
									this.medicationObj[0].medication.alerts[k]=cloneDeep(this.tempAlerts[0][m]);
									this.cdr.detectChanges();
									break;
								}
							}

						}
						
					}
					
				}
				
			}
			console.log('medication obj',this.medicationObj)
			
			},err=>{
				this.loadSpin=false;
			});
		}
	}
	getDrugConceptType(medType) {
		return medType === 2 ? 'DispensableDrug' : 'PackagedDrug';
	}
	getMedicine(event) {
		this.dropCheck=false;
		const userId = this.tempData.user_id;
		if (this.containSupervisor == 1 && this.canFinalize==0  && this.choosenSupervisor==false) {
			this.showSupervisorsModal(userId);
		}else {
		if (event == 0) {
			this.medicineData = '';
			this.scrollFetch = false;
		}
		// 
		// 
		if (event != 1) {
			this.offset = 1;
		} else {
			this.offset = this.offset + 1;
		}

		

		if (this.medSearchType == 'favourite') {
			if(this.favMedicineData.length==0){
			let body = {
				prescriberId: this.storageData.getUserId(),
				offset: this.offset,
				limit: 1000,
				isManual: this._service.erxCheck == 1 ? 1 : 0,
			};
			this._service.getFavMedicine(body).subscribe((response: any = []) => {
				
				
				if (response.status == 200 && this.offset == 1) {
					this.medicineData = response.result.data;
					this.favMedicineData=cloneDeep(this.medicineData);
					
				} else {
					this.medicineData = [...this.medicineData, ...response.result.data];
				}
				this.scrollFetch = false;
			});
		}
		else{
			this.medicineData=[];
			this.favMedicineData.forEach(element => {
			let tempSearch=this.searchMed.toLowerCase();
			
			if(element.rawMed && element.rawMed.drugName)
			{
				const medName=	element.rawMed.drugName.toLowerCase();
				if(medName.includes(tempSearch))
				{
				this.medicineData.push(element);
				}
			}
			})
				this.scrollFetch = false;		

		}
	}

		if (this.medSearchType != 'favourite') {
		if (this.searchMed != '') {
			
				let body = {
					searchText: this.searchMed,
					offset: 1,
					limit: 50 * this.offset,
					isManual: this._service.erxCheck == 1 ? 1 : 0,
				};
				this._service.getmedicine('', body, this.medSearchType).subscribe((response: any = []) => {
					this.total_count_check = response.result.total_count >= 50 * this.offset ? true : false;
					if(this._service.erxCheck!=2)
					{
					this.medicineData = response.result.data;
					}
					else{
						
						let drugIDs=[]
						this.medicationObj.forEach(x=>{
							drugIDs.push(x.medication.rawMed.drugId)
						})
						
						if(drugIDs.length>0)
						{
							response.result.data=response.result.data.filter(x=>
									
								!drugIDs.find(e => e ==x.RepresentativeERXPackagedDrug.PackagedDrugID)
							);
						} 
						this.medicineData = response.result.data;
					}
					this.scrollFetch = false;
				});
		
			 
		} else {
			this.medicineData = '';
		}
		}
		}
	}
	
	getReactions() {
		let body = { offset: 1, limit: 1000 };
		this._service.getreactions('', body).subscribe(
			(response: any = []) => {
				// 
			},
			(err) => {
				
			},
		);
	}
	getAllergies() {
		
		let body = { offset: 1, limit: 12000 };
		this._service.getallergies('', body).subscribe(
			(response: any = []) => {
			},
			(err) => {
				
			},
		);
	}

	favMed() {
		let body = { prescriberId: 6, offset: 1, limit: 10 };
		this._service.favmed('', body).subscribe(
			(response: any = []) => {
			},
			(err) => {
			},
		);
	}
	deleteMed(subid, medid, presid, index) {
		let body = {
			subTaskId: subid,
			medDetailId: medid,
			prescriberId: presid,
		};
		this.loadSpin=true;
		this._service.taskmeddelete('', body).subscribe(
			(response: any = []) => {
				this.loadSpin=false;
				this.medicationObj.splice(index, 1);
				// uncheck to be fixed later
				index = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[index].medication.rawMed.drugId);
				if(index==1)
				{
					this.scheduleIIdrugs[index].count-=1;
				}
				
			},
			(err) => {
				this.loadSpin=false;
				
			},
		);
	}

	labelWarning() {
		let body = {
			drugId: this.medicationObj[this.selectedIndex].medication.rawMed.drugId,
			type:
				this.medicationObj[this.selectedIndex].medication.rawMed.type == 3
					? 1
					: this.medicationObj[this.selectedIndex].medication.rawMed.type,
			offset: 1,
			limit: 10,
		};
		this._service.labelwarning('', body).subscribe(
			(response: any = []) => {
				if (response.status == 200) {
					this.labelsData = response.result.data;
				}
			},
			(err) => {
				
			},
		);
	}
	drugPricing(index) {
		let body = {
			packagedDrugId: this.medicationObj[index].medication.rawMed.drugId,
			offset: 1,
			limit: 10,
		};
		this._service.drugpricing('', body).subscribe((response: any = []) => {
			if (response.status == 200) {
				this.drugPricingData.push(response.result.data);
				// 
			}
		});
	}
	counselingMessage() {
		let body = {
			drugId: this.medicationObj[this.selectedIndex].medication.rawMed.drugId,
			type:
				this.medicationObj[this.selectedIndex].medication.rawMed.type == 3
					? 1
					: this.medicationObj[this.selectedIndex].medication.rawMed.type,
			offset: 1,
			limit: 10,
		};
		this._service.counselingmessage('', body).subscribe((response: any = []) => {
			if (response.status == 200) {
				this.advisoryData = response.result.data;
			}
		});
	}
	ChangeStartDate(e) {
		
		if(e.value)
		{

			
		this.medicationObj[this.selectedIndex].medication.effectiveDate = new Date(e.value);
		}
		else{
			this.medicationObj[this.selectedIndex].medication.effectiveDate=null;
		}
		
	}
	checkStartDatekey() {
		
	}
	resetFilters() {
		this.searchByName = '';
		this.searchByChart = '';
		this.searchByCase = '';
	}

	checkPatientFilterDisability()
	{
		if(this.searchByName =='' && this.searchByChart == '' && this.searchByCase == '')
		{
			return true;
		}
		return false;
	}

	taskDetail() {
		this.selectedfromHome=true;
		let body = { taskId: this.taskid };
		this.loadSpin=true;
		this._service.taskdetail('', body).subscribe(
			(response: any = []) => {
				this.loadSpin=false;
				this.taskdetail = response.result.data;

				this.patient_info = response.result.data.patient;
				this.patient_info['name']= this.patient_info.middleName
				? this.patient_info.firstName + ' ' + this.patient_info.middleName + ' ' + this.patient_info.lastName
				: this.patient_info.firstName + ' ' + this.patient_info.lastName,
				this.patient_check = true;
				this.tempData = JSON.parse(localStorage.getItem('cm_data'));
				const userId = this.tempData.user_id;
				
				this.containSupervisor = this.tempData.role.has_supervisor;
				this.canFinalize=this.tempData.role.can_finalize;
				if(this.taskdetail.task.numType==1 ||this.taskdetail.task.numType==2)
				{
    			this.taskdetail.prescriber.addressLine1=this.taskdetail.prescriber.address && this.taskdetail.prescriber.address.address;
    			this.taskdetail.prescriber.addressLine2=this.taskdetail.prescriber.address && this.taskdetail.prescriber.address.floor;
    			this.taskdetail.prescriber.city=this.taskdetail.prescriber.address && this.taskdetail.prescriber.address.city;
    			this.taskdetail.prescriber.stateProvince= this.taskdetail.prescriber.address && this.taskdetail.prescriber.address.state_object && this.taskdetail.prescriber.address.state_object.code;
    			this.taskdetail.prescriber.countryCode="US";
    			this.taskdetail.prescriber.postalCode=this.taskdetail.prescriber.address && this.taskdetail.prescriber.address.zip;
				this.prescriber_info = this.taskdetail.prescriber;
				}
				else{
				
				if (this.containSupervisor == 1 && this.canFinalize==0) {
					this.choosenSupervisor=true;
					this.prescriber_info=this.taskdetail.prescriber;
					
					
				}
				else{
				this.prescriber_info = this.tempData.basic_info;
				this.prescriber_info['id'] = userId;
				}
				this.isMediIdentider = this.tempData.role.medical_identifier;
				this.containSupervisor = this.tempData.role.has_supervisor;
				const facLocId = this.tempData.current_location_ids;
				this.canFinalize=this.tempData.role.can_finalize;
				this.getMedicalIdentifierData(1);
				}
				let data=response.result;
				if(response.result.data.task.status!="Incomplete" && response.result.data.task.type!="Rx Refill"){

					this.initMedObj(data,0);
				}
				if (response.result.data.task.numType == 1 && response.result.data.medicationRequested[0]) {
					this.oldMed = response.result.data.medicationRequested.length - 1;
					this.compRxChange=true;
					this.initMedObjRxChange(response.result,0);
					
				}
				
				if (response.result.data.task.numType == 2 && response.result.data.medicationRequested[0]) {
					
					delete response.result.data.medicationRequested[0].rxfillStatus;
					delete response.result.data.medicationRequested[0].rxfillNote;
					this.initMedObjRefill(response.result)
					
					this.showDetailMedicine(0);
				}
				for (let i = 0; i < this.medicationObj.length; i++) {
					if (!this.medicationObj[i].rawSig || this.medicationObj[i].rawSig == '') {
						this._service
							.getSig('', {
								prescribableDrugId: this.medicationObj[i].medication.rawMed.rawData
									.DispensableDrugID
									? this.medicationObj[i].medication.rawMed.rawData.DispensableDrugID
									: this.medicationObj[i].medication.rawMed.rawData.PrescribableDrugID
										? this.medicationObj[i].medication.rawMed.rawData.PrescribableDrugID
										: this.medicationObj[i].medication.rawMed.rawData.rawMed.rawData
											.PrescribableDrugID,
								offset: 1,
								limit: 1000,
							})
							.subscribe((res: any) => {
								this.medicationObj[i]['rawSig'] = res.result.data;
							});
					}
					if (this.medicationObj[i].medication.refill == null) {
						this.refillChange = -1;
					}
				}

			},
			(err) => {
				this.loadSpin=false;
				
			},
		);
	}
	
	applyMultipleCompound(index)
	{
		this.compSelectedIndex=index;
		this.medicationObj=[];
		this.medicationObj=this.multipleCompund[index];
			for(let j=0;j<this.medicationObj.length;j++)
			{
				this.drugPricing(j); 
			}
			
			this.showDetailMedicine(0);

	}
	initMedObjRxChange(response, index){
		this.medicationObj=[];
		if(response.data && response.data.medicationRequested && response.data.medicationRequested[0] &&  response.data.medicationRequested[0].compoundMedication && response.data.medicationRequested[0].compoundMedication.length>0)
		{
			this._service.erxCheck=2;
			this.isCompound=true;
			for (let index = 0; index < response.data.medicationRequested.length; index++) {
			
				let medicationObj=[];
				for(let k=0;k<response.data.medicationRequested[index].compoundMedication.length;k++){
				
					medicationObj.push({
						medication: {
							icd10Codes: response.data.medicationRequested[index].icd10Codes? response.data.medicationRequested[index].icd10Codes:{ codes: [] }, 
							rawMed:response.data.medicationRequested[index].compoundMedication[k].rawMed,
							sig: response.data.medicationRequested[index].sig,
							scriptDate: response.data.medicationRequested[index].scriptDate, //has to be of current date
							effectiveDate: response.data.medicationRequested[index].effectiveDate ,//can be of future
							quantity:response.data.medicationRequested[index].compoundMedication[k].quantity,
							compoundQuantity: response.data.medicationRequested[index].quantity, // In case of compound Medicine
							refill:response.data.medicationRequested[index].refill,
							substitute:response.data.medicationRequested[index].substitute,
							daysSupply: response.data.medicationRequested[index].daysSupply,
							medDetailId:response.data.medicationRequested[index].medDetailId,
							medId:response.data.medicationRequested[index].compoundMedication[k].id,
							internalComments: response.data.medicationRequested[index].internalComments,
							pharmacyNotes: response.data.medicationRequested[index].pharmacyNotes,
							description: response.data.medicationRequested[index].description,
							strengthFormId:response.data.medicationRequested[index].strengthFormId,
							strengthFormCode: response.data.medicationRequested[index].strengthFormCode,
							quantityUnitOfMeasureCode: response.data.medicationRequested[index].quantityUnitOfMeasureCode ? response.data.medicationRequested[0].quantityUnitOfMeasureCode:null,
							quantityUnitOfMeasureName:response.data.medicationRequested[index].quantityUnitOfMeasureName,
							quantityUnitOfMeasureId:response.data.medicationRequested[index].quantityUnitOfMeasureId,
							strengthFormName: response.data.medicationRequested[index].strengthFormName,
							alerts: response.data.medicationRequested[index].alerts,
							
						},
						// pharmacy: response.data.draftOrder[0].pharmacy,
						favourite: 0,
						rawSig: "", // to be settled
					});
					let mindex=medicationObj.length-1;
					if(this.checkCIISchedule(mindex)){
						this.checkDaySupply(medicationObj[mindex].medication.rawMed.drugId);
					}
						this.getStrengthForm();
				}
				this.multipleCompund.push(medicationObj);
			}
			this.initCompLenght=this.multipleCompund.length;
			this.medicationObj=this.multipleCompund[0];
			this.compSelectedIndex=0;
			this.oldMedString = JSON.stringify(this.multipleCompund);
			for(let j=0;j<this.medicationObj.length;j++)
			{
				this.drugPricing(j); 
			}			
			this.showDetailMedicine(0);
		}
		else
		{
			for (let i = 0; i < response.data.medicationRequested.length; i++) {
				delete response.data.medicationRequested[i].rxfillStatus;
				delete response.data.medicationRequested[i].rxfillNote;
				this.medicationObj.push({ medication: response.data.medicationRequested[i] });
			}
			this.oldMedString = JSON.stringify(this.medicationObj);
			this.showDetailMedicine(0);
		}
		
	}


	initMedObjRefill(response){
		if(response.data && response.data.medicationRequested && response.data.medicationRequested[0] &&  response.data.medicationRequested[0].compoundMedication && response.data.medicationRequested[0].compoundMedication.length>0)
		{
			this._service.erxCheck=2;
			this.isCompound=true;
			for(let k=0;k<response.data.medicationRequested[0].compoundMedication.length;k++){
				
				this.medicationObj.push({
						medication: {
							icd10Codes: response.data.medicationRequested[0].icd10Codes? response.data.medicationRequested[0].icd10Codes:{ codes: [] }, 
							rawMed:response.data.medicationRequested[0].compoundMedication[k].rawMed,
							sig: response.data.medicationRequested[0].sig,
							scriptDate: response.data.medicationRequested[0].scriptDate, //has to be of current date
							effectiveDate: response.data.medicationRequested[0].effectiveDate ,//can be of future
							quantity:response.data.medicationRequested[0].compoundMedication[k].quantity,
							compoundQuantity: response.data.medicationRequested[0].quantity, // In case of compound Medicine
							refill:response.data.medicationRequested[0].refill,
							substitute:response.data.medicationRequested[0].substitute,
							daysSupply: response.data.medicationRequested[0].daysSupply,
							medDetailId:response.data.medicationRequested[0].medDetailId,
							medId:response.data.medicationRequested[0].compoundMedication[k].id,
							internalComments: response.data.medicationRequested[0].internalComments,
							pharmacyNotes: response.data.medicationRequested[0].pharmacyNotes,
							description: response.data.medicationRequested[0].description,
							strengthFormId:response.data.medicationRequested[0].strengthFormId,
							strengthFormCode: response.data.medicationRequested[0].strengthFormCode,
							quantityUnitOfMeasureCode: response.data.medicationRequested[0].quantityUnitOfMeasureCode ? response.data.medicationRequested[0].quantityUnitOfMeasureCode:null,
							quantityUnitOfMeasureName:response.data.medicationRequested[0].quantityUnitOfMeasureName,
							quantityUnitOfMeasureId:response.data.medicationRequested[0].quantityUnitOfMeasureId,
							strengthFormName: response.data.medicationRequested[0].strengthFormName,
							alerts: response.data.medicationRequested[0].alerts,
							allALertCheck:response.data.medicationRequested[0].allALertCheck,
							
						},
						favourite: 0,
						rawSig: "", // to be settled
					});
					let mindex=this.medicationObj.length-1;
					if(this.checkCIISchedule(mindex)){
						this.checkDaySupply(this.medicationObj[mindex].medication.rawMed.drugId);
						
	
					}
						this.getStrengthForm();
					this.drugPricing(k); 
			}
		}
		else
		{
			let medClone=cloneDeep(response.data.medicationRequested[0]);
			this.medicationObj.push({ medication: medClone });
		}
		
	}

displayAlerts()
{
	this.alertChecks = [];
	for (let t = 0; t < this.medicationObj.length; t++) {
		this.medicationObj[t].medication.alerts = [];
		this.alertChecks.push({
			duplicatetherapy: false,
			drugdruginteraction: false,
			drugfoodinteraction: false,
			drugallergyinteraction: false,
			other: false,
		});
	}
}

	initMedObj(response,check){
		
		if(response.data.draftOrder && response.data.draftOrder[0].medication &&  response.data.draftOrder[0].medication.compoundMedication && response.data.draftOrder[0].medication.compoundMedication.length>0)
		{
			if(check!=1)
			{
			this._service.erxCheck=2;
			}
			this.isCompound=true;
			this.alertChecks = [];
			this.alertChecks.push({
				duplicatetherapy: false,
				drugdruginteraction: false,
				drugfoodinteraction: false,
				drugallergyinteraction: false,
				other: false,
			});
			// 
			for(let m=0;m<response.data.draftOrder[0].medication.alerts.length;m++)
			{
						this.alertChecks[0][response.data.draftOrder[0].medication.alerts[m].alertType]=true;
					}
			for(let k=0;k<response.data.draftOrder[0].medication.compoundMedication.length;k++){
				this.medicationObj.push({
						medication: {
							icd10Codes: response.data.draftOrder[0].medication.icd10Codes? response.data.draftOrder[0].medication.icd10Codes:{ codes: [] }, 
							rawMed:response.data.draftOrder[0].medication.compoundMedication[k].rawMed,
							sig: response.data.draftOrder[0].medication.sig,
							scriptDate: response.data.draftOrder[0].medication.scriptDate, //has to be of current date
							effectiveDate: response.data.draftOrder[0].medication.effectiveDate,
							quantity:response.data.draftOrder[0].medication.compoundMedication[k].quantity,
							compoundQuantity: response.data.draftOrder[0].medication.quantity, // In case of compound Medicine
							refill:response.data.draftOrder[0].medication.refill,
							substitute:response.data.draftOrder[0].medication.substitute,
							daysSupply: response.data.draftOrder[0].medication.daysSupply,
							medDetailId:response.data.draftOrder[0].medication.medDetailId,
							medId:response.data.draftOrder[0].medication.compoundMedication[k].id,
							internalComments: response.data.draftOrder[0].medication.internalComments,
							pharmacyNotes: response.data.draftOrder[0].medication.pharmacyNotes,
							description: response.data.draftOrder[0].medication.description,
							strengthFormId:response.data.draftOrder[0].medication.strengthFormId,
							strengthFormCode: response.data.draftOrder[0].medication.strengthFormCode,
							quantityUnitOfMeasureCode: response.data.draftOrder[0].medication.quantityUnitOfMeasureCode ? response.data.draftOrder[0].medication.quantityUnitOfMeasureCode:null,
							quantityUnitOfMeasureName:response.data.draftOrder[0].medication.quantityUnitOfMeasureName,
							quantityUnitOfMeasureId:response.data.draftOrder[0].medication.quantityUnitOfMeasureId,
							strengthFormName: response.data.draftOrder[0].medication.strengthFormName,
							alerts: response.data.draftOrder[0].medication.alerts,
							allALertCheck:response.data.draftOrder[0].medication.allALertCheck
						},
						pharmacy: response.data.draftOrder[0].pharmacy,
						subTaskId:response.data.draftOrder[0].subTaskId,
						favourite: 0,
						rawSig: "", // to be settled
					});
					let mindex=this.medicationObj.length-1;
					if(this.checkCIISchedule(mindex)){
						this.checkDaySupply(this.medicationObj[mindex].medication.rawMed.drugId);
					}
						this.getStrengthForm();
					
			}
		}
		else
		{
			this.alertChecks = [];
			if(check!=1){
			this._service.erxCheck=0;
			}
			if (response.data.draftOrder && response.data.draftOrder.length != 0) {

				

				for (let i = 0; i < response.data.draftOrder.length; i++) {


					this.alertChecks.push({
						duplicatetherapy: false,
						drugdruginteraction: false,
						drugfoodinteraction: false,
						drugallergyinteraction: false,
						other: false,
					});
					
					for(let m=0;m<response.data.draftOrder[i].medication.alerts.length;m++)
					{
						this.alertChecks[i][response.data.draftOrder[i].medication.alerts[m].alertType]=true;
					}
					if(!response.data.draftOrder[i].medication.lastFillDate){
						delete response.data.draftOrder[i].medication.lastFillDate;
					}
					if(response.data.draftOrder[i].medication.effectiveDate){
						response.data.draftOrder[i].medication.effectiveDate=new Date(response.data.draftOrder[i].medication.effectiveDate);
					}else{
						response.data.draftOrder[i].medication.effectiveDate=new Date();
					}
					if(!response.data.draftOrder[i].medication.icd10Codes){
						response.data.draftOrder[i].medication.icd10Codes= { codes: [] }
					}
					delete response.data.draftOrder[i].medication.rxfillStatus;
					delete response.data.draftOrder[i].medication.rxfillNote;
					if(response.data.draftOrder[i].pharmacy){
						this._service.erxCheck=0;
					}
					else{
						this._service.erxCheck=1;
					}
					
                    this.medicationObj.push(response.data.draftOrder[i]);
					let mindex=this.medicationObj.length-1;
					if(this.checkCIISchedule(mindex)){
						let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[mindex].medication.rawMed.drugId);
						if(rindex==-1){
							this.checkDaySupply(this.medicationObj[mindex].medication.rawMed.drugId);
						}
						else if(rindex!=-1)
						{
							this.scheduleIIdrugs[rindex].count+=1;
						}
						
					}
				}
					
			}
		}
		
		this.showDetailMedicine(0);
	}


	getSig(PrescribableDrugID) {
		this._service
			.getSig('', { prescribableDrugId: PrescribableDrugID, offset: 1, limit: 1000 })
			.subscribe((res: any) => {
				return res.result.data;
			});
	}
	changeCollapse() {
		if (!this.alertsCollapse) {
			this.alertsCollapse = true;
		}
		else if (this.alertsCollapse) {
			this.alertsCollapse = false;
		}
	}
	changeLabelCollapse() {
		if (!this.labelAlertsCollapse) {
			this.labelAlertsCollapse = true;
		}
		else if (this.labelAlertsCollapse) {
			this.labelAlertsCollapse = false;
		}
	}
	changeAdvisoryCollapse() {
		if (!this.advisoryCollapse) {
			this.advisoryCollapse = true;
		}
		else if (this.advisoryCollapse) {
			this.advisoryCollapse = false;
		}
	}
	changeDrugFoodCollapse() {
		if (!this.drugFoodCollapse) {
			this.drugFoodCollapse = true;
		}
		else if (this.drugFoodCollapse) {
			this.drugFoodCollapse = false;
		}
	}
	changeDrugDrugCollapse() {
		if (!this.drugDrugCollapse) {
			this.drugDrugCollapse = true;
		}
		else if (this.drugDrugCollapse) {
			this.drugDrugCollapse = false;
		}
	}
	changeDrugAllergyCollapse() {
		if (!this.drugAllergyCollapse) {
			this.drugAllergyCollapse = true;
		}
		else if (this.drugAllergyCollapse) {
			this.drugAllergyCollapse = false;
		}
	}
	changeDuplicateTherapyCollapse() {
		if (!this.duplicateTherapyCollapse) {
			this.duplicateTherapyCollapse = true;
		}
		else if (this.duplicateTherapyCollapse) {
			this.duplicateTherapyCollapse = false;
		}
	}
	changeOtherCollapse() {
		if (!this.otherCollapse) {
			this.otherCollapse = true;
		}
		else if (this.otherCollapse) {
			this.otherCollapse = false;
		}
	}
	alertsAction() {
		if (this.rightSection === false) {
			this.rightSection = true;
		}
		if (this.alertsCollapse) {
			this.alertsCollapse = false;
		}
	}
	/** extand/collapse left/right options */
	arrowLeftRight(direction) {
		if (direction === 'left') {
			if (this.leftSection === true) {
				this.leftSection = false;
				this.hideLeftSection = true;
			} else {
				this.leftSection = true;
				this.hideLeftSection = false;
			}
		} else if (direction === 'right') {
			if (this.rightSection === true) {
				this.rightSection = false;
			} else {
				this.rightSection = true;
			}
		}
	}
	viewSummary(action, actionObj) {
		
		// return;
		let draftOrder: any = cloneDeep(this.medicationObj);
		for (let i = 0; i < draftOrder.length; i++) {
			delete draftOrder[i].rawSig;
			if (
				!draftOrder[i].medication.icd10Codes.id &&
				draftOrder[i].medication.icd10Codes.codes.length == 0
			) {
				delete draftOrder[i].medication.icd10Codes;
			}
		}
		
		// return;
		let body = {

			taskId: this.taskid ? this.taskid : null,
			draftOrder: this._service.erxCheck!=2?[draftOrder[this.selectedIndex]]:actionObj.draftOrder,
			patient: {
				id: this.patient_info.id,
				ssn: this.patient_info.ssn,
				firstName: this.patient_info.firstName,
				weight: this.patient_info.weight,
				middleName: this.patient_info.middleName,
				height: this.patient_info.height,
				height_ft:this.patient_info.height_ft,
				height_in:this.patient_info.height_in,
				lastName: this.patient_info.lastName,
				dob: this.patient_info.dob,
				gender: this.mapGenderStringToChar(this.patient_info.gender),
				addressLine1: this.patient_info.addressLine1,
				addressLine2: this.patient_info.addressLine2,
				city: this.patient_info.city,
				stateProvince: this.patient_info.stateProvince,
				postalCode: this.patient_info.postalCode,
				countryCode: this.patient_info.countryCode,
				primaryPhone: this.patient_info.primaryPhone,
			},
			prescriber: {
				id: parseInt(this.prescriber_info['id']),
				stateLicenseNumber: this.prescriber_info['stateLicenseNumber'],
				npi: this.prescriber_info['npi'],
				dean: this.prescriber_info['dean'],
				nadean: this.prescriber_info['nadean'],
				spi: this.prescriber_info['spi'],
				firstName: this.prescriber_info['first_name']?this.prescriber_info['first_name']:actionObj.prescriber['firstName'],
				lastName: this.prescriber_info['last_name']?this.prescriber_info['last_name']:actionObj.prescriber['lastName'],
				middleName:this.prescriber_info['middle_name']?this.prescriber_info['middle_name']:actionObj.prescriber['middleName'],
				addressLine1: this.prescriber_info['address'],
				city: this.prescriber_info['city'],
				stateProvince: this.prescriber_info['state'],
				postalCode: this.prescriber_info['zip']?this.prescriber_info['zip'].replace('-', ''):this.prescriber_info['postalCode'],
				countryCode: this.patient_info.countryCode,
				primaryPhone:this.prescriber_info.cell_no? {
					number: this.prescriber_info.cell_no,
				}:actionObj.prescriber['primaryPhone'],
			},
			pharmacy: this.taskdetail.pharmacy,
			task: this.taskdetail.task,
			case: {
				id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail.case.id? this.taskdetail.case.id:null,
			},
			visit: {
				id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId:this.taskdetail.visit.id?this.taskdetail.visit.id:null,
			},
			facility_location_id:this.taskdetail.task.facility_location_id,
			medicationDispensed: this.taskdetail.medicationDispensed,
			medicationPrescribed: this.taskdetail.medicationPrescribed,
			medicationRequested: this.taskdetail.medicationRequested,
			previousMedicationPrescribed: this.taskdetail.previousMedicationPrescribed,
		};

		if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
			&& this.tempData.role.medical_identifier==1)
			{
				body['supervisor']=this.taskdetail.supervisor;
			}
		this._service.data = body;
		this._service.action = action;
		this._service.actionObj = actionObj;
		this.orderRx();
	}
	approve() {
		

		this._service.denyChange=false; // ready to sign disable for deny incomplete status
		// adding validations

		if (this._service.erxCheck == 2 && this.medicationObj.length < 2) {
			this.toaster.error("Please select a least 2 medicine for a compound Medication !", "Error")
			return;
		}

		if ((this.medicationObj[this.selectedIndex].medication.quantity == '' || this.medicationObj[this.selectedIndex].medication.quantity == null)) {
			if (this.errDisplay == true) {
				this.toaster.error(
					`Add dispense for the ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} medicine`,
					'Error',
				);
			}
			return;
		}
		
		if ((this.medicationObj[this.selectedIndex].medication.quantity == 0)) {
				this.toaster.error(
					`Dispense should be greater than 0 for ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} medicine`,
					'Error',
				);
			return;
		}
		
		
		let rxChange: any = null;
		if(this._service.erxCheck!=2){
			if (this.taskdetail.task.numType == 1 && this.oldMed >= this.selectedIndex) {
			let tempStr = cloneDeep(this.medicationObj.slice(this.selectedIndex, this.selectedIndex + 1));
			let tempStr2 = cloneDeep(JSON.parse(this.oldMedString).slice(
				this.selectedIndex,
				this.selectedIndex + 1,
			));
			for (let i = 0; i < tempStr.length; i++){
				delete tempStr[i].rawSig;
				if(tempStr[i].favourite==0){
					delete tempStr[i].favourite;
				}
				tempStr[i].medication.scriptDate=new Date();
				tempStr2[i].medication.scriptDate=new Date();
				tempStr[i].medication.scriptDate=null;
				tempStr2[i].medication.scriptDate=null;
				
				if(tempStr[i].medication.scriptDate)
				{
					tempStr[i].medication.scriptDate=null;
				}
				if(tempStr[i].medication.alerts)
				{
					tempStr[i].medication.alerts=[];
				}
			}
			
			
			
			if(!isEqual(tempStr,tempStr2))
			{
				rxChange = true;
			}
			}
		}
		else if(this._service.erxCheck==2)
		{
			if (this.taskdetail.task.numType == 1 && this.oldMed >= this.compSelectedIndex) {
				let tempStr = cloneDeep(this.multipleCompund.slice(this.compSelectedIndex, this.compSelectedIndex + 1));
				let tempStr2 = cloneDeep(JSON.parse(this.oldMedString).slice(
					this.compSelectedIndex,
					this.compSelectedIndex + 1,
				));
				for (let i = 0; i < tempStr[0].length; i++){
					
					tempStr[0][i].rawSig='';
				}
				tempStr = JSON.stringify(tempStr);
				tempStr2 = JSON.stringify(tempStr2);
				
				
				
				if(tempStr!=tempStr2)
					
						rxChange = true;
					
				}

		}
		this.medicationObj[0].medication.scriptDate = new Date().toISOString();
		this.medicationObj[this.selectedIndex].medication.scriptDate = new Date().toISOString();
		delete this.taskdetail.patient.name;
		let body;
		if(this._service.erxCheck!=2){
			body = {
				taskId: this.taskdetail.task.id,
				prevTaskId: this.taskdetail.task.prevTaskId,
				orderId: this.taskdetail.task.orderId,
				medication: this.medicationObj[this.selectedIndex].medication,
				facility_location_id:this.taskdetail.task.facility_location_id,
				pharmacy: this.taskdetail.pharmacy,
				pharmacyErx: this.taskdetail.pharmacyErx,
				patient: this.taskdetail.patient,
				prescriber: this.taskdetail.prescriber,
				case: {
					id:  this._router.url.includes('template-manager')?this.taskdetail.case.id? this.taskdetail.case.id:this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:null,
				},
				visit: {
					id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId:this.taskdetail.visit.id?this.taskdetail.visit.id:null,
				},
			};
			if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
				&& this.tempData.role.medical_identifier==1)
				
				{
				if(this.taskdetail.supervisor.address){
					this.taskdetail.supervisor.addressLine1=this.taskdetail.supervisor.address.address;
					this.taskdetail.supervisor.addressLine2=this.taskdetail.supervisor.address.floor;
					this.taskdetail.supervisor.city=this.taskdetail.supervisor.address.city;
					this.taskdetail.supervisor.stateProvince=this.taskdetail.supervisor.address.state_object.code;
					this.taskdetail.supervisor.countryCode="US";	
					this.taskdetail.supervisor.postalCode=this.taskdetail.supervisor.address.zip;
					delete this.taskdetail.supervisor.address;
				}
				body['supervisor']=this.taskdetail.supervisor;
				}
		}
		else if(this._service.erxCheck==2)
		{
			let compMed = [];
			let compAlerts =this.medicationObj[0].medication.alerts;
			for (let k = 0; k < this.medicationObj.length; k++) {
				compMed.push({
					quantity: this.medicationObj[k].medication.quantity,
					rawMed: this.medicationObj[k].medication.rawMed,
					id:this.medicationObj[k].medication.medId
				})
			}
			// checks for deleting empty id in case of compound Medication
			for (let k = 0; k < compMed.length; k++) {
				if(!compMed[k].id){
					delete compMed[k].id
				}
			}


			for (let m = 1; m < this.medicationObj.length; m++) {
				compAlerts.concat(this.medicationObj[m].medication.alerts);
			}
			let compDraftOrder = [];
			compDraftOrder.push({
				medication: {
					compoundMedication: compMed,
					quantityUnitOfMeasureCode: this.medicationObj[0].medication.quantityUnitOfMeasureCode,
					quantityUnitOfMeasureName: this.medicationObj[0].medication.quantityUnitOfMeasureName,
					quantityUnitOfMeasureId:this.medicationObj[0].medication.quantityUnitOfMeasureId,
					description: this.medicationObj[0].medication.description,
					strengthFormId:this.medicationObj[0].medication.strengthFormId,
					strengthFormCode: this.medicationObj[0].medication.strengthFormCode,
					strengthFormName: this.medicationObj[0].medication.strengthFormName,
					sig: this.medicationObj[0].medication.sig,
					scriptDate: this.medicationObj[0].medication.scriptDate,
					effectiveDate: this.medicationObj[0].medication.effectiveDate,
					quantity: this.medicationObj[0].medication.compoundQuantity,
					refill: this.medicationObj[0].medication.refill,
					medDetailId:this.medicationObj[0].medication.medDetailId?this.medicationObj[0].medication.medDetailId:null,
					substitute: this.medicationObj[0].medication.substitute,
					daysSupply: this.medicationObj[0].medication.daysSupply,
					internalComments: this.medicationObj[0].medication.internalComments,
					pharmacyNotes: this.medicationObj[0].medication.pharmacyNotes,
					icd10Codes: this.medicationObj[0].medication['icd10Codes'],
					alerts: compAlerts,
					allALertCheck:this.medicationObj[0].medication.allALertCheck
				},
				favourite:0,
			})

			for(let i=0;i<compDraftOrder.length;i++){
				if(!compDraftOrder[i].subTaskId)
				{
					delete compDraftOrder[i].subTaskId;

				}
				if(!compDraftOrder[i].medication.medDetailId)
				{
					delete compDraftOrder[i].medication.medDetailId;
				}

			}
			body = {
				taskId: this.taskdetail.task.id,
				prevTaskId: this.taskdetail.task.prevTaskId,
				orderId: this.taskdetail.task.orderId,
				isCompoundMed: true,
				facility_location_id:this.taskdetail.task.facility_location_id,
				draftOrder: compDraftOrder,
				medication: compDraftOrder,
				pharmacy: this.taskdetail.pharmacy,
				pharmacyErx: this.taskdetail.pharmacyErx,
				patient: this.taskdetail.patient,
				prescriber: this.taskdetail.prescriber,
				case: {
					id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail.case.id? this.taskdetail.case.id:null,
				},
				visit: {
					id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId:this.taskdetail.visit.id ?this.taskdetail.visit.id :null ,
				},
			};
			if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
				&& this.tempData.role.medical_identifier==1)
				
				{
				if(this.taskdetail.supervisor.address){
					this.taskdetail.supervisor.addressLine1=this.taskdetail.supervisor.address.address;
					this.taskdetail.supervisor.addressLine2=this.taskdetail.supervisor.address.floor;
					this.taskdetail.supervisor.city=this.taskdetail.supervisor.address.city;
					this.taskdetail.supervisor.stateProvince=this.taskdetail.supervisor.address.state_object.code;
					this.taskdetail.supervisor.countryCode="US";	
					this.taskdetail.supervisor.postalCode=this.taskdetail.supervisor.address.zip;
					delete this.taskdetail.supervisor.address;
				}
				body['supervisor']=this.taskdetail.supervisor;
				}
		}

			// pharma check 

			let pharmaCheck = true;
			if (this._service.erxCheck != 2) {
					
						
						if(this.checkCIISchedule(this.selectedIndex)){
							let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[this.selectedIndex].medication.rawMed.drugId);
							if(rindex!=-1 && this.scheduleIIdrugs[rindex].count>1){
								if (this.medicationObj[this.selectedIndex].medication.effectiveDate == null || this.medicationObj[this.selectedIndex].medication.effectiveDate == "") {
											
											this.toaster.error(
												`Start Date is ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} Required`,
												'Error',
											);
									
									pharmaCheck = false;
								}
							}
							if (this.medicationObj[this.selectedIndex].medication.daysSupply == null || this.medicationObj[this.selectedIndex].medication.daysSupply == 0) {
									
									this.toaster.error(
										`Days Supply for ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} is Required`,
										'Error',
									);
							
							pharmaCheck = false;
						}
						}
						if(this.medicationObj[this.selectedIndex].medication.effectiveDate!=null)
						{
							let date1=new Date(this.medicationObj[this.selectedIndex].medication.effectiveDate).setHours(0,0,0,0);
							let date2=new Date(this.minDate).setHours(0, 0, 0, 0);

							if(date1<date2)
							{
								
							}
							if(date1==date2)
							{
								
							}
							if(date1>date2)
							{
								
							}
							 	if(date1<date2)
								{
								this.toaster.error(
									`Start date should be greater or equal to current date `,'Error',
								);
							pharmaCheck = false;
							
							}
						}

						if(this.medicationObj[this.selectedIndex].medication.effectiveDate!=null && this.medicationObj[this.selectedIndex].medication.effectiveDate>this.getMaxStartDate())
							{
							this.toaster.error(
							`Earliest fill date for ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} should be less than 6 months`, 'Error'
							);
							pharmaCheck = false;
							
						}
					if (this.medicationObj[this.selectedIndex].medication.sig == '' || this.medicationObj[this.selectedIndex].medication.sig == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a sig for the ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} medicine`,
								'Error',
							);
						}
						pharmaCheck = false;
						// break;
					}
					
					if (this.medicationObj[this.selectedIndex].medication.rawMed.rawData['DefaultETCID'] == "5619" && (this.medicationObj[this.selectedIndex].medication.pharmacyNotes == '' || this.medicationObj[this.selectedIndex].medication.pharmacyNotes == null)) {
						if (this.errDisplay == true) {
							this.toaster.error(`Please provide medical reason!  for the ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} medicine `, "Error")
						}
						pharmaCheck = false;
						// break;
					}

					if (
						this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
						''
					) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Add dispense unit for the ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} medicine`,
								'Error',
							);
						}
						pharmaCheck = false;
						// break;
					}
					if (this.medicationObj[this.selectedIndex].medication.refill == null || (this.medicationObj[this.selectedIndex].medication.refill==0 && this.taskdetail.task.numType == 2)) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Refill can't be empty.Please enter refill for the ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} medicine`,
							);
						}
						return;
					}
				// }
			}
			else if (this._service.erxCheck == 2) {
			if(this.checkCIICompSchedule()){
					if (this.medicationObj[0].medication.effectiveDate == null || this.medicationObj[0].medication.effectiveDate == "") {
									
									this.toaster.error(
										`Start Date For Compound Medicine is Required`,
										'Error',
									);
							
							pharmaCheck = false;
						
					}
					if (this.medicationObj[0].medication.daysSupply == null || this.medicationObj[0].medication.daysSupply == 0) {
							
							this.toaster.error(
								`Days Supply For Compound Medicine is Required`,
								'Error',
							);
					
					pharmaCheck = false;
				}
				}

				if(this.medicationObj[0].medication.effectiveDate!=null)
						{
							let date1=new Date(this.medicationObj[0].medication.effectiveDate).setHours(0,0,0,0);
							let date2=new Date(this.minDate).setHours(0, 0, 0, 0);

							if(date1<date2)
							{
								
							}
							if(date1==date2)
							{
								
							}
							if(date1>date2)
							{
								
							}
							 	if(date1<date2)
								{
								this.toaster.error(
									`Start date should be greater or equal to current date `,'Error',
								);
							pharmaCheck = false;
							
							}
						}

						if(this.medicationObj[0].medication.effectiveDate!=null && this.medicationObj[0].medication.effectiveDate>this.getMaxStartDate())
							{
							this.toaster.error(
							`Earliest fill date for ${this.medicationObj[0].medication.rawMed.drugName} should be less than 6 months`, 'Error'
							);
							pharmaCheck = false;
							
						}

				if (this.medicationObj[0].medication.sig == '' || this.medicationObj[0].medication.sig == null) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Select a sig for the compound medicine`,
							'Error',
						);
					}
					pharmaCheck = false;

				}
				if (this.medicationObj[0].medication.description == '' || this.medicationObj[0].medication.description == null) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Enter a name for the compound medicine`,
							'Error',
						);
					}
					pharmaCheck = false;

				}
				if (this.medicationObj[0].medication.strengthFormId == '' || this.medicationObj[0].medication.strengthFormId == null) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Select a strenght form for the compound medicine`,
							'Error',
						);
							return;
					}
					pharmaCheck = false;

				}
				if (this.medicationObj[0].medication.quantityUnitOfMeasureCode == '' || this.medicationObj[0].medication.quantityUnitOfMeasureCode == null) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Select a dispense unit for the compound medicine`,
							'Error',
						);
					}
					pharmaCheck = false;
					return;

				}
				

				if (
					this.medicationObj[0].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
					''
				) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Add dispense unit for the compound medicine`,
							'Error',
						);
					}
					pharmaCheck = false;
					return;

				}
				if (this.medicationObj[0].medication.refill == null || (this.medicationObj[0].medication.refill == 0 && this.taskdetail.task.numType == 2)) {
					if (this.errDisplay == true) {
						this.toaster.error(
							`Refill can't be empty.Please enter refill for the compound medicine`,
						);
					}
					return;
				}


			}

			if (!pharmaCheck) {
				return;
			}
			else{

				//View Summary Functionality
		if (this.refillChange == true && this.taskdetail.task.numType != 1) {
			this.viewSummary('approveChange', body);
		} else if (this.refillChange != true && this.taskdetail.task.numType != 1) {
			this.viewSummary('approve', body);
		} 
		if(this._service.erxCheck!=2){
		if (
			(rxChange ||  this.oldMed < this.selectedIndex) &&
			this.taskdetail.task.numType == 1
		) {
			body['medication'] = this.medicationObj[this.selectedIndex].medication;
			body['validate'] = this.taskdetail.validate;
			delete body['validate'].pharmacyRequestCodeDesc;
			this.viewSummary('approveChangeRx', body);
		} else if (rxChange == null && this.taskdetail.task.numType == 1) {
			body['medication'] = this.medicationObj[this.selectedIndex].medication;
			body['validate'] = this.taskdetail.validate;
			delete body['validate'].pharmacyRequestCodeDesc;
			this.viewSummary('approveRx', body);
		}
		}
		else if(this._service.erxCheck==2)
		{
			if (
				(rxChange ||  this.oldMed < this.compSelectedIndex) &&
				this.taskdetail.task.numType == 1
			) {
				body['validate'] = this.taskdetail.validate;
				delete body['validate'].pharmacyRequestCodeDesc;
				if(this._service.erxCheck==2 && !this.checkScheduleDrugs())
					{
						this.modalService.open(this.contentPrompt, { 
							size: 'sm',
							backdrop: 'static',
							keyboard: false }).result.then((result) => {
							if (result == 'Save click') {
								this.viewSummary('approveChangeRx', body);
							}
						});
					}
			} else if (rxChange == null && this.taskdetail.task.numType == 1) {
				body['validate'] = this.taskdetail.validate;
				delete body['validate'].pharmacyRequestCodeDesc;
				this.viewSummary('approveRx', body);
			}	
		}
			}

		
	}
	deny(content) {
		if (this.taskdetail.task.numType != 1) {
			this.loadSpin=true;
			this.requestService
				.sendRequest(erx_url.reason_code + '8', 'get', REQUEST_SERVERS.erx_fd_api)
				.subscribe((response: any) => {
					this.loadSpin=false;
					this.reasonCode = response.result.data;
					this.selectedReasonValue = this.reasonCode[0].code;
					this.modalService.open(content, { size: 'sm' });
				},err=>{
					this.loadSpin=false;
				});
		} else {
			this.loadSpin=true;
			this.requestService
				.sendRequest(erx_url.reason_code + '4', 'get', REQUEST_SERVERS.erx_fd_api)
				.subscribe((response: any) => {
					this.loadSpin=false;
					this.reasonCode = response.result.data;
					this.selectedReasonValue = this.reasonCode[0].code;
					this.modalService.open(content, { size: 'sm' });
				},err=>{
					this.loadSpin=false;
				});
		}
	}
	denyConfirm() {
		
		
		
		this._service.denyChange=true; // ready to sign disable for deny incomplete status
		// return;
		delete this.taskdetail.patient.name;
		this._service.prevDeniedRefill=this.medicationObj[this.selectedIndex].medication.refill;
		this.medicationObj[this.selectedIndex].medication.refill = 0;
		this.medicationObj[this.selectedIndex].medication.scriptDate = new Date().toISOString();
		if(this._service.erxCheck!=2){
		let body = {
			taskId: this.taskdetail.task.id,
			orderId: this.taskdetail.task.orderId,
			medication: this.medicationObj[this.selectedIndex].medication,
			pharmacy: this.taskdetail.pharmacy,
			pharmacyErx: this.taskdetail.pharmacyErx,
			patient: this.taskdetail.patient,
			prescriber: this.taskdetail.prescriber,
			case: {
				id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail.case.id? this.taskdetail.case.id:null,
			},
			visit: {
				id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail.visit.id?this.taskdetail.visit.id:null,
			},
			deny: {
				prescriberResponseCode: this.selectedReasonValue,
				prescriberResponseReason: this.presResponseReason,
				id: this.taskdetail.validate.id,
				pharmacyRequestCode: this.taskdetail.validate.pharmacyRequestCode,
				pharmacyRequestReason: this.taskdetail.validate.pharmacyRequestReason,
				additionalInfo: this.taskdetail.validate.additionalInfo,
			},
		};
		if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
			&& this.tempData.role.medical_identifier==1)
			
			{
			if(this.taskdetail.supervisor.address){
				this.taskdetail.supervisor.addressLine1=this.taskdetail.supervisor.address.address;
				this.taskdetail.supervisor.addressLine2=this.taskdetail.supervisor.address.floor;
				this.taskdetail.supervisor.city=this.taskdetail.supervisor.address.city;
				this.taskdetail.supervisor.stateProvince=this.taskdetail.supervisor.address.state_object.code;
				this.taskdetail.supervisor.countryCode="US";	
				this.taskdetail.supervisor.postalCode=this.taskdetail.supervisor.address.zip;
				delete this.taskdetail.supervisor.address;
			}
			body['supervisor']=this.taskdetail.supervisor;
			}
		
		
			if (this.taskdetail.task.numType == 1) {
				body['taskType'] = this.taskdetail.task.numType;
				this.viewSummary('denyRx', body);
			} else {
				this.viewSummary('deny', body);
			}
		}
		else if (this._service.erxCheck == 2) {

			let compMed = [];
			let compAlerts =this.medicationObj[0].medication.alerts;
			for (let k = 0; k < this.medicationObj.length; k++) {
				compMed.push({
					quantity: this.medicationObj[k].medication.quantity,
					rawMed: this.medicationObj[k].medication.rawMed,
					id:this.medicationObj[k].medication.medId
				})
			}
			// checks for deleting empty id in case of compound Medication
			for (let k = 0; k < compMed.length; k++) {
				if(!compMed[k].id){
					delete compMed[k].id
				}
			}


			for (let m = 1; m < this.medicationObj.length; m++) {
				compAlerts.concat(this.medicationObj[m].medication.alerts);
			}
			let compDraftOrder = [];
			compDraftOrder.push({
				medication: {
					compoundMedication: compMed,
					quantityUnitOfMeasureCode: this.medicationObj[0].medication.quantityUnitOfMeasureCode,
					quantityUnitOfMeasureName: this.medicationObj[0].medication.quantityUnitOfMeasureName,
					quantityUnitOfMeasureId:this.medicationObj[0].medication.quantityUnitOfMeasureId,
					description: this.medicationObj[0].medication.description,
					strengthFormId:this.medicationObj[0].medication.strengthFormId,
					strengthFormCode: this.medicationObj[0].medication.strengthFormCode,
					strengthFormName: this.medicationObj[0].medication.strengthFormName,
					sig: this.medicationObj[0].medication.sig,
					scriptDate: this.medicationObj[0].medication.scriptDate,
					effectiveDate: this.medicationObj[0].medication.effectiveDate,
					quantity: this.medicationObj[0].medication.compoundQuantity,
					refill: this.medicationObj[0].medication.refill,
					medDetailId:this.medicationObj[0].medication.medDetailId?this.medicationObj[0].medication.medDetailId:null,
					substitute: this.medicationObj[0].medication.substitute,
					daysSupply: this.medicationObj[0].medication.daysSupply,
					internalComments: this.medicationObj[0].medication.internalComments,
					pharmacyNotes: this.medicationObj[0].medication.pharmacyNotes,
					icd10Codes: this.medicationObj[0].medication['icd10Codes'],
					alerts: compAlerts,
					allALertCheck:this.medicationObj[0].medication.allALertCheck
				},
				favourite:0,
			})

			for(let i=0;i<compDraftOrder.length;i++){
				if(!compDraftOrder[i].subTaskId)
				{
					delete compDraftOrder[i].subTaskId;

				}
				if(!compDraftOrder[i].medication.medDetailId)
				{
					delete compDraftOrder[i].medication.medDetailId;
				}

			}

			

			let body = {
				taskId: this.taskdetail.task.id,
				orderId: this.taskdetail.task.orderId,
				isCompoundMed: true,
				draftOrder: compDraftOrder,
				medication: compDraftOrder,
				pharmacy: this.taskdetail.pharmacy,
				pharmacyErx: this.taskdetail.pharmacyErx,
				patient: this.taskdetail.patient,
				prescriber: this.taskdetail.prescriber,
				case: {
				id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail.case.id? this.taskdetail.case.id:null,
				},
				visit: {
				id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId:this.taskdetail.visit.id?this.taskdetail.visit.id:null,
			},
			deny: {
				prescriberResponseCode: this.selectedReasonValue,
				prescriberResponseReason: this.presResponseReason,
				id: this.taskdetail.validate.id,
				pharmacyRequestCode: this.taskdetail.validate.pharmacyRequestCode,
				pharmacyRequestReason: this.taskdetail.validate.pharmacyRequestReason,
				additionalInfo: this.taskdetail.validate.additionalInfo,
			},
			
			};
			if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
				&& this.tempData.role.medical_identifier==1)
				
				{
					if(this.taskdetail.supervisor.address){
					this.taskdetail.supervisor.addressLine1=this.taskdetail.supervisor.address.address;
					this.taskdetail.supervisor.addressLine2=this.taskdetail.supervisor.address.floor;
					this.taskdetail.supervisor.city=this.taskdetail.supervisor.address.city;
					this.taskdetail.supervisor.stateProvince=this.taskdetail.supervisor.address.state_object.code;
					this.taskdetail.supervisor.countryCode="US";	
					this.taskdetail.supervisor.postalCode=this.taskdetail.supervisor.address.zip;
					delete this.taskdetail.supervisor.address;
				}
					body['supervisor']=this.taskdetail.supervisor;
				}
				
			  
			
			if (this.taskdetail.task.numType == 1) {
				body['taskType'] = this.taskdetail.task.numType;
				this.viewSummary('denyRx', body);
			} else {
				this.viewSummary('deny', body);
			}

		}
	}

	replaceConfirm() {
		this._service.denyChange=false; // ready to sign disable for deny incomplete status;
		delete this.taskdetail.patient.name;
		this.medicationObj[this.selectedIndex].medication.scriptDate = new Date().toISOString();
		let body;
		if(this._service.erxCheck!=2){
			body= {
				taskId: this.taskdetail.task.id,
				prevTaskId: this.taskdetail.task.prevTaskId,
				orderId: this.taskdetail.task.orderId,
				medication: this.medicationObj[0].medication,
				pharmacy: this.taskdetail.pharmacy,
				pharmacyErx: this.taskdetail.pharmacyErx,
				patient: this.taskdetail.patient,
				prescriber: this.taskdetail.prescriber,
				case: {
					id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail.case.id? this.taskdetail.case.id:null,
				},
				visit: {
					id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId:this.taskdetail.visit.id?this.taskdetail.visit.id:null,
				},
				};
				if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
					&& this.tempData.role.medical_identifier==1)
					{
						if(this.taskdetail.supervisor.address){	
						this.taskdetail.supervisor.addressLine1=this.taskdetail.supervisor.address.address;
						this.taskdetail.supervisor.addressLine2=this.taskdetail.supervisor.address.floor;
						this.taskdetail.supervisor.city=this.taskdetail.supervisor.address.city;
						this.taskdetail.supervisor.stateProvince=this.taskdetail.supervisor.address.state_object.code;
						this.taskdetail.supervisor.countryCode="US";	
						this.taskdetail.supervisor.postalCode=this.taskdetail.supervisor.address.zip;
						delete this.taskdetail.supervisor.address;
						}
					body['supervisor']=this.taskdetail.supervisor;
					}
		}
		else if (this._service.erxCheck == 2) {

			let compMed = [];
			let compAlerts =this.medicationObj[0].medication.alerts;
			for (let k = 0; k < this.medicationObj.length; k++) {
				compMed.push({
					quantity: this.medicationObj[k].medication.quantity,
					rawMed: this.medicationObj[k].medication.rawMed,
					id:this.medicationObj[k].medication.medId
				})
			}
			// checks for deleting empty id in case of compound Medication
			for (let k = 0; k < compMed.length; k++) {
				if(!compMed[k].id){
					delete compMed[k].id
				}
			}


			for (let m = 1; m < this.medicationObj.length; m++) {
				compAlerts.concat(this.medicationObj[m].medication.alerts);
			}
			let compDraftOrder = [];
			compDraftOrder.push({
				medication: {
					compoundMedication: compMed,
					quantityUnitOfMeasureCode: this.medicationObj[0].medication.quantityUnitOfMeasureCode,
					quantityUnitOfMeasureName: this.medicationObj[0].medication.quantityUnitOfMeasureName,
					quantityUnitOfMeasureId:this.medicationObj[0].medication.quantityUnitOfMeasureId,
					description: this.medicationObj[0].medication.description,
					strengthFormId:this.medicationObj[0].medication.strengthFormId,
					strengthFormCode: this.medicationObj[0].medication.strengthFormCode,
					strengthFormName: this.medicationObj[0].medication.strengthFormName,
					sig: this.medicationObj[0].medication.sig,
					scriptDate: this.medicationObj[0].medication.scriptDate,
					effectiveDate: this.medicationObj[0].medication.effectiveDate,
					quantity: this.medicationObj[0].medication.compoundQuantity,
					refill: this.medicationObj[0].medication.refill,
					medDetailId:this.medicationObj[0].medication.medDetailId?this.medicationObj[0].medication.medDetailId:null,
					substitute: this.medicationObj[0].medication.substitute,
					daysSupply: this.medicationObj[0].medication.daysSupply,
					internalComments: this.medicationObj[0].medication.internalComments,
					pharmacyNotes: this.medicationObj[0].medication.pharmacyNotes,
					icd10Codes: this.medicationObj[0].medication['icd10Codes'],
					alerts: compAlerts,
					allALertCheck:this.medicationObj[0].medication.allALertCheck
				},
				favourite:0,
			})

			for(let i=0;i<compDraftOrder.length;i++){
				if(!compDraftOrder[i].subTaskId)
				{
					delete compDraftOrder[i].subTaskId;

				}
				if(!compDraftOrder[i].medication.medDetailId)
				{
					delete compDraftOrder[i].medication.medDetailId;
				}

			}

			
			body= {
				taskId: this.taskdetail.task.id,
				prevTaskId: this.taskdetail.task.prevTaskId,
				orderId: this.taskdetail.task.orderId,
				isCompoundMed: true,
				draftOrder: compDraftOrder,
				medication: compDraftOrder,
				pharmacy: this.taskdetail.pharmacy,
				pharmacyErx: this.taskdetail.pharmacyErx,
				patient: this.taskdetail.patient,
				prescriber: this.taskdetail.prescriber,
				case: {
					id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.case_id:this.taskdetail.case.id? this.taskdetail.case.id:null,
				},
				visit: {
					id:  this._router.url.includes('template-manager')?this.scheduler && this.scheduler.template_instance && this.scheduler.template_instance.templateVisitId:this.taskdetail.visit.id?this.taskdetail.visit.id:null,
				},
				};
				if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
					&& this.tempData.role.medical_identifier==1)
					{
						if(this.taskdetail.supervisor.address){
						this.taskdetail.supervisor.addressLine1=this.taskdetail.supervisor.address.address;
						this.taskdetail.supervisor.addressLine2=this.taskdetail.supervisor.address.floor;
						this.taskdetail.supervisor.city=this.taskdetail.supervisor.address.city;
						this.taskdetail.supervisor.stateProvince=this.taskdetail.supervisor.address.state_object.code;
						this.taskdetail.supervisor.countryCode="US";	
						this.taskdetail.supervisor.postalCode=this.taskdetail.supervisor.address.zip;
						delete this.taskdetail.supervisor.address;
						}
					body['supervisor']=this.taskdetail.supervisor;
					}
			
			
				
			  
			
			

		}


		if (this._service.erxCheck == 2 && this.medicationObj.length < 2) {
			this.toaster.error("Please select a least 2 medicine for a compound Medication !", "Error")
			return;
		}
		if (
			this.medicationObj[0].medication.sig == '' ||
			this.medicationObj[0].medication.sig == null
		) {
			this.toaster.error('Sig is required', 'Error');
			return;
		}

		if ((this.medicationObj[0].medication.quantity == '' || this.medicationObj[0].medication.quantity == null)) {
			if (this.errDisplay == true) {
				this.toaster.error(
					`Add dispense for the ${this.medicationObj[0].medication.rawMed.drugName} medicine`,
					'Error',
				);
			}
			return;
		}
		
		if ((this.medicationObj[0].medication.quantity == 0)) {
				this.toaster.error(
					`Dispense should be greater than 0 for ${this.medicationObj[0].medication.rawMed.drugName} medicine`,
					'Error',
				);
			return;
		}
		


		// pharma check 

		let pharmaCheck = true;
				if (this._service.erxCheck != 2) {	
							
							if(this.checkCIISchedule(0)){
								let rindex = this.scheduleIIdrugs.findIndex(x => x.drugId ===this.medicationObj[0].medication.rawMed.drugId);
								if(rindex!=-1 && this.scheduleIIdrugs[rindex].count>1){
									if (this.medicationObj[this.selectedIndex].medication.effectiveDate == null || this.medicationObj[this.selectedIndex].medication.effectiveDate == "") {
												
												this.toaster.error(
													`Start Date is ${this.medicationObj[0].medication.rawMed.drugName} Required`,
													'Error',
												);
										
										pharmaCheck = false;
									}
								}
								if (this.medicationObj[0].medication.daysSupply == null || this.medicationObj[0].medication.daysSupply == 0) {
										
										this.toaster.error(
											`Days Supply for ${this.medicationObj[0].medication.rawMed.drugName} is Required`,
											'Error',
										);
									// }
								
								pharmaCheck = false;
							}
							}
							if(this.medicationObj[this.selectedIndex].medication.effectiveDate!=null)
						{
							let date1=new Date(this.medicationObj[this.selectedIndex].medication.effectiveDate).setHours(0,0,0,0);
							let date2=new Date(this.minDate).setHours(0, 0, 0, 0);

							if(date1<date2)
							{
								
							}
							if(date1==date2)
							{
								
							}
							if(date1>date2)
							{
								
							}
							 	if(date1<date2)
								{
								this.toaster.error(
									`Start date should be greater or equal to current date `,'Error',
								);
							pharmaCheck = false;
							
							}
						}

						if(this.medicationObj[this.selectedIndex].medication.effectiveDate!=null && this.medicationObj[this.selectedIndex].medication.effectiveDate>this.getMaxStartDate())
							{
							this.toaster.error(
							`Earliest fill date for ${this.medicationObj[this.selectedIndex].medication.rawMed.drugName} should be less than 6 months`, 'Error'
							);
							pharmaCheck = false;
							
						}
							if (this.medicationObj[this.selectedIndex].medication.rawMed.rawData['DefaultETCID'] == '5619'){
							let notes=this.medicationObj[0].medication.pharmacyNotes.split(':');
							if(notes[0]!="GHB")
							{
								this.toaster.error(`'GHB:' is required in this format for ${this.medicationObj[0].medication.rawMed.drugName} Medicine!`, "Error")
								return 
							}
							else if(notes[1]==null ||notes[1]=="")
							{
								this.toaster.error("Please provide medical reason for compound medicine!", "Error")
								return;
							}
						}
						if (this.medicationObj[0].medication.sig == '' || this.medicationObj[0].medication.sig == null) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Select a sig for the ${this.medicationObj[0].medication.rawMed.drugName} medicine`,
									'Error',
								);
							}
							pharmaCheck = false;
							// break;
						}
						
						if (this.medicationObj[0].medication.rawMed.rawData['DefaultETCID'] == "5619" && (this.medicationObj[0].medication.pharmacyNotes == '' || this.medicationObj[0].medication.pharmacyNotes == null)) {
							if (this.errDisplay == true) {
								this.toaster.error(`Please provide medical reason!  for the ${this.medicationObj[0].medication.rawMed.drugName} medicine `, "Error")
							}
							pharmaCheck = false;
							// break;
						}

						if (
							this.medicationObj[0].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
							''
						) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Add dispense unit for the ${this.medicationObj[0].medication.rawMed.drugName} medicine`,
									'Error',
								);
							}
							pharmaCheck = false;
							// break;
						}
						if (this.medicationObj[0].medication.refill == null || this.medicationObj[0].medication.refill==0) {
							if (this.errDisplay == true) {
								this.toaster.error(
									`Refill can't be empty.Please enter refill for the ${this.medicationObj[0].medication.rawMed.drugName} medicine`,
								);
							}
							return;
						}
					// }
				}
				else if (this._service.erxCheck == 2) {
				if(this.checkCIICompSchedule()){
						if (this.medicationObj[0].medication.effectiveDate == null || this.medicationObj[0].medication.effectiveDate == "" ) {
										
										this.toaster.error(
											`Start Date For Compound Medicine is Required`,
											'Error',
										);
								
								pharmaCheck = false;
							
						}
						if (this.medicationObj[0].medication.daysSupply == null || this.medicationObj[0].medication.daysSupply == 0) {
								
								this.toaster.error(
									`Days Supply For Compound Medicine is Required`,
									'Error',
								);
						
						pharmaCheck = false;
					}
					}

					if(this.medicationObj[0].medication.effectiveDate!=null)
						{
							let date1=new Date(this.medicationObj[0].medication.effectiveDate).setHours(0,0,0,0);
							let date2=new Date(this.minDate).setHours(0, 0, 0, 0);

							if(date1<date2)
							{
								
							}
							if(date1==date2)
							{
								
							}
							if(date1>date2)
							{
								
							}
							 	if(date1<date2)
								{
								this.toaster.error(
									`Start date should be greater or equal to current date `,'Error',
								);
							pharmaCheck = false;
							
							}
						}

						if(this.medicationObj[0].medication.effectiveDate!=null && this.medicationObj[0].medication.effectiveDate>this.getMaxStartDate())
							{
							this.toaster.error(
							`Earliest fill date for ${this.medicationObj[0].medication.rawMed.drugName} should be less than 6 months`, 'Error'
							);
							pharmaCheck = false;
							
						}

					if (this.medicationObj[0].medication.sig == '' || this.medicationObj[0].medication.sig == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a sig for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}
					if (this.medicationObj[0].medication.description == '' || this.medicationObj[0].medication.description == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Enter a name for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;

					}
					let ghbCheck=false
					for(let i=0;i<this.medicationObj.length;i++)
					{
						if(this.medicationObj[i].medication.rawMed.rawData['DefaultETCID'] == '5619')
						{
							ghbCheck=true;
							break;
						}
					}
					if(ghbCheck==true){
					let notes=this.medicationObj[0].medication.pharmacyNotes.split(':');
							if(notes[0]!="GHB")
							{
								this.toaster.error("'GHB:' is required in this format for compound Medicine!", "Error")
								return 
							}
							else if(notes[1]==null ||notes[1]=="")
							{
								this.toaster.error("Please provide medical reason for compound medicine!", "Error")
								return;
							}
						}
					if (this.medicationObj[0].medication.strengthFormId == '' || this.medicationObj[0].medication.strengthFormId == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a strenght form for the compound medicine`,
								'Error',
							);
								return;
						}
						pharmaCheck = false;

					}
					if (this.medicationObj[0].medication.quantityUnitOfMeasureCode == '' || this.medicationObj[0].medication.quantityUnitOfMeasureCode == null) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Select a dispense unit for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;
						return;

					}
					

					if (
						this.medicationObj[0].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc ==
						''
					) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Add dispense unit for the compound medicine`,
								'Error',
							);
						}
						pharmaCheck = false;
						return;

					}
					if (this.medicationObj[0].medication.refill == null || this.medicationObj[0].medication.refill == 0) {
						if (this.errDisplay == true) {
							this.toaster.error(
								`Refill can't be empty.Please enter refill for the compound medicine`,
							);
						}
						return;
					}


				}

				if (!pharmaCheck) {
					return;
				}
				else{
					if(this._service.erxCheck==2 && !this.checkScheduleDrugs())
					{
						this.modalService.open(this.contentPrompt, { 
							size: 'sm',
							backdrop: 'static',
							keyboard: false }).result.then((result) => {
							if (result == 'Save click') {
								this.viewSummary('replace', body);
							}
						})
					}
					else{
						this.viewSummary('replace', body);	
					}
				}

	}

	singleAlertCheck(alertObj)
	{
		if(alertObj.alertCheck==false)
		{
			alertObj.reason=null;
			alertObj.comment=null;

		}
	}

	async allAlertCheck() {
		if(this.medicationObj[this.selectedIndex] &&  this.medicationObj[this.selectedIndex].medication){ this.medicationObj[this.selectedIndex].medication.allALertCheck.check =
			!this.medicationObj[this.selectedIndex].medication.allALertCheck.check;

		if(this.medicationObj[this.selectedIndex].medication.allALertCheck.check==false)
		{
			this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason='';
			this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment='';

		}

		{
			this.allAlertChange(this.selectedIndex);
		}
	
	}
		
		
	}
	async allAlertChange(index) {
		if (this.medicationObj[this.selectedIndex].medication.allALertCheck.check) {
		for (let i = 0; i < this.medicationObj[index].medication.alerts.length; i++) {
			this.medicationObj[index].medication.alerts[i].comment = await cloneDeep(
				this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment
			);
			this.medicationObj[index].medication.alerts[i].reason = await cloneDeep(
				this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason
			);
			this.medicationObj[index].medication.alerts[i].alertCheck = await cloneDeep(
				this.medicationObj[this.selectedIndex].medication.allALertCheck.check
			);
		}
		}
		else{
			for (let i = 0; i < this.medicationObj[index].medication.alerts.length; i++) {
				this.medicationObj[index].medication.alerts[i].comment = null;
								this.medicationObj[index].medication.alerts[i].reason = null
				this.medicationObj[index].medication.alerts[i].alertCheck = await cloneDeep(
					this.medicationObj[this.selectedIndex].medication.allALertCheck.check
				);
			}
		}
		
		
	}

	async allReasonChange(index) {
		for (let i = 0; i < this.medicationObj[index].medication.alerts.length; i++) {
			this.medicationObj[index].medication.alerts[i].reason = await cloneDeep(
				this.medicationObj[this.selectedIndex].medication.allALertCheck.allReason
			);
		}
		
		
		
	}


	async allCommentChange(index) {
		for (let i = 0; i < this.medicationObj[index].medication.alerts.length; i++) {
			this.medicationObj[index].medication.alerts[i].comment = await cloneDeep(
				this.medicationObj[this.selectedIndex].medication.allALertCheck.allComment
			);
		}
		
		
		
	}
	scrollFetch = false;
	onScroll(e) {
		if (e.target.offsetHeight + e.target.scrollTop >= e.target.scrollHeight && !this.scrollFetch) {
			this.scrollFetch = true;
			if (this.total_count_check) {
				this.total_count_check = false;
				this.getMedicine(1);
			}
		}
	}

	selectEventCase(item) {

		this.caseId = item.id;
		this.searchByName = '';
		this.searchByChart = '';
		this.requestService
			.sendRequest(
				erx_url.patient_search +
				'?filter=true&per_page=10&page=1&pagination=1&id=' +
				item.patient_id,
				'get',
				REQUEST_SERVERS.kios_api_path,
			)
			.subscribe((res) => {
				this.selectEvent(res.result.data[0]);
			});
	}

	oneTimeApiCase = true;
	tempCaseSearch: any = {};
	onChangeSearchCase(val: string) {
		if (val !== '') {
			if (this.oneTimeApiCase) {
				this.oneTimeApiCase = false;
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.getCaseList + val,
						'GET',
						REQUEST_SERVERS.kios_api_path,
					)
					.subscribe((res: any) => {
						this.oneTimeApiCase = true;
						if (this.tempCaseSearch && this.tempCaseSearch.name) {
							this.onChangeSearchCase(this.tempCaseSearch.name);
						}
						this.tempCaseSearch = {};
						for (let i = 0; i < res.result.data.docs.length; i++) {
							res.result.data.docs[i].id = JSON.stringify(res.result.data.docs[i].id);
						}
						if (this.caseIn) {
							this.selectEventCase(res.result.data.docs[0]);
						}
						this.dataCase = res.result.data.docs;
						this.cdr.detectChanges();
					},err=>{
					});
			} else {
				this.tempCaseSearch = {
					name: val,
				};
			}
		}
	}

	clearDataCase(e) {
		this.searchByCase = '';
		this.dataChart = [];
		this.cdr.detectChanges();
	}

	defaultPhar(e, pharmacy) {
		let body = {
			pharmacy_id: pharmacy.id,
			patient_id: this.patient_info.id,
			default: e.target.checked,
		};
		this.requestService
			.sendRequest(erx_url.attach_pharmacy, 'post', REQUEST_SERVERS.erx_fd_api, body)
			.subscribe((response: any) => {
				if (e.target.checked) {
					for (let i = 0; i < this.pharmacyData.length; i++) {
						if (this.pharmacyData[i].id != pharmacy.id && this.pharmacyData[i].default_pharmacy) {
							delete this.pharmacyData[i].default_pharmacy;
						} else if (this.pharmacyData[i].id == pharmacy.id) {
							this.pharmacyData[i]['default_pharmacy'] = true;
						}
					}
				}
			});
	}

	viewSummaryFun(e) {
		if (e == 'erx') {
			this.patientEmit.emit('erx');
		}
		this.searchByName = '';
		this.searchByChart = '';
		this.searchByCase = '';
		this.viewSummaryCheck = false;
		
		
		for(let i=0;this._service.data && this._service.data.draftOrder && i<this._service.data.draftOrder.length;i++){
			this._service.data.draftOrder[i].medication.effectiveDate=new Date(this._service.data.draftOrder[i].medication.effectiveDate)
		}
		if(this._service.denyChange==true)
		{
			this.medicationObj[this.selectedIndex].medication.refill=this._service.prevDeniedRefill;
		}
		if(!(this._service.data.task) ){
			

			// changes in effective date for service data
			
			let tempObj=cloneDeep(this._service);
			
			this.medicationObj=[];
			this.initMedObj(tempObj,1);
		}
	}
	removeDot(value) {
		this.dotCheck = value;
	}
	dispenseCheck(e, compound, index?) {
		
		if (!this.dotCheck) {

			if (e.target.value.length>0 && e.target.value[e.target.value.length - 1] == ".") {
				let dotCount = 0;
				for (let i = 0; i < e.target.value.length; i++) {
					if (e.target.value[i] == ".") {
						dotCount = dotCount + 1;
					}
				}
				if (dotCount == 1) {
					return

				}
			}

		}
		var patt = new RegExp(/^(?=.{1,11}$)\d{0,11}(\.\d{1,4})?$/);
		if (patt.test(e.target.value)) {
			let result = '';
			var decimal = e.target.value.split('.');

			if (decimal[0] == '') {
				decimal[0] = '0';
			}
			if (decimal[1] && parseInt(decimal[1]) == 0 && this.dotCheck==true) {
				result = decimal[0];
			}
			else if(decimal[1] && parseInt(decimal[1]) != 0 && this.dotCheck==true ){
				let dec2= decimal[1].replace(/0+$/g, '');
				
				result=decimal[0]+'.'+dec2;
			}
			else {
				let deci = decimal.length > 1 ? decimal[1] : '';
				let dot = deci == '' ? '' : '.';
				result = decimal[0] + dot + deci;
			}
			if (this._service.erxCheck != 2) {
				this.medicationObj[this.selectedIndex].medication.quantity = result.toString();
			}
			else if (this._service.erxCheck == 2) {
				if (index != null) {
					this.medicationObj[index].medication.quantity = result.toString();
				}
				else {
					this.medicationObj[0].medication.compoundQuantity = result.toString();
				}
			}
			return;
		} else {
			const regexp = /(?=.{1,11}$)\d{0,11}(\.\d{1,4})?/;
			let result = e.target.value.match(regexp);
			if (this._service.erxCheck != 2) {
				this.medicationObj[this.selectedIndex].medication.quantity = result ? result[0] : '';
				e.target.value = cloneDeep(this.medicationObj[this.selectedIndex].medication.quantity);
			}
			else if (this._service.erxCheck == 2) {
				if (index != null) {
					this.medicationObj[index].medication.quantity = result ? result[0] : '';
					e.target.value = cloneDeep(this.medicationObj[index].medication.quantity);
				}
				else {
					this.medicationObj[0].medication.compoundQuantity = result ? result[0] : '';;
					e.target.value = cloneDeep(this.medicationObj[0].medication.compoundQuantity);
				}
			}
			var patt = new RegExp(/^(?=.{1,11}$)\d{0,11}(\.\d{1,4})?$/);
			if (patt.test(e.target.value)) {
				let result = '';
				var decimal = e.target.value.split('.');

				if (decimal[0] == '') {
					decimal[0] = '0';
				}
				if (decimal[1] && parseInt(decimal[1]) == 0 && this.dotCheck==true) {
					result = decimal[0];
				}
				else if(decimal[1] && parseInt(decimal[1]) != 0 && this.dotCheck==true ){
					
					let dec2= decimal[1].replace(/0+$/g, '');
					
					result=decimal[0]+'.'+dec2;
				}
				 else {
					let deci = decimal.length > 1 ? decimal[1] : '';
					let dot = deci == '' ? '' : '.';
					result = decimal[0] + dot + deci;
				}
				if (this._service.erxCheck != 2) {
					this.medicationObj[this.selectedIndex].medication.quantity = result.toString();
				}
				else if (this._service.erxCheck == 2) {
					if (index != null) {
						this.medicationObj[index].medication.quantity = result.toString();
					}
					else {
						this.medicationObj[0].medication.compoundQuantity = result.toString();
					}
				}
				return;
			}
			return;
		}
	}
	checkDaySupply(drugId) {


		this._service.checkDaySupply({
			patientId: this.patient_info.id,
			drugId: drugId
		}).subscribe((res: any) => {
			this.medDaySupply = 90 - res.result.data.daySupply>0?90 - res.result.data.daySupply:0;
			this.checkMedicLenght = res.result.data.medications.length;
			
			
			// uncheck to be fixed later
			if(this._service.erxCheck==2){
			if(this.checkMedicLenght>0)
			{
				this.startDayCheck=true;
			} 
			// TODO:this needs to be updated with the minimum value
			if(this.schDaySupply){
				this.schDaySupply=parseInt(this.medDaySupply)<parseInt(this.medDaySupply)?this.medDaySupply:this.schDaySupply;
			}
			else{
			this.schDaySupply=this.medDaySupply;
			}
			if(this.medicationObj[this.selectedIndex].medication.daysSupply!=null && this.medicationObj[this.selectedIndex].medication.daysSupply!="" &&  parseInt(this.medicationObj[this.selectedIndex].medication.daysSupply)>parseInt(this.schDaySupply))
				this.medicationObj[this.selectedIndex].medication.daysSupply=this.schDaySupply;
			}
			if(this._service.erxCheck!=2){
			let drugCount={
				'drugId':drugId,
				'count':this.checkMedicLenght+1
				}
				this.scheduleIIdrugs.push(drugCount);
				
			}
		});
	}
	checkCIISchedule(index) {
		if (this.medicationObj && this.medicationObj[index] && this.medicationObj[index].medication.rawMed && this.medicationObj[index].medication.rawMed.rawData
			&& this.medicationObj[index].medication.rawMed.rawData.FederalDEAClassCodeDesc == "C-II") {
			this.isC2Schedule = true;
			// 
			return true;
		}
	}

	checkCIICompSchedule() {
		for(let k=0;k<this.medicationObj.length;k++){
			if (this.medicationObj && this.medicationObj[k] && this.medicationObj[k].medication.rawMed && this.medicationObj[k].medication.rawMed.rawData
				&& this.medicationObj[k].medication.rawMed.rawData.FederalDEAClassCodeDesc == "C-II"){
				this.isC2Schedule = true;
				// 
				return true;
			}
		}
	}

	onChangeInternalNotes(event) {
		this.medicationObj[this.selectedIndex].medication.internalComments = event.target.value;
	}

	onChangePharmacyNotes(event) {
		if(this._service.erxCheck!=2){
			if(this.medicationObj[this.selectedIndex].medication.rawMed.rawData['DefaultETCID'] == '5619')
			{
				let sub=event.target.value.substring(0,4);
				
				if(sub!="GHB:")
				{
					let notes;
					if(event.target.value.includes(':'))
					{
						notes=event.target.value.split(':');
						
						notes[0]='GHB:';
						
						
						if(notes[1]){
						event.target.value=notes[0]+notes[1];
						}else{
							event.target.value=notes[0];
						}

						this.medicationObj[this.selectedIndex].medication.pharmacyNotes=event.target.value;
						
					}
					else if(event.target.value.includes('B')){
						notes=event.target.value.split('B');
						notes[0]='GHB:';
						
						
						if(notes[1]){
							event.target.value=notes[0]+notes[1];
							}else{
								event.target.value=notes[0];
							}

						this.medicationObj[this.selectedIndex].medication.pharmacyNotes=event.target.value;
						
					}
					else {
						if(!event.target.value.includes('G') && !event.target.value.includes('H') && !event.target.value.includes('B') && !event.target.value.includes(':'))
						{
							event.target.value='GHB:'+event.target.value;
							this.medicationObj[this.selectedIndex].medication.pharmacyNotes=event.target.value;
						}   
					}			
				}
				else{
					this.medicationObj[this.selectedIndex].medication.pharmacyNotes = event.target.value;
				}
			}
			else{
			this.medicationObj[this.selectedIndex].medication.pharmacyNotes = event.target.value;
			}
		}
		else if(this._service.erxCheck==2)
		{
			for(let k=0;k<this.medicationObj.length;k++)
			{
				if(this.medicationObj[k].medication.rawMed.rawData['DefaultETCID'] == '5619')
			{
				let sub=event.target.value.substring(0,4);
				
				if(sub!="GHB:")
				{
					let notes;
					if(event.target.value.includes(':'))
					{
						notes=event.target.value.split(':');
						
						notes[0]='GHB:';
						
						
						if(notes[1]){
						event.target.value=notes[0]+notes[1];
						}else{
							event.target.value=notes[0];
						}

						this.medicationObj[0].medication.pharmacyNotes=event.target.value;
						
					}
					else if(event.target.value.includes('B')){
						notes=event.target.value.split('B');
						notes[0]='GHB:';
						
						
						if(notes[1]){
							event.target.value=notes[0]+notes[1];
							}else{
								event.target.value=notes[0];
							}

						this.medicationObj[0].medication.pharmacyNotes=event.target.value;
						
					}
					else {
						if(!event.target.value.includes('G') && !event.target.value.includes('H') && !event.target.value.includes('B') && !event.target.value.includes(':'))
						{
							event.target.value='GHB:'+event.target.value;
							this.medicationObj[0].medication.pharmacyNotes=event.target.value;
						}   
					}			
				}
				else{
					this.medicationObj[0].medication.pharmacyNotes = event.target.value;
				}
			}
			else{
			this.medicationObj[0].medication.pharmacyNotes = event.target.value;
			}


			}
		}
	}
	getStrengthForm(event?) {
		let sterm="";
		if(event && event.target && event.target.value)
		{
			sterm=event.target.value;
		}
		else if(event)
		{
			sterm=event;
		}
		var paramQuery = {
			term: sterm,
			offset: 1,
			limit: 999

		}
		this.requestService.sendRequest(erx_url.strength_from, 'get', REQUEST_SERVERS.erx_api_url, paramQuery)
			.subscribe((response: any) => {
				this.strengthData = response;
			})
	}

	getQuantityMeasure(event?) {
		

		let sterm="";
		if(event && event.target && event.target.value)
		{
			sterm=event.target.value;
		}
		else if(event)
		{
			sterm=event;
		}
		var paramQuery = {
			term: sterm,
			offset: 1,
			limit: 999

		}
		this.requestService.sendRequest(erx_url.quantity_measure, 'get', REQUEST_SERVERS.erx_api_url,paramQuery)
			.subscribe((response: any) => {
				this.quantityMeasure = response;
			})
	}

	setStrengthForm(event) {
		
		if(event){
		if(this.strengthData){
		this.strengthData.map(e => {
			if (e.id == this.medicationObj[0].medication.strengthFormId) {
				this.medicationObj[0].medication.strengthFormCode = e.code;
				this.medicationObj[0].medication.strengthFormName = e.term;
				this.medicationObj[0].medication.strengthFormId = e.id;

			}
		});
		}
		else{
				this.medicationObj[0].medication.strengthFormCode = null;
				this.medicationObj[0].medication.strengthFormName = null;
				this.medicationObj[0].medication.strengthFormId = null;

		}

		
	}

	}

	onChangeDispense(event) {
		if(event){
		this.medicationObj[0].medication.quantityUnitOfMeasureName = event.term;
		this.medicationObj[0].medication.quantityUnitOfMeasureId = event.id;
		}
		
	}

	onChangeDispenseClinic(event) {
		if(event){
		this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc=event.term
		this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.eRxScriptPotencyUnitCode=event.code
		this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.ClinicalQuantityDesc=event.term.toLowerCase();
		this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.SubUnitOfMeasureDesc=event.term.toLowerCase();
		}
		else{

			this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.eRxScriptUnitOfMeasureDesc=null;
		this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.eRxScriptPotencyUnitCode="";
		this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.ClinicalQuantityDesc="";
		this.medicationObj[this.selectedIndex].medication.rawMed.rawData.ClinicalQuantity.SubUnitOfMeasureDesc="";
		}
	}
	loader() {
		
		this.otpLoader = setInterval(() => {

			this.startLoader();
		}, 500);

	}
	startLoader() {
		if (this.loadingBar == "0%") {
			this.loadingBar = "10%";
		}
		else if (this.loadingBar == "10%") {
			this.loadingBar = "20%";
		}
		else if (this.loadingBar == "20%") {
			this.loadingBar = "30%";
		}
		else if (this.loadingBar == "30%") {
			this.loadingBar = "40%";
		}
		else if (this.loadingBar == "40%") {
			this.loadingBar = "50%";
		}
		else if (this.loadingBar == "50%") {
			this.loadingBar = "60%";
		}
		else if (this.loadingBar == "60%") {
			this.loadingBar = "70%";
		}
		else if (this.loadingBar == "70%") {
			this.loadingBar = "80%";
		}
		else if (this.loadingBar == "80%") {
			this.loadingBar = "90%";
		}
		else if (this.loadingBar == "90%") {
			this.loadingBar = "100%";
		}
		else if (this.loadingBar == "100%") {
			this.loadingBar = "0%";
		}

	}

	passwordAuthentication(action) {
		this.isAccepted=action;
		this.loadSpin=true;
		this.requestService.sendRequest(LogInUrlsEnum.confirmPassword, 'POST', REQUEST_SERVERS.erx_fd_api, this.passwordForm.value).subscribe((res: any) => {
			this.loadSpin=false;
			if (res.status) {
				this.modalService.dismissAll();
				this.loader();

				this.enableOtp = false;
				let body = {
					isPushNotification: true,
					userId: JSON.parse(localStorage.getItem('cm_data')).user_id,
				}
				this._service.verifyOtp(body).subscribe(async (res) => {

					this.transactionId = res && res['result'].data;
					await this.polling();
				})
				this.modalService.open(this.contentOpt, { size: 'lg',
				backdrop: 'static',
				keyboard: false }).result.then((result) => {
					if (result == 'Close click')
					{
						this._service.erxCheck=1;
					}
					if (result == 'Save click') {
						let body = {
							otpCode: this.optAuth,
							slug:this.tempData.basic_info.epcs_status_id==2?"accepted":"not_assigned",
							userId: JSON.parse(localStorage.getItem('cm_data')).user_id,
						}
						this._service.verifyOtp(body).subscribe(async (res: any) => {

							if (await res.status == 200) {
								

								if(body.slug=='accepted'){

									this.prescriptionsLogRecordEPCS(1,14);
								}
								else if(body.slug=='not_assigned'){

										this.prescriptionsLogRecordEPCS(1,15);
								}
								
								
								
								
								this.getEpcsStatus();
							}

						})
					}
				});
			}
		},err=>{
			this.loadSpin=false;
		});
		 
	}
	cancelQuery() {
		this.disableTouch=false;
		this.loadingBar = "0%";
		this.enableOtp = true;
		clearInterval(this.otpLoader);
		if (this.transactionId) {
			const body = {
				"userRef": JSON.parse(localStorage.getItem('cm_data')).user_id,
				"transaction": this.transactionId
			}
			this.loadSpin=true;
			this._service.cancelQuery(body)
				.subscribe(
					(response: any) => {
						this.loadSpin=false;
					},err=>{
						this.loadSpin=false;
					}

				)
		}
		clearInterval(this.repeatQuery);
		this.loadingBar = "0%";
		this.pollingCount = 0;
		this.repeatQuery = null;
		this.transactionId = null;
	}
	polling() {
		this.repeatQuery = setInterval(() => {
			this.query();
		}, 7000);
	}

	query() {
		if (this.pollingCount <= 17 && this.transactionId) {
			const body = {
				"userRef": JSON.parse(localStorage.getItem('cm_data')).user_id,
				"transaction": this.transactionId
			}
			this._service.query(body)
				.subscribe(
					async(response: any) => {
						this.pollingCount += 1;
						if (await response.status == 200 && response.result.data.pending == 'false') {

							this.pollingCount = 0;

							clearInterval(this.repeatQuery);
							this.loadingBar = "0%";
							this.repeatQuery = null;
							let data = {
										id: JSON.parse(localStorage.getItem('cm_data')).user_id,
										slug:this.tempData.basic_info.epcs_status_id==2?"accepted":"not_assigned"
									}
									this.requestService
										.sendRequest(
											erx_url.user_epcs_status,
											'put',
											REQUEST_SERVERS.erx_fd_api,
											data
										).subscribe((res: any) => {
											this.tempData.basic_info.epcs_status_id=res.result.data.epcs_status_id;
											this.tempData.basic_info.epcs_status=res.result.data.epcs_status;
											localStorage.setItem('cm_data',JSON.stringify(this.tempData));
											this.modalService.dismissAll()
											if(data.slug=='accepted'){

												this.prescriptionsLogRecordEPCS(1,14);
											}
											else if(data.slug=='not_assigned'){

													this.prescriptionsLogRecordEPCS(1,15);
												}
											
											}
									)
						}
						if (await response.status == 200 && response.result.data.pending == 'expired') {
							this.pollingCount = 0;
							clearInterval(this.repeatQuery);
							this.disableTouch=false;
							this.loadingBar = "0%";
							this.enableOtp = true;
							clearInterval(this.otpLoader);
							this.loadingBar = "0%";
							this.repeatQuery = null;
							this.disableTouch = false;
							this.toaster.error(response.message, "Error")
						}
					}
				)
		}
		else {
			this.cancelQuery();
		}
	}
	sendOptQuery() {
		this.loader();
		this.enableOtp = false;
		this.disableTouch = true
		let body = {
			isPushNotification: true,
			userId: JSON.parse(localStorage.getItem('cm_data')).user_id,
		}
		this._service.verifyOtp(body).subscribe(async (res: any) => {

			this.transactionId = res && res['result'].data;
			await this.polling();
		})
	}

	getSupervisors(userId) {
		this.loadSpin=true;
		this.requestService
			.sendRequest(erx_url.users_supervisor, 'get', REQUEST_SERVERS.erx_fd_api, {
				user_id: userId
			})
			.subscribe((res) => {
				this.loadSpin=false;
				this.supervisors = res.result.data;
				this.supervisors.map((event: any) => {
					var fullname = event['first_name'];
					if (event['middle_name'] != null && event['middle_name'] != '') {
						fullname = fullname + ' ' + event['middle_name'];
					}
					if (event['last_name'] != null && event['last_name'] != '') {
						fullname = fullname + ' ' + event['last_name']
					}
					event['full_name'] = fullname;

				});
			},err=>{
				this.loadSpin=false;
			});
	}
	selectSupervisor(event) {
		this.supervisor=event;
		this.prescriber_info = event;
		delete this.prescriber_info.full_name;
		this.supervisorId = event.id;
	}
	checkErxDisablity()
	{
		if(!(this.containSupervisor == 1 && this.canFinalize==0 && this.choosenSupervisor==false) && this.selectedfromHome==false){
			if((this._service.erxCheck==1 ||this._service.erxCheck==2 )&& this.medicationObj.length>0)
		{
			
			return true;
		}
		if(this.prescriber_info.spis && this.prescriber_info.spis.length==0)
		{
			this.erxDisableTitle = "Please add spis in medical identifier for erx"
			return true
		}
		if(this.erxButton==false)
		{
			this.erxDisableTitle="Please do ID proofing for erx";
			return true;
		}
		if(this.isMediIdentider==0 && this.containSupervisor==0 && this.canFinalize==0){
			this.erxDisableTitle="Unautherize Access";
			
			return true;
		}
		if(this.tempData.basic_info && this.tempData.basic_info.epcs_status_id!=3)
		{
			this.erxDisableTitle="Please Accept Epcs for erx";
			return true;
		}
		this.erxDisableTitle="";
		return false;
		}
		else{
			if((this._service.erxCheck==1 ||this._service.erxCheck==2 )&& this.medicationObj.length>0)
			{	
			
			return true;
		}
		}
	}

	checkCompoundDisability()
	{
		if(!(this.containSupervisor == 1 && this.canFinalize==0 && this.choosenSupervisor==false) && this.selectedfromHome==false){
			if((this._service.erxCheck==0 ||this._service.erxCheck==1 )&& this.medicationObj.length>0)
		{
			
			return true;
		}
		if(this.prescriber_info.spis && this.prescriber_info.spis.length==0)
		{
			this.erxDisableTitle = "Please add spis in medical identifier for erx"
			return true
		}
		if(this.erxButton==false)
		{
			this.erxDisableTitle="Please do ID proofing for erx";
			return true;
		}
		if(this.isMediIdentider==0 && this.containSupervisor==0 && this.canFinalize==0){
			this.erxDisableTitle="Unautherize Access";
			
			return true;
		}
		if(this.tempData.basic_info && this.tempData.basic_info.epcs_status_id!=3)
		{
			this.erxDisableTitle="Please Accept Epcs for erx";
			return true;
		}
		this.erxDisableTitle="";
		return false;
		}else{
			if((this._service.erxCheck==0 ||this._service.erxCheck==1 )&& this.medicationObj.length>0)
			{
				
				return true;
			}
		}
	}
	onErxClick()
	{
		
			this._service.erxCheck=0;
			this.favMedicineData=[];
			this.medSearchType='erx';
			this.medicineData=[];
			if (this.containSupervisor == 1 && this.canFinalize==0 && this.choosenSupervisor==false) {
			this.getMedicalIdentifierData();
			}
		
	}
	onCompoundClick()
	{
		
			this._service.erxCheck=2;
			this.favMedicineData=[];
			this.medSearchType='erx';
			this.medicineData=[];
			if (this.containSupervisor == 1 && this.canFinalize==0 && this.choosenSupervisor==false) {
			this.getMedicalIdentifierData();
			}
		
	}
	onManualClick()
	{
			this._service.erxCheck=1;
			this.medicineData=[];
			this.favMedicineData=[];
			this.medSearchType='erx';
			if (this.containSupervisor == 1 && this.canFinalize==0 && this.choosenSupervisor==false) {
			this.getMedicalIdentifierData();
			}
		
	}
	getEpcsStatus(userId?)
	{
		this.loadSpin=true;
		this.requestService
		.sendRequest('user_epcs_status', 'get', REQUEST_SERVERS.erx_fd_api, {
			id:userId?userId:this.tempData.basic_info.id
		})
		.subscribe(async(res) => {
			this.loadSpin=false;
		let result= await res;
		this.tempData.basic_info.epcs_status_id=res.result.data.epcs_status_id;
		this.tempData.basic_info.epcs_status=res.result.data.epcs_status;
		localStorage.setItem('cm_data',JSON.stringify(this.tempData));
		},err=>{
			this.loadSpin=false;
		});
	}

	prescLogsActionRecords(status,action,response)
	{
		if (this._service.erxCheck != 2) {
			for (let i = 0; i < this._service.data.draftOrder.length; i++) {
				let body = {
					"med_id": response.data.draftOrder[i].medication.id,
					"status_id": status,
					"user_id": response.data.prescriber.id ? response.data.prescriber.id : this._service.data.prescriber.id,
					"action_id": action,
					"task_id": response.data.taskId ? response.data.taskId : response.taskid,
					"prescriber_id":response.data.prescriber.id ? response.data.prescriber.id : this._service.data.prescriber.id
				}
				this._service.data.draftOrder[i].medication['id'] = body['med_id'];
				this._service.prescriptionEventLogs(body).subscribe((response: any) => {
				});
			}
		}

		if (this._service.erxCheck == 2) {
	
				let body = {
					"status_id": status,
					"user_id": response.data.prescriber.id ? response.data.prescriber.id : this._service.data.prescriber.id,
					"action_id": action,
					"task_id": response.data.taskId ? response.data.taskId : response.taskid,
					"prescriber_id":response.data.prescriber.id ? response.data.prescriber.id : this._service.data.prescriber.id
				}
				this._service.prescriptionEventLogs(body).subscribe((response: any) => {
				});
			
		}
	}
		prescriptionsLogRecordEPCS(status,action){
        let data = {
          "status_id": status,
          "user_id": this.tempData.basic_info.id,
          "action_id": action,
          "prescriber_id":this.tempData.basic_info.id
        }
      
        this._service.prescriptionEventLogs(data).subscribe((response: any) => {
          
        });
    }
	prescriptionsLogRecordsIndex(status,action,index){
		if(this._service.erxCheck!=2){
		  let data;
		  if(index==-1){
			
			data = {
			  "status_id": status,
			  "user_id": this._service.data.prescriber.id,
			  "action_id": action,
			  "task_id": this._service.data && this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
			  "prescriber_id":this._service.data.prescriber.id
			}
		  }
		  else{
			data = {
			  "med_id": this._service.data.draftOrder[index].medication.id,
			  "status_id": status,
			  "user_id": this._service.data.prescriber.id,
			  "action_id": action,
			  "task_id": this._service.data && this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
			  "prescriber_id":this._service.data.prescriber.id
			}
		  }
			this._service.prescriptionEventLogs(data).subscribe((response: any) => {
			  
			});
		  
		  }
		  if (this._service.erxCheck == 2) {
			
			  let body = {
				"med_id": this._service.data.draftOrder[0].medication.compoundMedication[index].id,
				"status_id": status ,
				"user_id": this._service.data.prescriber.id,
				"action_id": action,
				"task_id": this._service.data &&  this._service.data.taskId ? this._service.data.taskId : this._service.taskid
			  }
			  this._service.prescriptionEventLogs(body).subscribe((response: any) => {
				
			  });
			
		  
		}
	  }
	difference(object, base) {
		return transform(object, (result, value, key) => {
			if (!isEqual(value, base[key])) {
				result[key] = isObject(value) && isObject(base[key]) ? this.difference(value, base[key]) : value;
			}
		});
	}

	getProofingStatus(user_id,checked?)
	{
		this.requestService
				.sendRequest(
					erx_url.license + 'user_id=' + user_id + '& license_status=1',
					'get',
					REQUEST_SERVERS.erx_fd_api,
				)
				.subscribe(async(response: any) => {
					if (
						response.result.data.length == 0 ||
						response.result.data[0].user_license_status.slug != 'active'
					) {
						this.erxButton = false;
					}
					else{
						this.erxButton = true;
					}
				});

	}
	
	daySupplyScheduleII(index)
	{
		if(this._service.erxCheck!=2){
		if(this.checkCIISchedule(index))
		{
			if(this.medicationObj[index].medication.daysSupply==null || this.medicationObj[index].daySupply==0){
				return true;
			}
			else
			{
				return false;
			}
		}
		else{
			return false;
		}
		}
		else if(this._service.erxCheck==2)
		{
			for(let i=0;i<this.medicationObj.length;i++)
			{
				if(this.checkCIISchedule(i))
				{
					return true;
				}	
			}
			return false;
		}
	}
	checkPatientDefaultPharmacy(patient)
	{
		if(patient && patient.pharmacy)
		{
			for(let k=0;k<patient.pharmacy.length;k++)
			{
				if(patient.pharmacy[k].default)
				{
					this.defaultPharmId=patient.pharmacy[k].pharmacy_id
				}
			}
		}
	}

	checkDisablity()
	{
		if(this._service.erxCheck!=1){
			if(this.medicationObj.length==0)
			{
				
				return true;
			}

			if(this.prescriber_info.spis && this.prescriber_info.spis.length==0)
			{
			this.buttonDisableTitle = "Please add spis in medical identifier for erx"
			return true
			}
			if(this.erxButton==false)
			{
			this.buttonDisableTitle="Please do ID proofing for erx";
			return true;
			}
			if(this.isMediIdentider==0 && this.containSupervisor==0 && this.canFinalize==0){
				this.buttonDisableTitle="Unautherize Access";
			
			return true;
		}
		if(this.tempData.basic_info && this.tempData.basic_info.epcs_status_id!=3)
		{
			this.buttonDisableTitle="Please Accept Epcs for erx";
			return true;
		}
		this.buttonDisableTitle="";
		return false;
		}
		
	}
	getMaxStartDate()
	{
		if(this._service.erxCheck!=2){
		if(this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode == 3 || this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode == 4) 
		{
			return this.maxDate;
		}
		else{
			
	
			return  this.infDate;
			 
		}
		
		}
		else if(this._service.erxCheck==2){
			for(let count=0;count<this.medicationObj.length;count++)
			{
			if(this.medicationObj[count].medication.rawMed.rawData.FederalDEAClassCode == 3 || this.medicationObj[count].medication.rawMed.rawData.FederalDEAClassCode == 4) 
			{
				return this.maxDate;
			}
			}
			return this.infDate;
		}
	
	}
	checkRefillAsNeed()
	{
		if(this._service.erxCheck!=2)
		{
			
			if(this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode==2 || this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode==3)
			{
				return true;
			}
			return false;
		}
		else if(this._service.erxCheck==2)
		{
			for(let k=0;k<this.medicationObj.length;k++)
			{
				if(this.medicationObj[k].medication.rawMed.rawData.FederalDEAClassCode==2 || this.medicationObj[k].medication.rawMed.rawData.FederalDEAClassCode==3)
			{
				return true;
			}
		

			}
			return false;
		}
		
	}

	checkRefill() {

		if (this._service.erxCheck != 2) {
			if (this.refillAsNeeded == true || this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode == 2 || this.medicationObj[this.selectedIndex].medication.refill == 99) {
				return true;
			}
			return false;
		}
		else if (this._service.erxCheck == 2) {
			for (let k = 0; k < this.medicationObj.length; k++) {
				if (this.refillAsNeeded == true || this.medicationObj[k].medication.rawMed.rawData.FederalDEAClassCode == 2 || this.medicationObj[this.selectedIndex].medication.refill == 99) {
					return true;
				}
			}
			return false;
		}

	}

	checkScheduleDrugs()
	{
		if(this._service.erxCheck!=2){
			if(this.medicationObj[this.selectedIndex] && this.medicationObj[this.selectedIndex].medication && this.medicationObj[this.selectedIndex].medication.rawMed && this.medicationObj[this.selectedIndex].medication.rawMed.rawData && this.medicationObj[this.selectedIndex].medication.rawMed.rawData.FederalDEAClassCode!='0')
			{
				return true;
			}
			return false;
		}
		else if(this._service.erxCheck==2){
			for(let m=0;m<this.medicationObj.length;m++)
			{
				if(this.medicationObj[m] && this.medicationObj[m].medication && this.medicationObj[m].medication.rawMed && this.medicationObj[m].medication.rawMed.rawData && this.medicationObj[m].medication.rawMed.rawData.FederalDEAClassCode!='0')
				{
					return true;
				}
			}
			return false;
		}

	}	
	onReplaceButton(){
		this.replaceCheck=true;
		if(this._service.erxCheck!=2){
			if(this.checkCIISchedule(this.selectedIndex)){
				if(parseInt(this.medicationObj[this.selectedIndex].medication.refill)>1){
					this.medicationObj[this.selectedIndex].medication.refill=1;
				}
			}
		}
		else if(this._service.erxCheck==2)
		{
			if(this.checkCIICompSchedule()){
				this.medicationObj[this.selectedIndex].medication.refill=1;
				
			}
		}

	}
	approveDisabilityCheck()
	{
		if(this.checkScheduleDrugs() && this.taskdetail && this.taskdetail.task && this.taskdetail.task.numType == 2)
		{
			this.approveDisableReason="Request can't be approved for controlled substances";
			return true
		}
		else if(this.taskdetail && this.taskdetail.task && this.taskdetail.task.numType == 2 && this.taskdetail.task.numStatus == 3)
		{
				if(this.taskdetail.medicationRequested[0].isMedicationChanged==1)
				{
					this.approveDisableReason="Request can't be approve due change in medication from pharmacy";
					
					return true;
				}
				else if(this.taskdetail.task.patientDetailStatusId)
				{
					if(this.taskdetail.task.patientDetailStatusId==1)
					{
						this.approveDisableReason="Request can't be approve due change in patient's First Name";
					}
					else if(this.taskdetail.task.patientDetailStatusId==2)
					{
						this.approveDisableReason="Request can't be approve due change in patient's Last Name";
					}
					else if(this.taskdetail.task.patientDetailStatusId==3)
					{
						this.approveDisableReason="Request can't be approve due change in patient's Gender";
					}
					else if(this.taskdetail.task.patientDetailStatusId==4)
					{
						this.approveDisableReason="Request can't be approve due change in patient's DOB";
					}
					else if(this.taskdetail.task.patientDetailStatusId==5)
					{
						this.approveDisableReason="Request can't be approve due change in patient's AddressLine1";
					}
					else if(this.taskdetail.task.patientDetailStatusId==6)
					{
						this.approveDisableReason="Request can't be approve due change in patient's City";
					}
					else if(this.taskdetail.task.patientDetailStatusId==7)
					{
						this.approveDisableReason="Request can't be approve due change in patient's stateProvince";
						
					}
					else if(this.taskdetail.task.patientDetailStatusId==8)
					{
						this.approveDisableReason="Request can't be approve due change in patient's Postal Code";

					}
					else if(this.taskdetail.task.patientDetailStatusId==9)
					{
						this.approveDisableReason="Request can't be approve due change in patient's Country Code";

					}
					else if(this.taskdetail.task.patientDetailStatusId==10)
					{
						this.approveDisableReason="Request can't be approve due to missing change in patient's Middle name";

					}
					else if(this.taskdetail.task.patientDetailStatusId==11)
					{
						this.approveDisableReason="Request can't be approve due to missing change in patient's Address Line2";

					}
					return true;
				}
				else{
					return false;
				}
		}
		else{
			return false;
		}
	}

	xyremMedCheck()
  	{
     if(this._service.erxCheck!=2)
     {
       if (this.medicationObj[this.selectedIndex].medication.rawMed.rawData['DefaultETCID'] == "5619") {
             return true;
        }
      } 
    }
	closeTMModal(){
		if(this.modalService.hasOpenModals())
    	{
      		this.modalService.dismissAll()
    	}
	}

	scrollToBottom(): void {
		try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }
        
                         
    }
	scrollToElement(el): void {
		this.myScrollContainer.nativeElement.scroll({
		  top: this.myScrollContainer.nativeElement.scrollHeight,
		  left: 0,
		  behavior: 'smooth'
		});
	  }
  
}
function ngAfterViewChecked() {
	throw new Error('Function not implemented.');
}

