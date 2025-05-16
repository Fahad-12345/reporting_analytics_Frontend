import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ErxService } from '@appDir/erx/erx.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { erx_url } from '../erx-url.enum'
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { LogInUrlsEnum } from '@appDir/pages/content-pages/login/logIn-Urls-Enum';
import { cloneDeep } from "lodash";
import { DocTypeEnum } from '@appDir/shared/signature/DocTypeEnum.enum';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-summary',
  templateUrl: './view-summary.component.html',
  styleUrls: ['./view-summary.component.scss']
})
export class ViewSummaryComponent implements OnInit {

  loadingBar: any = "0%";
  otpLoader: any;
  @Input() templateData: any;
  enableOtp: boolean = false;
  @Output() viewSummaryFun = new EventEmitter();
  reasonCodeValidate: any = []
  cancelValidate: any = ""
  printType = 1
  viewAlerts: any = {
    'draftOrder': false,
    'medicationPrescribed': false,
    'medicationDispensed': false,
    'medicationRequested': false,
    'previousMedicationPrescribed': false,
    'medicationDenied':false,
    'readySign': false
  }
  alertChecks: any = [];
  AllertsArray:any=[]
  AllertsArrayPrescribed:any=[]
  AllertsArrayDispensed:any=[]
  AllertsArrayRequested:any=[]
  AllertsArrayPrevPrescribed:any=[]
  AllertsArrayMedicationDenied:any=[]
  transactionId: any = "";
  payload: any;
  repeatQuery: any;
  disableTouch: any = true;
  pollingCount: any = 0;
  modalId: any;
  taskid: any = "";
  identification: any = ""
  effectiveDate: any = new Date()
  specialty: any = ""
  supervisor: any;
  isDeleted = 0
  taskdetail: any = "";
  optAuth: any = "";
  passAuth: any = "";
  rawSig: any = [];
  alertObj: any;
  redirectFrom: any = "";
  selectedReasonValue: any = ""
  selectedReasonValueValidate: any = ""
  presResponseReason: any = ""
  priorAuth: any = null
  isdeleted: any = 0;
  reasonCode: any = []
  disableCancel = false;
  disableControlled=false;
  disableNew=false;
  requireSign = false;
  supervisors: any;
  supervisor2: any;
  enableRX = true;
  enablePrint = true;
  printed = false;
  clickOrderRx = true;
  isPassAuth = false;
  userSpis: any;
  selectedSupervisor: any;
  tempData:any;
  readytoSignIndexes=[];
  readyCompound:boolean=false;
  compControlIndexes=[];
  refillSign:boolean=false;
  sendCount:number=0;
  loadSpin: boolean;
  selLocation: any;
  @ViewChild('printPdf') private printPdf: any;
  @ViewChild('contentAuthenticate') private contentAuthenticate: any;
  @ViewChild('contentAuthenticatetwo') private contentAuthenticatetwo: any;
  @ViewChild('contentAuthenticatethree') private contentAuthenticatethree: any;
  @ViewChild('contentDisclaimer') private contentDisclaimer: any;
  @ViewChild('contentDeleteDisclaimer') private contentDeleteDisclaimer: any;
  @ViewChild('contentOpt') private contentOpt: any;
  @ViewChild('contentOptTwo') private contentOptTwo: any;
  @ViewChild('contentOptThree') private contentOptThree: any;
  @ViewChild('contentPrescribeAuth') private contentPrescribeAuth: any;
  @ViewChild('SignatureModal') SignatureModal :ModalDirective;

  cancelReason="";
  orderReason="";

  closeResult: string;
  signCount: number;
  tempSupervisors: any;
  faciltyId: any;
  transmiited:boolean=false;
  disableConfirmPass:boolean=false;
  facilityLocationReq: boolean = false;
  tempAlerts:any=[];
  doctor_signature_listing: any[] = [];
  signatureUrl: any;
  closeModal: any;


  constructor(
    public sanitizer: DomSanitizer,
     private storageData: StorageData, 
     public toaster: ToastrService, 
     public _service: ErxService, 
     public _router: Router, 
     private modalService: NgbModal,
     public cdr: ChangeDetectorRef, 
     protected requestService: RequestService,
     private signatureService: SignatureServiceService
     ) {
    
  }

  constructorData()
  {

    if(this.templateData){
      this._service.taskid = this.templateData;
      this._service.data.task_list = true;
    }
      
      
      this.taskid = this._service.taskid?this._service.taskid :this._service.data.taskId?this._service.data.taskId:null;
      this._service.taskid = null
      this.tempData= JSON.parse(localStorage.getItem('cm_data'));
      this.redirectFrom = this._service.redirectfrom;
      if (this._service && this._service.data && this._service.data.task_list == true) {
  
  
        let body = { "taskId": this.taskid };
        
  
        
  
        this._service.taskdetail('', body).subscribe((response: any = []) => {
          
          this.transmiited=true;
          this.taskdetail = response.result.data;
          const scheduler:any = this.storageData.getSchedulerInfo();
        if(this._router.url.includes('template-manager') && scheduler &&  scheduler.template_instance && scheduler.template_instance.visitId){
  
          this.taskdetail['visit'].id=scheduler.template_instance.templateVisitId
          this.taskdetail['case'].id=scheduler.template_instance.case_id
          
        }
          
          
          this.taskid=this.taskdetail.task.id;
  
          // alerts check
  
          for(let p=0; this.taskdetail.medicationDispensed && p< this.taskdetail.medicationDispensed.length;p++)
          {
            this.AllertsArrayDispensed.push(cloneDeep(this.viewAlerts));
          }
  
          for(let p=0;this.taskdetail.medicationPrescribed && p< this.taskdetail.medicationPrescribed.length;p++)
          {
            this.AllertsArrayPrescribed.push(cloneDeep(this.viewAlerts));
          }
          
          for(let p=0;this.taskdetail.medicationRequested && p< this.taskdetail.medicationRequested.length;p++)
          {
            this.AllertsArrayPrescribed.push(cloneDeep(this.viewAlerts));
          }
  
          for(let p=0; this.taskdetail.previousMedicationPrescribed && p< this.taskdetail.medicationRequested.length;p++)
          {
            this.AllertsArrayPrevPrescribed.push(cloneDeep(this.viewAlerts));
          }
          
  
  
          if(this.taskdetail.prescriber && this.taskdetail.prescriber.address)
          {
            this.taskdetail.prescriber.addressLine1=this.taskdetail.prescriber.address.address;
            this.taskdetail.prescriber.addressLine2=this.taskdetail.prescriber.address.floor;
            this.taskdetail.prescriber.city=this.taskdetail.prescriber.address.city;
            this.taskdetail.prescriber.stateProvince=this.taskdetail.prescriber.address.state_object.code;
            this.taskdetail.prescriber.countryCode="US";	
            this.taskdetail.prescriber.postalCode=this.taskdetail.prescriber.address.zip;
            delete this.taskdetail.prescriber.address;
          }
          
          
          if(this.taskdetail.supervisor && this.taskdetail.supervisor.address)
          {
            this.taskdetail.supervisor.addressLine1=this.taskdetail.supervisor.address.address;
            this.taskdetail.supervisor.addressLine2=this.taskdetail.supervisor.address.floor;
            this.taskdetail.supervisor.city=this.taskdetail.supervisor.address.city;
            this.taskdetail.supervisor.stateProvince=this.taskdetail.supervisor.address.state_object.code;
            this.taskdetail.supervisor.countryCode="US";	
            this.taskdetail.supervisor.postalCode=this.taskdetail.supervisor.address.zip;
            delete this.taskdetail.supervisor.address;
          }
          
          if(this.taskdetail.previousMedicationPrescribed.length > 0){
            if(this.taskdetail.previousMedicationPrescribed[0] && this.taskdetail.previousMedicationPrescribed[0].compoundMedication)
            {
              this._service.erxCheck=2;
            }
            else{
              this._service.erxCheck=0;
            }
          }
          if(this.taskdetail.medicationPrescribed.length > 0){
            if(this.taskdetail.medicationPrescribed[0] && this.taskdetail.medicationPrescribed[0].compoundMedication)
            {
              this._service.erxCheck=2;
              
            }
            else{
              this._service.erxCheck=0;
            }
          }
          if(this.taskdetail.medicationRequested.length > 0){
            for(let j=0;j<this.taskdetail.medicationRequested.length;j++)
              {
                if(this.taskdetail.medicationRequested[j].scriptDate==null)
                {
                  this.taskdetail.medicationRequested[j].scriptDate=new Date();
                }
              }
  
            if(this.taskdetail.medicationRequested[0] && this.taskdetail.medicationRequested[0].compoundMedication)
            {
              
              this._service.erxCheck=2;
            }
            else{
              this._service.erxCheck=0;
            }
          }
          
  
  
          if((this.taskdetail.task.numType==1 ||this.taskdetail.task.numType==2) && this.taskdetail.task.action=='Denied')
          {
            this.taskdetail['medicationDenied']=cloneDeep(this.taskdetail.medicationRequested);
            if(this.taskdetail.task.numType==2){
              if(this._service.erxCheck!=2){
                for(let j=0;this.taskdetail.medicationDenied.length;j++)
                {
  
                  this.taskdetail.medicationDenied[j].refill=0;
                }
              }
              else if(this._service.erxCheck==2){
                this.taskdetail.medicationDenied[0].refill=0;
              }
          }
          }
        if(this.taskdetail.task)
        {
          
        }
        if( this.taskdetail.task && this.taskdetail.task.numType==3 && this.taskdetail.task.numStatus==3 )
        {
          if(!(this._service.readySigned==true && this._service.updated==false)){
            // ready signed check is added to not to check if not updated
            if (this._service.erxCheck != 2) {
              for (let i = 0; i < this.taskdetail.previousMedicationPrescribed.length; i++) {
                
                if (this.taskdetail.previousMedicationPrescribed[i].rawMed.rawData.FederalDEAClassCode != "0") {
                  this.enableRX = false;
                  this.readytoSignIndexes.push(i);
                }
              }
              
            }
            // ready signed check is added to not to check if not updated
            else if (this._service.erxCheck == 2) {
              for (let q = 0;this.taskdetail.previousMedicationPrescribed && this.taskdetail.previousMedicationPrescribed[0]  && this.taskdetail.previousMedicationPrescribed[0].compoundMedication &&  q<this.taskdetail.previousMedicationPrescribed[0].compoundMedication.length; q++) {
                
                if (this.taskdetail.previousMedicationPrescribed[0].compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
                  this.enableRX = false;
                  this.readyCompound=true; 
                  break;
                }
                }
                
            }
            
          }
        }
          this.disableCancel = this.taskdetail.pharmacy && !this.taskdetail.pharmacy.serviceLevels.some(e => e.name === 'Cancel')
          if(this.disableCancel)
          {
            this.cancelReason="Pharmacy doesn't support cancel";
            
          }
          else{
            this.cancelReason="";
          }
          this.disableControlled = this.taskdetail.pharmacy && !this.taskdetail.pharmacy.serviceLevels.some(e => e.name === 'ControlledSubstance')
          this.disableNew = this.taskdetail.pharmacy && !this.taskdetail.pharmacy.serviceLevels.some(e => e.name === 'New')
          if(this.disableControlled){
            this.orderReason="Pharmacy doesn't support Controlled Substances";
          }
          else if(this.disableNew){
            this.orderReason="Pharmacy doesn't support New Substances";
          }
          else{
            this.orderReason="";
          }
          if (this.taskdetail.task.numType == 5 || this.taskdetail.task.numType == 3) {
            this.loadSpin=true;
            this.requestService.sendRequest(erx_url.reason_code + '4', 'get', REQUEST_SERVERS.erx_fd_api)
            .subscribe(
                (response: any) => {
                  this.loadSpin=false;
                  this.reasonCode = response.result.data
                  this.selectedReasonValue = this.reasonCode[0].code
                },err=>{
                  this.loadSpin=false;
                });
          }
        });
  
       
  
      }
      else if (Object.keys(this._service.data).length !== 0) {
  
        this.taskdetail = this._service.data;
        const scheduler:any = this.storageData.getSchedulerInfo();
        if(this._router.url.includes('template-manager') && scheduler && scheduler.template_instance && scheduler.template_instance.visitId){
          this.taskdetail['visit'].id=scheduler.template_instance.templateVisitId
          this.taskdetail['case'].id=scheduler.template_instance.case_id
        }
        
        for(let p=0;p<this.taskdetail.draftOrder.length;p++)
          {
            this.AllertsArray.push(cloneDeep(this.viewAlerts));
          }
        
        
        //check ready to sign status before  checking any further
            
            
        if(!(this._service.readySigned==true && this._service.updated==false)){
            // ready signed check is added to not to check if not updated
            if (this._service.erxCheck != 2) {
              for (let i = 0; i < this.taskdetail.draftOrder.length; i++) {
                if (this.taskdetail.draftOrder[i].medication.rawMed.rawData.FederalDEAClassCode != "0") {
                  this.enableRX = false;
                  this.readytoSignIndexes.push(i);
                }
              }
              
            }
            // ready signed check is added to not to check if not updated
            else if (this._service.erxCheck == 2) {
              for (let q = 0;this.taskdetail.draftOrder && this.taskdetail.draftOrder[0].medication && this.taskdetail.draftOrder[0].medication.compoundMedication &&  q<this.taskdetail.draftOrder[0].medication.compoundMedication.length; q++) {
                
                if (this.taskdetail.draftOrder[0].medication.compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
                  this.enableRX = false;
                  this.readyCompound=true; 
                  break;
                }
                }
                
            }
            
      }else{
        if (this._service.erxCheck == 2) {
          for (let q = 0;this.taskdetail.draftOrder && this.taskdetail.draftOrder[0].medication && this.taskdetail.draftOrder[0].medication.compoundMedication &&  q<this.taskdetail.draftOrder[0].medication.compoundMedication.length; q++) {
            
            if (this.taskdetail.draftOrder[0].medication.compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
              this.enableRX = true;
              this.readyCompound=true; 
                this.requireSign = true;
  
              break;
            }
            }
            
        }
      }  
      }
      else {
        this.viewSummaryFun.emit(false)
      }
      console.log('draft ',this.taskdetail)
  }

  ngOnInit() {
    this.constructorData();
   if(!this._service.data.task_list)
   {
         this.getUserSpi();
   }
  }

  getAllSignatures() {
    if(this.facilityLocationReq) {
      this.toaster.error(`Facility location is required`, "Error");
      this.enablePrint=true;
      return;
    }
    this.loadSpin = true;
    this.signatureService
			.getSignature(parseInt(this.taskdetail?.prescriber?.id), DocTypeEnum.userSignature)
			.subscribe((data) => {
        this.loadSpin = false;
				this.doctor_signature_listing = data['result']['data'];
        if(this.doctor_signature_listing && this.doctor_signature_listing?.length) {
          this.SignatureModal.show();
        }
        else {
          this.print(false);
        }
			}, err => {
        this.loadSpin = false;
      });
  }

  onSkip() {
    this.signatureUrl = null;
    this.print(false);
  }

  onCancel() {
    this.SignatureModal.hide();
  }

  selectedUrlChange(url) {
    this.signatureUrl = url;
    this.print(false);
  }

  removeMedicine(index) {
    if (this.taskdetail.draftOrder[index].subTaskId) {
			this.deleteMed(
				this.taskdetail.draftOrder[index].subTaskId,
				this.taskdetail.draftOrder[index].medication.medDetailId,
				6,
				index,
			);
      this.prescriptionsLogRecordsIndex(1,9,index);
    }
    else{
      this.taskdetail.draftOrder.splice(index, 1);
      this.getAlertsSummary();
      for(let i=0;i<this.taskdetail.draftOrder.length;i++)
        {
          this.AllertsArray[i].draftOrder=false
        }
    }
    
    this.isDeleted = 1
  }

  deleteMed(subid, medid, presid, index) {
		let body = {
			subTaskId: subid,
			medDetailId: medid,
			prescriberId: presid,
		};
		this._service.taskmeddelete('', body).subscribe(
			(response: any = []) => {
        
      

				this.taskdetail.draftOrder.splice(index, 1);
        this.getAlertsSummary()
        for(let i=0;i<this.taskdetail.draftOrder.length;i++)
        {
          this.AllertsArray[i].draftOrder=false
        }
				// uncheck to be fixed later
				},
			(err) => {
				
			},
		);
	}


  getAlerts() {
    // PatientProfile to be added by the lahore api 
    // ScreenAllergens to be fecthed by the lahore api
    let object = {
      "PatientProfile": {
        "BirthDate": "1964-09-18",
        "PatientWeight": "210.5",
        "PatientWeightUnits": "Pounds",
        "Sex": "Male"
      },
      "ScreenDrugs": [],
      "ScreenAllergens": [
        {
          "AllergenID": "47703008",
          "AllergenConceptType": "SNOMED",
          "Reaction": "Rash"
        }
      ]
    }
    for (let i = 0; i < this.taskdetail.medicationPrescribed.length; i++) {
      object.ScreenDrugs.push({
        "Prospective": true,
        "DrugID": this.taskdetail.medicationPrescribed[i].rawMed.drugId,
        "DrugConceptType": "PackagedDrug",
      })
      if (this.taskdetail.medicationPrescribed[i].sig != '') {
        for (let j = 0; j < this.rawSig.length; j++) {
          if (this.taskdetail.medicationPrescribed[i].sig == this.rawSig[j].SigText) {
            object.ScreenDrugs[object.ScreenDrugs.length - 1] = {
              ...object.ScreenDrugs[object.ScreenDrugs.length - 1], ...{
                "DrugDose": {
                  "SingleDoseAmount": this.rawSig[j].LowDoseAmount,
                  "SingleDoseUnit": this.rawSig[j].DoseUnitDesc,
                  "DosingFrequencyInterval": this.rawSig[j].FrequencyShortDesc
                }
              }
            }
            break;
          }
        }
      }
    }
    this._service.getAlerts('', object).subscribe((res: any) => {
      
      this.alertObj = res.result.data;

    })
  }

  checkDuplicatesAlerts(index,screenMessage)
	{
		
		
		if (this.taskdetail.draftOrder[index].medication.alerts.some(e => e.screenMessage === screenMessage)) {
			/* vendors contains the element we're looking for */
			return false;
		  
		}
		return true;
		  
	}

	/// to be checked in the morning
	checkCompoundDuplicatesAlerts(index,screenMessage)
	{
		
		
		if (this.taskdetail.draftOrder[index].medication.alerts.some(e => e.screenMessage === screenMessage)) {
			/* vendors contains the element we're looking for */
			return false;
		  
		}
		return true;
		  
	}


  getDrugConceptType(medType) {
		return medType === 2 ? 'DispensableDrug' : 'PackagedDrug';
	}


  getAlertsSummary(sig?) {

    console.log('length',this.taskdetail.draftOrder.length)
		{	this.tempAlerts=[];
			for(let k=0;k<this.taskdetail.draftOrder.length;k++)
			{
				this.tempAlerts.push(cloneDeep(this.taskdetail.draftOrder[k].medication.alerts));
			}
			
		}
		// PatientProfile to be added by the lahore api
		// ScreenAllergens to be fecthed by the lahore api
		let object = {
			PatientProfile: {
				BirthDate: this.taskdetail.patient.dob,
				PatientWeight: this.taskdetail.patient.weight,
				PatientWeightUnits: 'Pounds',
				Sex: this.taskdetail.patient.gender=='male'?"Male":this.taskdetail.patient.gender=='female'?"Female":"Undifferentiated",
			},
			ScreenDrugs: [],
		};
		for (let i = 0; i < this.taskdetail.draftOrder.length; i++) {
			object.ScreenDrugs.push({
				Prospective: true,
				DrugID:this.taskdetail.draftOrder[i].medication.rawMed.drugId,
				DrugConceptType: this.getDrugConceptType(this.taskdetail.draftOrder[i].medication.rawMed.type),
			});
			if (
				this.taskdetail.draftOrder[i].medication.sig != '' &&
				this.taskdetail.draftOrder[i].medication.sig != null
			) {
				for (let j = 0;this.taskdetail.draftOrder &&this.taskdetail.draftOrder[i] && this.taskdetail.draftOrder[i].medication.rawSig && j<this.taskdetail.draftOrder[i].medication.rawSig.length; j++) {
					
					if (this.taskdetail.draftOrder[i].medication.sig == this.taskdetail.draftOrder[i].medication.rawSig[j].SigText) {
						object.ScreenDrugs[object.ScreenDrugs.length - 1] = {
							...object.ScreenDrugs[object.ScreenDrugs.length - 1],
							...{
								DrugDose: {
									SingleDoseAmount: this.taskdetail.draftOrder[i].medication.rawSig[j].LowDoseAmount,
									SingleDoseUnit: this.taskdetail.draftOrder[i].medication.rawSig[j].DoseUnitDesc,
									DosingFrequencyInterval: this.taskdetail.draftOrder[i].medication.rawSig[j].FrequencyShortDesc,
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
				for (let t = 0; t < this.taskdetail.draftOrder.length; t++) {
					this.taskdetail.draftOrder[t].medication.alerts = [];
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
					for (let m = 0; m < this.taskdetail.draftOrder.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.taskdetail.draftOrder[m].medication.rawMed.drugId ==
								this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								
								if(this.checkDuplicatesAlerts(m,this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenMessage)===true){
	
								
								this.taskdetail.draftOrder[m].medication.alerts.push({
									screenMessage: this.alertObj.DPTScreenResponse.DPTScreenResults[i].ScreenMessage,
									alertType: 'duplicatetherapy',
									reason: this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allReason:null,
									comment:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allComment: null,
									alertCheck:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?true:false
								});
								}
								this.alertChecks[m]['duplicatetherapy'] = true;
							}
						}
					}
				}
				
				//DDIScreenResponse
				for (let i = 0; i < this.alertObj.DDIScreenResponse.DDIScreenResults.length; i++) {
					for (let m = 0; m < this.taskdetail.draftOrder.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.taskdetail.draftOrder[m].medication.rawMed.drugId ==
								this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(m,this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenMessage)===true){
	
								this.taskdetail.draftOrder[m].medication.alerts.push({
									screenMessage: this.alertObj.DDIScreenResponse.DDIScreenResults[i].ScreenMessage,
									alertType: 'drugdruginteraction',
									severity: this.alertObj.DDIScreenResponse.DDIScreenResults[i].Severity,
									reason: this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allReason:null,
									comment:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allComment: null,
									alertCheck:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?true:false
								});
							}
								this.alertChecks[m]['drugdruginteraction'] = true;
							}
						}
					}
				}
				//DFIScreenResponse
				for (let i = 0; i < this.alertObj.DFIScreenResponse.DFIScreenResults.length; i++) {
					for (let m = 0; m < this.taskdetail.draftOrder.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.taskdetail.draftOrder[m].medication.rawMed.drugId ==
								this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(m,this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenMessage)===true){
								this.taskdetail.draftOrder[m].medication.alerts.push({
									screenMessage: this.alertObj.DFIScreenResponse.DFIScreenResults[i].ScreenMessage,
									alertType: 'drugfoodinteraction',
									reason: this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allReason:null,
									comment:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allComment: null,
									alertCheck:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?true:false
								});
								}
								this.alertChecks[m]['drugfoodinteraction'] = true;
							}
						}
					}
				}
				//DAScreenResponse
				for (let i = 0; i < this.alertObj.DAScreenResponse.DAScreenResults.length; i++) {
					for (let m = 0; m < this.taskdetail.draftOrder.length; m++) {
						for (
							let sd = 0;
							sd < this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs.length;
							sd++
						) {
							if (
								this.taskdetail.draftOrder[m].medication.rawMed.drugId ==
								this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenDrugs[sd].DrugID
							) {
								if(this.checkDuplicatesAlerts(m,this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenMessage)===true){
								this.taskdetail.draftOrder[m].medication.alerts.push({
									screenMessage: this.alertObj.DAScreenResponse.DAScreenResults[i].ScreenMessage,
									alertType: 'drugallergyinteraction',
									reason: this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allReason:null,
									comment:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?this.taskdetail.draftOrder[m].medication.allALertCheck.allComment: null,
									alertCheck:this.taskdetail.draftOrder[m] &&  this.taskdetail.draftOrder[m].medication && this.taskdetail.draftOrder[m].medication.allALertCheck.check?true:false
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
							this.taskdetail.draftOrder[i].medication.alerts.push({
								screenMessage:
									this.alertObj.MinMaxScreenResponse.MinMaxScreenResults[i].DoseThresholdResult
										.ScreenMessage,
								alertType: 'other',
								reason: this.taskdetail.draftOrder[i] &&  this.taskdetail.draftOrder[i].medication && this.taskdetail.draftOrder[i].medication.allALertCheck.check?this.taskdetail.draftOrder[i].medication.allALertCheck.allReason:null,
								comment:this.taskdetail.draftOrder[i] &&  this.taskdetail.draftOrder[i].medication && this.taskdetail.draftOrder[i].medication.allALertCheck.check?this.taskdetail.draftOrder[i].medication.allALertCheck.allComment: null,
								alertCheck:this.taskdetail.draftOrder[i] &&  this.taskdetail.draftOrder[i].medication && this.taskdetail.draftOrder[i].medication.allALertCheck.check?true:false
							});
							}
							this.alertChecks[i]['other'] = true;
						}
				}

				{
					for(let count=0;count<this.taskdetail.draftOrder.length;count++)
					{
						for(let k=0;this.taskdetail.draftOrder[count].medication && this.taskdetail.draftOrder[count].medication.alerts && k<this.taskdetail.draftOrder[count].medication.alerts.length;k++)
						{
							let alert=this.taskdetail.draftOrder[count].medication.alerts[k];
							
							for(let m=0;m<this.tempAlerts[count].length;m++)
							{
								
								if(this.tempAlerts[count][m].screenMessage==alert.screenMessage)
								{
									
									
									this.taskdetail.draftOrder[count].medication.alerts[k]=cloneDeep(this.tempAlerts[count][m]);
									this.cdr.detectChanges();
									break;
								}
							}

						}
						
					}
					
				}
			}
			
			
			},err=>{
				this.loadSpin=false;
			});
		}
	}

  


  openCancelRX(contentCancel)
  {
    this.modalService.open(contentCancel, { size: 'sm' }).result.then((result) => {
      if (result == 'Close click') {
        this.cancelValidate="";
      }});
  }
  
  cancelRX() {
    if (this.cancelValidate == "") {
      this.toaster.error('Empty reason is not allowed.', 'Error')
    } else {
      let body = {
        "taskId": this.taskdetail.task.id,
        "orderId": this.taskdetail.task.orderId,
        "messageId": this.taskdetail.task.messageId,
        "medication": this.taskdetail.medicationPrescribed[0]?this.taskdetail.medicationPrescribed[0]:this.taskdetail.medicationRequested[0],
        "pharmacy": this.taskdetail.pharmacy,
        "patient": this.taskdetail.patient,
        "prescriber": this.taskdetail.prescriber,
        "case": {
          "id": this.taskdetail.case.id
        },
        "visit": {
          "id": this.taskdetail.visit.id
        },
        "validate": {
          "prescriberResponseReason": this.cancelValidate,
        },
        "facility_location_id":this.taskdetail.task.facility_location_id,
      }
      
      // delete height_ft and height_in for body
      
    if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
			&& this.tempData.role.medical_identifier==1)
			{
			  body['supervisor']=this.taskdetail.supervisor;
			}
      body.patient['height_ft']=1;
      body.patient['height_ft']=1;
      delete body.patient.height_ft;  
      delete body.patient.height_in;
      this.loadSpin=true;
      this._service.cancelRx(body).subscribe((response: any = []) => {
      this.loadSpin=false;
      this.toaster.success(response.message, 'Success')
      this.viewSummaryFun.emit(false);
      if(this._router.url.includes('template-manager')){
        this.toaster.warning("A cancellation request is submitted to the pharmacy; if it is acknowledged, the cancellation will be processed.", 'Warning')
        if(this.modalService.hasOpenModals()){
          this.modalService.dismissAll('success')
        }
      }
      else {
        if(this.modalService.hasOpenModals()){
          this.modalService.dismissAll()
        }
      }
      },err=>{
        this.loadSpin=false;
      });
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
  sendERX(check?) {
    
      this.enablePrint = false;
      this.clickOrderRx = false;
      this.loader();
      this.enableOtp = false;

      if (this._service.action == 'replace') {
        this.replaceERX(this.contentOpt, check);
      }
      else {
        this.modalId = this.contentOpt;
        this.taskdetail.patient.addressLine2 == "" && delete this.taskdetail.patient.addressLine2
        // Converting medication quantity to string
       
        if (this.taskdetail.draftOrder) {
          for (let i = 0; i < this.taskdetail.draftOrder.length; i++) {
            this.taskdetail.draftOrder[i].medication.quantity = this.taskdetail.draftOrder[i].medication.quantity.toString()
            // fav id is deleted in case of favourite medicines
            if(this.taskdetail.draftOrder[i].favId || this.taskdetail.draftOrder[i].favId==null)
            {
              delete this.taskdetail.draftOrder[i].favId;
            }
          }
        }

        const scheduler:any = this.storageData.getSchedulerInfo();
        
        

        
        
     
        let body = {
          "draftOrder": this.taskdetail.draftOrder,
          "patient": this.taskdetail.patient,
          "prescriber": this.taskdetail.prescriber,
          "case": {
            "id": !this.taskdetail.case ? null : this.taskdetail.case.id
          },
          "visit": {
            "id": !this.taskdetail.visit ? null : this.taskdetail.visit.id
          },
          "facility_location_id":this.faciltyId,
          "taskId": this.taskdetail.taskId
        }
        delete body.patient.height_ft;
        delete body.patient.height_in;
        

        
        if(this._service.erxCheck!=2)
        {
          for(let j=0;j<body.draftOrder.length;j++)
          {
           if(body.draftOrder[j] && body.draftOrder[j].medication && body.draftOrder[j].medication.compoundMedication){
            delete body.draftOrder[j].medication.compoundMedication;
           }
          }
        }
        const tempData= JSON.parse(localStorage.getItem('cm_data'));
        if(tempData.role.can_finalize==1 && tempData.role.has_supervisor==1)
        {
          if(this.taskdetail.supervisor==null)
          {
            this.toaster.error('Please select a supervisor before orderRx',"Error");
            this.clickOrderRx = true;
            this.enablePrint=true;
            return;
          }
          else{
            if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1)
      {
      let superCheck=false;
        if(this.taskdetail.supervisor.dean==null)
        {
          this.toaster.error('Supervisors DEA is Required for Erx','Error');
          this.clickOrderRx = true;
          this.enablePrint=true;
          superCheck=true;
        }
        if(this.supervisor2.epcs_status.id!=3)
        {
        this.toaster.error('Supervisors EPCS is not Accepted','Error');
        this.clickOrderRx = true;
        this.enablePrint=true;
        superCheck=true;
        }
        if(this.supervisor2.proofing_status!=1){
          this.toaster.error('Supervisors id proofing is required for Erx','Error');
          this.clickOrderRx = true;
          this.enablePrint=true;
          superCheck=true;
        }
        if(superCheck==true)
        {
          return;
        }
    }

            body['supervisor']=this.taskdetail.supervisor;
          }
        }
        if(this.taskdetail.prescriber.spi==null || this.taskdetail.prescriber.spi=='')
        {
          this.toaster.error(`Facility location is required`, "Error");
          this.clickOrderRx=true;
          return;
        }
        if(this._service.erxCheck==2){
          body["isCompoundMed"]=true;
        }
        let optC = false;
        this.signCount=0;
        if (this._service.erxCheck == 2) {
          for (let q = 0; !check && this.taskdetail.draftOrder && q < this.taskdetail.draftOrder[0].medication.compoundMedication.length; q++) {
            if (this.taskdetail.draftOrder[0].medication.compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
              optC = true
             this.signCount+=1;
            }
          }
        }
        else {
          for (let q = 0; !check && this.taskdetail.draftOrder && q < this.taskdetail.draftOrder.length; q++) {
            if (this.taskdetail.draftOrder[q].medication.rawMed.rawData.FederalDEAClassCode != '0') {
              optC = true
              this.signCount+=1;
            }
          }
        }
        if (optC) {
          // Hit api here
          // This is of the polling
          body['isPushNotification'] = true;
          this.disableTouch = true;
          this.sendErxAfterOptCheck(body);
          this.clickOrderRx = true;
          this.optAuth="";
          this.modalService.open(this.contentOpt, { size: 'lg' }).result.then((result) => {
            if (result == 'Save click') {
              if (body['isPushNotification']) {
                delete body['isPushNotification'];
                body['otpCode'] = this.optAuth;
                this.sendErxAfterOptCheck(body);
              }
              // event logs for signed single action=5 for success scnerio
              
              
            } else {
              
              return;
            }
          });

        } else {
          this.sendErxAfterOptCheck(body);
        }
      }
    
  }

  StartPushNotification()
  {
      let body = {
        "draftOrder": this.taskdetail.draftOrder,
        "patient": this.taskdetail.patient,
        "prescriber": this.taskdetail.prescriber,
        "case": {
          "id": !this.taskdetail.case ? null : this.taskdetail.case.id
        },
        "visit": {
          "id": !this.taskdetail.visit ? null : this.taskdetail.visit.id
        },
        "taskId": this.taskdetail.taskId
      }
      body['isPushNotification'] = true;
      this.disableTouch = true;
      this.enableOtp=false;
      this.loader();
      this.sendErxAfterOptCheck(body);
  }


  StartPushNotificationRefill()
  {
      let body = {
        "draftOrder": this.taskdetail.draftOrder,
        "patient": this.taskdetail.patient,
        "prescriber": this.taskdetail.prescriber,
        "case": {
          "id": !this.taskdetail.case ? null : this.taskdetail.case.id
        },
        "visit": {
          "id": !this.taskdetail.visit ? null : this.taskdetail.visit.id
        },
        "taskId": this.taskdetail.taskId
      }
      body['isPushNotification'] = true;
      this.disableTouch = true;
      this.enableOtp=false;
      this.loader();
      this.sendErxAfterOptCheck(body);
  }
  passwordAuthentication(contentOpt, check?) {
    this.disableConfirmPass=true;
    let auth = {
      confirm_password: this.passAuth
    }
    this.loadSpin=true;
    this.requestService.sendRequest(LogInUrlsEnum.confirmPassword, 'POST', REQUEST_SERVERS.erx_fd_api, auth).subscribe((res: any) => {
      this.loadSpin=false;
      if (res.status) {
          contentOpt.close('Close click')
        this.sendCount=0;
        this.disableConfirmPass=false;
        this.sendERX(check);
        
      }
      
    }, err => {
      this.loadSpin=false;
      this.disableConfirmPass=false;
      this.passAuth="";
      // 
    });


  }

  
  
  passwordAuthenticationRefill(contentOpt, check?) {
    this.disableConfirmPass=true;
    let auth = {
      confirm_password: this.passAuth
    }
    this.loadSpin=true;
    this.requestService.sendRequest(LogInUrlsEnum.confirmPassword, 'POST', REQUEST_SERVERS.erx_fd_api, auth).subscribe((res: any) => {
      this.loadSpin=false;
      if (res.status) {
        contentOpt.close('Close click')
        this.sendCount=0;
        this.disableConfirmPass=false;
        this.sendRequestERx();
       
        
      }
      
    }, err => {
      this.loadSpin=false;
      this.disableConfirmPass=false;
      this.passAuth="";
      // 
    });


  }
  polling() {
    this.repeatQuery = setInterval(() => {
      this.query();
    }, 7000);
  }
  checkReadySignCount()
  {
    this.signCount=0;
        //option c needs to be checked
        for (let q = 0; this.taskdetail.draftOrder && q < this.taskdetail.draftOrder.length; q++) {
          if (this.taskdetail.draftOrder[q].medication.rawMed.rawData.FederalDEAClassCode != '0') {
            this.signCount+=1;
          }
        }
        if(this.signCount==1)
        {
          this._service.neededReadySign=1;
        }
        else if(this.signCount>1)
        {
          this._service.neededReadySign=2;
        }
      
  }
  checkControlMedIndex()
  {
    for (let q = 0;this.taskdetail.draftOrder && this.taskdetail.draftOrder[0].medication && this.taskdetail.draftOrder[0].medication.compoundMedication &&  q<this.taskdetail.draftOrder[0].medication.compoundMedication.length; q++) {
      if (this.taskdetail.draftOrder[0].medication.compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
        this.compControlIndexes.push(q);
      }
      }
  }
  isReadyToSign(index) {
    
    if(this.taskdetail.task && this.taskdetail.task.status=="Incomplete"){
      this.refillSign=!this.refillSign;
    }
    else{
      if(this._service.erxCheck!=2){
        if(this.signCount==null || this.signCount==0)
        {
          this.checkReadySignCount();
        }
      const rIndex = this.readytoSignIndexes.indexOf(index);
      if (rIndex > -1) {
        this.readytoSignIndexes.splice(rIndex, 1); // 2nd parameter means remove one item only
        if(this.readytoSignIndexes.length==0)
        {
          this._service.readySigned=true;
          if(this.signCount==1)
          {
            this.prescriptionsLogRecordsIndex(1,4,index);  
          }
          else if(this.signCount>1){
            this.prescriptionsLogRecordsIndex(1,4,index);  
          this.prescriptionsLogRecordsIndex(1,10,-1);
          }
        }else{
          this.prescriptionsLogRecordsIndex(1,4,index);
        }
      }
      else{
        this.readytoSignIndexes.push(index);
        this._service.readySigned=false;
        if(this.readytoSignIndexes.length==1)
        {
          if(this.signCount==1)
          {
            this.prescriptionsLogRecordsIndex(2,4,index);
          }
          else if(this.signCount>1){
            this.prescriptionsLogRecordsIndex(2,4,index);
            this.prescriptionsLogRecordsIndex(2,10,-1);
          }
        }
        else{
          this.prescriptionsLogRecordsIndex(2,10,-1);
        }
      }
      }
      else if(this._service.erxCheck==2){
        if(this.compControlIndexes.length==0)
        {
          this.checkControlMedIndex();
        }
        this.requireSign = !this.requireSign;
        // compound med only calls for 1 time without medId
        if (this.requireSign == true) {
          this.enableRX = true;
          {
            this._service.readySigned=true;
            this.prescCompoundRecord(1,4);
          }
        }
        if (this.requireSign == false) {
          {
            this._service.readySigned=true;
            this.prescCompoundRecord(2,4);
          }
          this.enableRX = false;
        }
      }
    }
    
  }
  query() {
    if (this.pollingCount <= 17 && this.transactionId) {
      const body = {
        "userRef": JSON.parse(localStorage.getItem('cm_data')).user_id,
        "transaction": this.transactionId
      }
      this._service.query(body)
        .subscribe(
          (response: any) => {
            this.pollingCount += 1;
            if (response.status == 200 && response.result.data.pending == 'false') {
              if(this.sendCount==0){
                this.sendCount=this.sendCount+1;
              if (this.payload.draftOrder) {
                for (let i = 0; i < this.payload.draftOrder.length; i++) {
                  if (response.result.data[this.payload.draftOrder[i].msgId]) {
                    this.payload.draftOrder[i].signature = response.result.data[this.payload.draftOrder[i].msgId];
                  }
                }
              }
              else {
                if (response.result.data[this.payload.msgId]) {
                  this.payload.signature = response.result.data[this.payload.msgId];
                }
              }
              if(!this.taskdetail.task || (this.taskdetail.task && this.taskdetail.task.numStatus!=3)){
              if(this._service.erxCheck!=2){
                  if(this.signCount==1)
                  {
                    this.prescriptionsLogRecords(1,5)
                  }
                  else if(this.signCount>1){
                    this.prescriptionsLogRecordsIndex(1,12,-1);
                  }
                }
                else if(this._service.erxCheck==2)
                {
                  this.prescriptionsLogRecords(1,5)
                }
              }
              this.pollingCount = 0;
              if(this.taskdetail.task && this.taskdetail.task.numType==3 &&  this.taskdetail.task.numStatus==3)
              {
                this.sendValidateAfterOtpCheck(this.payload);
              }
              else{
                if (this._service.action == 'replace') {
                  this.sendReplaceAfterOptCheck(this.payload)
                }
                else if (this._service.action == 'approveRx'){
                  this.sendApproveRxAfterOptCheck(this.payload);
                }
                else if (this._service.action == 'approveChangeRx'){
                  this.sendApproveChangeRxAfterOptCheck(this.payload);
                }
                else {
                  this.sendErxAfterOptCheck(this.payload);
                }
              }
              clearInterval(this.repeatQuery);
              this.loadingBar = "0%";
              this.repeatQuery = null;
              this.modalService.dismissAll()
            }
           
            }
            if (response.status == 200 && response.result.data.pending == 'expired') {
              this.pollingCount = 0;
              clearInterval(this.otpLoader);
              this.clickOrderRx = true;
              this.enableOtp=true;
              clearInterval(this.repeatQuery);
              this.loadingBar = "0%";
              this.repeatQuery = null;
              this.disableTouch = false;
              this.transactionId = null;
              this.toaster.error(response.message, "Error")
            }
          }
        )
    }
    else {
      this.cancelQuery();
    }
  }
  twoFactorAuthERX(check?) {
    
    
    if(check)
    {
      this.sendERX(check);
    }
    else{
      if(this.taskdetail.prescriber.spi==null || this.taskdetail.prescriber.spi=='')
        {
          this.toaster.error(`Facility location is required`, "Error");
          this.clickOrderRx=true;
          return;
        }
      if (this._service.erxCheck != 2) {
        if(this.readytoSignIndexes.length>0 && !(this._service.updated==false && this._service.readySigned ==true))
        {
          for(let i=0;i<this.readytoSignIndexes.length;i++){
             
              this.toaster.error(
                `Please Accept ready to sign for the ${this.taskdetail.draftOrder[this.readytoSignIndexes[i]].medication.rawMed.drugName} medicine`,
                'Error',
              );

            }
              return;
          
        }
         // check for nadean
        for(let i=0;i<this.taskdetail.draftOrder.length;i++)
           {
              if (this.taskdetail.draftOrder[i].medication.rawMed.rawData['DefaultETCID'] == "571" && this.taskdetail.prescriber.nadean==null || this.taskdetail.prescriber.nadean == ''){
                this.toaster.error(`Prescriber's Nadean is required for  ${this.taskdetail.draftOrder[i].medication.rawMed.drugName} Medicine!`, "Error");
                this.clickOrderRx = true;
                this.enablePrint=true;
                return;
                
              }
              if (this.taskdetail.draftOrder[i].medication.rawMed.rawData['DefaultETCID'] == "571" && this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 && this.taskdetail.supervisor!=null ){
               if(this.taskdetail.supervisor.nadean==null || this.taskdetail.supervisor.nadean == '')
                {
                  this.toaster.error(`Supervisor's Nadean is required for  ${this.taskdetail.draftOrder[i].medication.rawMed.drugName} Medicine!`, "Error");
                  this.clickOrderRx = true;
                  this.enablePrint=true;
                  return;
                }
                
              }
          }
        
        let optC = false;
        this.signCount=0;
        //option c needs to be checked
        for (let q = 0; !check && this.taskdetail.draftOrder && q < this.taskdetail.draftOrder.length; q++) {
          if (this.taskdetail.draftOrder[q].medication.rawMed.rawData.FederalDEAClassCode != '0') {
            optC = true
            this.signCount+=1;
          }
        }
        
        if (optC) {
          
         this.checkSupervisor();
        }
        else {
          this.sendERX(check);
        }
      }
      else if(this._service.erxCheck==2)
      {
        if(this.readyCompound==true){
        if (this.requireSign == false) {
                    this.toaster.error(
              `Please Accept ready to sign compound medicine`,
              'Error',
            );
          
          return;
        }
        // check for nadean
        for(let i=0;this.taskdetail.draftOrder && this.taskdetail.draftOrder[0] && this.taskdetail.draftOrder[0].medication && this.taskdetail.draftOrder[0].medication.compoundMedication &&  i<this.taskdetail.draftOrder[0].medication.compoundMedication.length;i++)
           {
              if (this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.rawData['DefaultETCID'] == "571" && this.taskdetail.prescriber.nadean==null || this.taskdetail.prescriber.nadean == ''){
                this.toaster.error(`Prescriber's Nadean is required for  ${this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.drugName} Medicine!`, "Error");
                this.clickOrderRx = true;
                this.enablePrint=true;
                return;
                
              }
              if (this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.rawData['DefaultETCID'] == "571" && this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 && this.taskdetail.supervisor!=null){
                if(this.taskdetail.supervisor.nadean==null || this.taskdetail.supervisor.nadean == ''){
                this.toaster.error(`Supervisor's Nadean is required for  ${this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.drugName} Medicine!`, "Error");
                this.clickOrderRx = true;
                this.enablePrint=true;
                return;
                }
                
              }
              
          }
        let optC = false;
        //option c needs to be checked
        for (let q = 0;this.taskdetail.draftOrder && this.taskdetail.draftOrder[0].medication && this.taskdetail.draftOrder[0].medication.compoundMedication &&  q<this.taskdetail.draftOrder[0].medication.compoundMedication.length; q++) {
          if (this.taskdetail.draftOrder[0].medication.compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
            optC = true; 
            break;
          }
          }
        
        if (optC) {
          
          
          this.checkSupervisor();

          
        }
        }
        else {
          this.sendERX(check);
        }
      }
    }
  }

  cancelQuery() {
    
    clearInterval(this.otpLoader);
    this.clickOrderRx = true;
    this.enablePrint=true;
    this.loadingBar = "0%";
    this.enableOtp = true;
    clearInterval(this.repeatQuery);
    if (this.transactionId) {
      const body = {
        "userRef": JSON.parse(localStorage.getItem('cm_data')).user_id,
        "transaction": this.transactionId
      }
      this._service.cancelQuery(body)
        .subscribe(
          (response: any) => {
            this.disableTouch = false;
          }
        )
    }
    
    this.loadingBar = "0%";
    this.pollingCount = 0;
    this.repeatQuery = null;
    this.transactionId = null;
  }


  sendErxAfterOptCheck(body) {
    if(this.faciltyId){
      body['facility_location_id']=this.faciltyId;
    }


    let tempTaskDetailsERXAPi=cloneDeep(body);
    
    
    if (this.isDeleted == 1) {
      tempTaskDetailsERXAPi['isDeleted'] = 1
    }
    if (tempTaskDetailsERXAPi.taskId == null || tempTaskDetailsERXAPi.taskId == "") {
      delete tempTaskDetailsERXAPi['taskId']
    }
    if (this.taskdetail.draftOrder.length != 0) {
      delete tempTaskDetailsERXAPi.task
     this.loadSpin=true;
      this._service.senderx('', tempTaskDetailsERXAPi).subscribe((response: any = []) => {
        this.loadSpin=false;
        if (tempTaskDetailsERXAPi['isPushNotification'] && !tempTaskDetailsERXAPi['isSignature']) {
          this.transactionId = response.result.data.transaction;
          this.payload = response.result.data.payload;
          this.polling();
        }

        if (response.status == 200 && !response.result.data.transaction) {
          
          if(tempTaskDetailsERXAPi.otpCode){
            if(this._service.erxCheck!=2){
              if(this.signCount==1)
              {
                this.prescriptionsLogRecords(1,5)
              }
              else if(this.signCount>1){
                this.prescriptionsLogRecordsIndex(1,12,-1);

              }
            }
            else if(this._service.erxCheck==2){
              this.prescriptionsLogRecords(1,5)
              
            }
          }
          else{
            if(this._service.erxCheck!=2){
              if(this.signCount==1)
              {
              }
              else if(this.signCount>1){
              }
            }
            else if(this._service.erxCheck==2){
              
              
            }
        }
         

          this.toaster.success(response.message, 'Success');
          if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
          else this._router.navigate([this._router.url.replace('/prescribe', '')])
          if(this._router.url.includes('template-manager')){
            if(this.modalService.hasOpenModals()){
              this.modalService.dismissAll()
            }
          }
        }

        else if (response.status !== 200) {
          
        

          this.toaster.error(response.message, 'Error');
        }
      },(error)=>{
        this.loadSpin=false;
        if(error.error.message=='OTP fail: Please enter a valid OTP Code'){

          this.prescriptionsLogRecords(2,5);
        }
        else{
        }
      });
    }
    else {
      this.toaster.error('No Medication Selected', 'Error');
    }
  }

  

  taskDelete() {
    let body = { "taskId": this.taskid, "visit": { "id": this.taskdetail.visit.id } };
    this._service.taskdelete('', body).subscribe((response: any = []) => {
      
      if (response.status == 200) {
        this.viewSummaryFun.emit(false)
                let data = {
            "status_id": 1,
            "user_id": this.taskdetail.prescriber.id,
            "action_id": 8,
            "task_id": this.taskdetail.task.id,
            "prescriber_id": this.taskdetail.prescriber.id
          }



          this._service.prescriptionEventLogs(data).subscribe((response: any) => {
          
          });
        
        this.toaster.success('Deleted Successfully', 'Success');
  

        if(this._router.url.includes('template-manager')){
          if(this.modalService.hasOpenModals()){
            this.modalService.dismissAll()
          }
        }

      }
    }, err => {
      
    });
  }
  RequestErx(contentOpt,check?){
    
    

    
      this.modalId = contentOpt;
  
      let optC = false
      if(this._service.erxCheck!=2){
        if (this._service.actionObj.medication.rawMed.rawData.FederalDEAClassCode != '0' && !check) {
        optC = true;
        }
      }
      if (this._service.erxCheck == 2) {
        for (let q = 0; !check && this._service.actionObj.draftOrder &&  this._service.actionObj.draftOrder[0] && q < this.taskdetail.draftOrder[0].medication.compoundMedication.length; q++) {
          if (this.taskdetail.draftOrder[0].medication.compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
            optC = true;
          }
        }
      }
      if (optC) {
        // Hit api here
        // This is of the polling
        if(this.refillSign==false)
        {
          this.toaster.error(
                      `Please Accept ready to sign for the medicine`,
                      'Error',
                    )
                    return;
        }
        
        this.modalService.open(this.contentDisclaimer,{ 
          size: 'lg',
          backdrop: 'static',
          keyboard: false }).result.then((result)=>{
            if (result == 'Save click') {
            this.modalService.open(this.contentAuthenticatethree, { 
              size: 'sm',
              backdrop: 'static',
              keyboard: false }).result.then((result) => {
            });
          }
          })
      
        
      } else {
        this.disableTouch = true;
        if(this._service.action=='replace'){
          this.sendReplaceAfterOptCheck(this._service.actionObj);
          }
        else if(this._service.action=='approveChangeRx')
        {
          this.sendApproveChangeRxAfterOptCheck(this._service.actionObj); 
        }
        else if (this._service.action == 'approveRx')
        {
          this.sendApproveRxAfterOptCheck(this._service.actionObj);
        }
      }
    
  }

  
  replaceERX(body,contentOpt, check?) {
    this.modalId = contentOpt;
    
    let optC = false
    if (body.medication.rawMed.rawData.FederalDEAClassCode != '0' && !check) {
      optC = true;
      if(this.readytoSignIndexes.length>0)
        {
          for(let i=0;i<this.readytoSignIndexes.length;i++){
             
              this.toaster.error(
                `Please Accept ready to sign for the ${this.taskdetail.draftOrder[this.readytoSignIndexes[i]].medication.rawMed.drugName} medicine`,
                'Error',
              );

            }
              return;
          
        }
    }
    if (optC) {
      // Hit api here
      // This is of the polling
      this.modalService.open(this.contentDisclaimer,{ 
        size: 'lg',
        backdrop: 'static',
        keyboard: false }).result.then((result)=>{
          if (result == 'Save click') {
          this.modalService.open(this.contentAuthenticatetwo, { 
            size: 'sm',
            backdrop: 'static',
            keyboard: false }).result.then((result) => {
          });
        }
        })
    
      
    } else {
      this._service.actionObj['isPushNotification'] = true;
      this.disableTouch = true;
     
    }
  }
  
  sendRequestERx()
  {
    this.enablePrint = false;
      this.clickOrderRx = false;
      this.loader();
      this.enableOtp = false;
      this._service.actionObj['isPushNotification'] = true;
      this.disableTouch = true;
      if(this._service.action=='replace'){
      this.sendReplaceAfterOptCheck(this._service.actionObj);
      }
      else if (this._service.action == 'approveChangeRx')
      {
        this.sendApproveChangeRxAfterOptCheck(this._service.actionObj);
      }
      else if (this._service.action == 'approveRx')
      {
        this.sendApproveRxAfterOptCheck(this._service.actionObj);
      }
      this.optAuth="";
      this.modalService.open(this.contentOptThree, { size: 'lg' }).result.then((result) => {
        if (result == 'Save click') {
          if (this._service.actionObj['isPushNotification']) {
            delete this._service.actionObj['isPushNotification'];
          }
          this._service.actionObj['otpCode'] = this.optAuth
             if(this._service.action=='replace'){
            this.sendReplaceAfterOptCheck(this._service.actionObj);
            }
            else if (this._service.action == 'approveChangeRx')
            {
              this.sendApproveChangeRxAfterOptCheck(this._service.actionObj);
            }
            else if (this._service.action == 'approveRx')
            {
                this.sendApproveRxAfterOptCheck(this._service.actionObj);
            }

        } else {
          return;
        }
      });
  }

  

  sendApproveChangeRxAfterOptCheck(body) {
    let payloadbody=cloneDeep(body);
    if(this._service.erxCheck==2){
      if(payloadbody.isCompoundMed){
        delete payloadbody.isCompoundMed;
      }
      if(payloadbody.draftOrder){
        payloadbody.medication=payloadbody.draftOrder[0].medication;
        delete payloadbody.draftOrder;
      }

      for(let k=0;payloadbody.medication && payloadbody.medication.compoundMedication && k<payloadbody.medication.compoundMedication.length;k++)
      {
        if(payloadbody.medication &&  payloadbody.medication.compoundMedication &&  !payloadbody.medication.compoundMedication[k].id)
        {
            delete payloadbody.medication.compoundMedication[k].id;
        }
      }
    }
    
    if(payloadbody.medication.medDetailId){
       delete payloadbody.medication.medDetailId;
    }

    this.loadSpin=true;
    this._service.approveChangeRx(payloadbody).subscribe((response: any = []) => {
      this.loadSpin=false;
      if (payloadbody['isPushNotification'] && !payloadbody['isSignature']) {
        if (response.result && response.result.data.transaction && response.result.data.payload) {
          this.transactionId = response.result.data.transaction;
          this.payload = response.result.data.payload;
          this.polling();
        }

      }
      if (response.status == 200 && (!response.result || !response.result.data.transaction)) {
        this.toaster.success(response.message, 'Success');
        if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
          else this._router.navigate([this._router.url.replace('/prescribe', '')])
          if(this._router.url.includes('template-manager')){
            if(this.modalService.hasOpenModals()){
              this.modalService.dismissAll()
            }
          }
      }
      else if (response.status !== 200) {
        this.toaster.error(response.message, 'Error');
      }
    },err=>{
      this.loadSpin=false;
    }
    );
  }


  sendApproveRxAfterOptCheck(body) {
    
    let payloadbody=cloneDeep(body);
    if(this._service.erxCheck==2){
      if(payloadbody.isCompoundMed){
        delete payloadbody.isCompoundMed;
      }
      if(payloadbody.draftOrder){
        payloadbody.medication=payloadbody.draftOrder[0].medication;
        delete payloadbody.draftOrder;
      }

      for(let k=0;payloadbody.medication && payloadbody.medication.compoundMedication && k<payloadbody.medication.compoundMedication.length;k++)
      {
        if(payloadbody.medication &&  payloadbody.medication.compoundMedication &&  !payloadbody.medication.compoundMedication[k].id)
        {
            delete payloadbody.medication.compoundMedication[k].id;
        }
      }
    }
    
    if(payloadbody.medication.medDetailId){
      delete payloadbody.medication.medDetailId;
    }
    this.loadSpin=true;
    this._service.approveRx(payloadbody).subscribe((response: any = []) => {
      this.loadSpin=false;
      if (payloadbody['isPushNotification'] && !payloadbody['isSignature']) {
        if (response.result && response.result.data.transaction && response.result.data.payload) {
          this.transactionId = response.result.data.transaction;
          this.payload = response.result.data.payload;
          this.polling();
        }

      }
      else if (response.status == 200 && (!response.result || !response.result.data.transaction)) {
        this.toaster.success(response.message, 'Success');
        if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
          else this._router.navigate([this._router.url.replace('/prescribe', '')])
          if(this._router.url.includes('template-manager')){
            if(this.modalService.hasOpenModals()){
              this.modalService.dismissAll()
            }
          }
      }
      else if (response.status !== 200) {
        this.toaster.error(response.message, 'Error');
      }
    },err=>{
      this.loadSpin=false;
    });
  }

  sendReplaceAfterOptCheck(body) {
    
    let payload=cloneDeep(body);
    if(this._service.erxCheck==2){
      if(payload.isCompoundMed){
        delete payload.isCompoundMed;
      }
      if(payload.draftOrder){
        payload.medication=payload.draftOrder[0].medication;
        delete payload.draftOrder;
      }

      for(let k=0;payload.medication && payload.medication.compoundMedication && k<payload.medication.compoundMedication.length;k++)
      {
        if(payload.medication &&  payload.medication.compoundMedication &&  !payload.medication.compoundMedication[k].id)
        {
            delete payload.medication.compoundMedication[k].id;
        }
      }
    }
    
    if(payload.medication.medDetailId){
      delete payload.medication.medDetailId;
    }
    this.loadSpin=true;
    this._service.replace(payload).subscribe((response: any = []) => {
      this.loadSpin=false;
      if (payload['isPushNotification'] && !payload['isSignature']) {
        if (response.result && response.result.data.transaction && response.result.data.payload) {
          this.transactionId = response.result.data.transaction;
          this.payload = response.result.data.payload;
          this.polling();
        }

      }
      if (response.status == 200 && response.result && !response.result.data.transaction) {
        this.toaster.success(response.message, 'Success');
        if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
        else this._router.navigate([this._router.url.replace('/prescribe', '')])
        if(this._router.url.includes('template-manager')){
          if(this.modalService.hasOpenModals()){
            this.modalService.dismissAll()
          }
        }
      }
      else if (response.status !== 200) {
        this.toaster.error(response.message, 'Error');
      }
    },err=>{
      this.loadSpin=false;
    });
  }
  confirm(modalId) {
  
  // 
 
    
    delete this._service.actionObj.task;
      delete this._service.actionObj.patient.height_ft;
      delete this._service.actionObj.patient.height_in;
      this._service.actionObj.patient.addressLine2 == "" && delete this._service.actionObj.patient.addressLine2
      // reshaping object for compound medicines

      
      
    if (this._service.action == 'replace') {
      
      this.RequestErx(modalId);
      
    } else if (this._service.action == 'deny') { // this is form deny refill
      let payload=cloneDeep(this._service.actionObj);
      if(this._service.erxCheck==2){
      delete payload.isCompoundMed;
      payload.medication=payload.draftOrder[0].medication;
      delete payload.draftOrder;
      }
      this._service.deny(payload).subscribe((response: any = []) => {
        this.toaster.success(response.message, "Success")
        if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
          else this._router.navigate([this._router.url.replace('/prescribe', '')])
          if(this._router.url.includes('template-manager')){
            if(this.modalService.hasOpenModals()){
              this.modalService.dismissAll()
            }
          }
        
        
      });
    } else if (this._service.action == 'approveChange') { // not needed
     

      let payload=cloneDeep(this._service.actionObj);
      if(this._service.erxCheck==2){
      delete payload.isCompoundMed;
      payload.medication=payload.draftOrder[0].medication;
      delete payload.draftOrder;
      }
      this._service.approveChange(payload).subscribe((response: any = []) => {
        this.toaster.success(response.message, "Success")

        if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
          else this._router.navigate([this._router.url.replace('/prescribe', '')])
          if(this._router.url.includes('template-manager')){
            if(this.modalService.hasOpenModals()){
              this.modalService.dismissAll()
            }
          }
        
      });
    } else if (this._service.action == 'approve') { 
      
      let payload=cloneDeep(this._service.actionObj);
      if(this._service.erxCheck==2){
      delete payload.isCompoundMed;
      payload.medication=payload.draftOrder[0].medication;
      delete payload.draftOrder;
      }
      this._service.approve(payload).subscribe((response: any = []) => {
        this.toaster.success(response.message, "Success")
        if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
          else this._router.navigate([this._router.url.replace('/prescribe', '')])
          if(this._router.url.includes('template-manager')){
            if(this.modalService.hasOpenModals()){
              this.modalService.dismissAll()
            }
          }
        
      });
    } else if (this._service.action == 'approveChangeRx') {
      this.RequestErx(modalId);
      
    } else if (this._service.action == 'approveRx') {
      this.RequestErx(modalId);
      
    } else if (this._service.action == 'denyRx') {
      
      let payload=cloneDeep(this._service.actionObj);
      if(this._service.erxCheck==2){
      delete payload.isCompoundMed;
      payload.medication=payload.draftOrder[0].medication;
      delete payload.draftOrder;
      }
      this._service.denyRx(payload).subscribe((response: any = []) => {
        this.toaster.success(response.message, "Success")
        if (this._router.url.includes('patient')) this.viewSummaryFun.emit('erx')
          else this._router.navigate([this._router.url.replace('/prescribe', '')])
          if(this._router.url.includes('template-manager')){
            if(this.modalService.hasOpenModals()){
              this.modalService.dismissAll()
            }
          }
        
        
      });
    }
  }
  cancel() {
    this._service.action = 'normal'
    this.viewSummaryFun.emit(false)
    if(this._router.url.includes('template-manager')){
      if(this.modalService.hasOpenModals()){
        this.modalService.dismissAll()
      }
    }

  }
  backPre() {
    this.viewSummaryFun.emit(false)

  }
  denyConfirm() {
    delete this.taskdetail.patient.name
    if(this.taskdetail?.previousMedicationPrescribed?.length)
    {
      if(this.taskdetail.previousMedicationPrescribed[0].refill){
      
      this.taskdetail.previousMedicationPrescribed[0].refill = 0
      }
      this.taskdetail.previousMedicationPrescribed[0].scriptDate = new Date().toISOString()
    }
    if(this.taskdetail?.medicationRequested?.length)
    {
      if(this.taskdetail.medicationRequested[0].refill)
      {
        this.taskdetail.medicationRequested[0].refill = 0
      }
      this.taskdetail.medicationRequested[0].scriptDate = new Date().toISOString()
    }
    
    let body = {
      "taskId": this.taskdetail.task.id,
      "taskType": this.taskdetail.task.numType,
      "orderId": this.taskdetail.task.orderId,
      
      "medication":this.taskdetail.medicationRequested[0]?this.taskdetail.medicationRequested[0]:this.taskdetail.previousMedicationPrescribed[0],
      "pharmacy": this.taskdetail.pharmacy,
      "pharmacyErx": this.taskdetail.pharmacyErx,
      "patient": this.taskdetail.patient,
      "prescriber": this.taskdetail.prescriber,
      "case": {
        "id": this.taskdetail.case.id
      },
      "visit": {
        "id": this.taskdetail.visit.id
      },
      "facility_location_id":this.taskdetail.task.facility_location_id,

      "deny": {
        "prescriberResponseCode": this.selectedReasonValue,
        "prescriberResponseReason": this.presResponseReason,
        "id": this.taskdetail.validate.id,
        "pharmacyRequestCode": this.taskdetail.validate.pharmacyRequestCode,
        "pharmacyRequestReason": this.taskdetail.validate.pharmacyRequestReason,
        "additionalInfo": this.taskdetail.validate.additionalInfo
      }
    }
    if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
			&& this.tempData.role.medical_identifier==1)
			{
			  body['supervisor']=this.taskdetail.supervisor;
			}
      
      body.patient.height_ft=1;
      body.patient.height_in=1;
      delete body.patient.height_ft;
      delete body.patient.height_in;
      
      this.loadSpin=true;
    this._service.denyRx(body).subscribe((response: any = []) => {
      this.loadSpin=false;
      
      this.toaster.success(response.message, "Success")
      this.viewSummaryFun.emit('erx')
    },err=>{
      this.loadSpin=false;
    });
  }

  approveConfirm() {
    delete this.taskdetail.patient.name
    delete this.taskdetail.validate.pharmacyRequestCodeDesc
    this.taskdetail.validate.additionalInfo = { 'pa': this.priorAuth != "" ? this.priorAuth : null }
    let body = {
      "taskId": this.taskdetail.task.id,
      "orderId": this.taskdetail.task.orderId,
      "medication": this.taskdetail.medicationRequested[0],
      "pharmacy": this.taskdetail.pharmacy,
      "facility_location_id":this.taskdetail.task.facility_location_id,
      "pharmacyErx": this.taskdetail.pharmacyErx,
      "patient": this.taskdetail.patient,
      "prescriber": this.taskdetail.prescriber,
      "case": {
        "id": this.taskdetail.case.id
      },
      "visit": {
        "id": this.taskdetail.visit.id
      },
      "validate": this.taskdetail.validate
    }
    if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
			&& this.tempData.role.medical_identifier==1)
			{
			  body['supervisor']=this.taskdetail.supervisor;
			}
      if(body.patient.height_ft)
      {
        delete body.patient.height_ft;
      }
      if(body.patient.height_in)
      {
        delete body.patient.height_in;
      }
      
      this.loadSpin=true;
    this._service.approvePrior(body).subscribe((response: any = []) => {
      this.loadSpin=false;
      this.toaster.success(response.message, "Success")
      this.viewSummaryFun.emit('erx')
    },err=>{
      this.loadSpin=false;
    });
  }

  // two factor authorization for validate 
  
  sendValidateAfterOtpCheck(body)
  {
    if(this._service.erxCheck==2){
      if(body.isCompoundMed){
        delete body.isCompoundMed;
      } 

    for(let k=0;body.medication && body.medication.compoundMedication && k<body.medication.compoundMedication.length;k++)
      {
        if(body.medication &&  body.medication.compoundMedication &&  !body.medication.compoundMedication[k].id)
        {
            delete body.medication.compoundMedication[k].id;
        }
      }
    }
    
    this.loadSpin=true;
    this._service.validatePrescriberAuth(body).subscribe((response: any = []) => {
      
      if (body['isPushNotification'] && !body['isSignature']) {
        this.loadSpin=false;
        if (response.result && response.result.data.transaction && response.result.data.payload) {
          this.transactionId = response.result.data.transaction;
          this.payload = response.result.data.payload;
          this.polling();
        }

      }
      if (response.status == 200 && !response.result) {
        this.toaster.success(response.message, 'Success');
        this.viewSummaryFun.emit('erx')
      }
      else if (response.status !== 200) {
        this.toaster.error(response.message, 'Error');
      }
    },err=>{
      this.loadSpin=false;
    });
  }
 
  sendValidateAuth()
  {

    
    // validate body
    this.taskdetail.previousMedicationPrescribed[0].scriptDate = new Date().toISOString()
    if(this.taskdetail.patient.name){ 
      delete this.taskdetail.patient.name
    }
    if(this.taskdetail.validate.pharmacyRequestCodeDesc){
      delete this.taskdetail.validate.pharmacyRequestCodeDesc
    }
    if(delete this.taskdetail.validate.subCodesWithDesc)
    {
        delete this.taskdetail.validate.subCodesWithDesc
    }
  
        this.taskdetail.validate.prescriberResponseCode = this.selectedReasonValueValidate
        let temp;
        if(this.effectiveDate)
        {
          temp = this.effectiveDate.toISOString()
          temp = temp.split('T')
        }
        this.taskdetail.validate.additionalInfo = {
          "identification":this.identification,
          "effectiveDate": this.effectiveDate?temp[0]:null,
          "specialty": this.specialty,
          "supervisor": this.supervisor,
          "subCodes":this.taskdetail.validate.additionalInfo.subCodes
        }
        let body = {
          "taskId": this.taskdetail.task.id,
          "orderId": this.taskdetail.task.orderId,
          "medication": this.taskdetail.medicationRequested[0],
          "facility_location_id":this.taskdetail.task.facility_location_id,
          "pharmacy": this.taskdetail.pharmacy,
          "pharmacyErx": this.taskdetail.pharmacyErx,
          "patient": this.taskdetail.patient,
          "prescriber": this.taskdetail.prescriber,
          "case": {
            "id": this.taskdetail.case.id
          },
          "visit": {
            "id": this.taskdetail.visit.id
          },
          "validate": this.taskdetail.validate
        }

        if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
          && this.tempData.role.medical_identifier==1)
          {
            body['supervisor']=this.taskdetail.supervisor;
          }
          if(body.patient && body.patient.height_ft!==null)
          {
            delete body.patient.height_ft;
          }
          if(body.patient && body.patient.height_in!==null)
          {
            delete body.patient.height_in;
          }
          
          if(body.medication.scriptDate==null)
          {
            body.medication.scriptDate=new Date();
          }
        // validate body ends
      this.loader();
      this.enableOtp = false;
      body['isPushNotification'] = true;
      this.disableTouch = true;
      this.sendValidateAfterOtpCheck(body);
      this.optAuth="";
      this.modalService.open(this.contentOptTwo, { size: 'lg' }).result.then((result) => {
        if (result == 'Save click') {
          if (body['isPushNotification']) {
            delete body['isPushNotification'];
          }
          body['otpCode'] = this.optAuth
            this.sendValidateAfterOtpCheck(body);

        } else {
          return;
        }
      });
  }




 
passwordAuthenticationValidate(contentOpt, check?) {
  this.disableConfirmPass=true;
  let auth = {
    confirm_password: this.passAuth
  }
  this.loadSpin=true;
  this.requestService.sendRequest(LogInUrlsEnum.confirmPassword, 'POST', REQUEST_SERVERS.erx_fd_api, auth).subscribe((res: any) => {
    this.loadSpin=false;
    if (res.status) {
        contentOpt.close('Close click')
      this.sendCount=0;
      this.disableConfirmPass=false;
      this.sendValidateAuth();
      
     
      
    }
    
  }, err => {
    this.loadSpin=false;
    this.disableConfirmPass=false;
    this.passAuth="";
    // 
  });


}
 async twoFactorValidateAuth()
  {
    let optC = false;
      if (this._service.erxCheck != 2) {
        for (let i = 0; i < this.taskdetail.previousMedicationPrescribed.length; i++) {
          
          if (this.taskdetail.previousMedicationPrescribed[i].rawMed.rawData.FederalDEAClassCode != "0") {
           optC=true;
          }
        }
        
      }
      else if (this._service.erxCheck == 2) {
        for (let q = 0;this.taskdetail.previousMedicationPrescribed && this.taskdetail.previousMedicationPrescribed[0]  && this.taskdetail.previousMedicationPrescribed[0].compoundMedication &&  q<this.taskdetail.previousMedicationPrescribed[0].compoundMedication.length; q++) {
          
          if (this.taskdetail.previousMedicationPrescribed[0].compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
            optC=true; 
            break;
          }
          }
          
      }
      if (optC) {

        if(this.refillSign==false)
        {
          this.toaster.error(
                      `Please Accept ready to sign for the medicine`,
                      'Error',
                    )
                    return;
        }
      }
      await this.validate();
      this.modalService.open(this.contentPrescribeAuth, { size: 'sm' })
    
      
  }

  validateAuth() {
    
    
    
         let optC = false;
      if (this._service.erxCheck != 2) {
        for (let i = 0; i < this.taskdetail.previousMedicationPrescribed.length; i++) {
          
          if (this.taskdetail.previousMedicationPrescribed[i].rawMed.rawData.FederalDEAClassCode != "0") {
           optC=true;
          }
        }
        
      }
      else if (this._service.erxCheck == 2) {
        for (let q = 0;this.taskdetail.previousMedicationPrescribed && this.taskdetail.previousMedicationPrescribed[0]  && this.taskdetail.previousMedicationPrescribed[0].compoundMedication &&  q<this.taskdetail.previousMedicationPrescribed[0].compoundMedication.length; q++) {
          
          if (this.taskdetail.previousMedicationPrescribed[0].compoundMedication[q].rawMed.rawData.FederalDEAClassCode != '0') {
            optC=true; 
            // break;
          }
          }
          
      }

      
      
      if (optC) {

        this.modalService.open(this.contentDisclaimer,{ 
                  size: 'lg',
                  backdrop: 'static',
                  keyboard: false }).result.then((result)=>{
                    if (result == 'Save click') {
                    this.modalService.open(this.contentAuthenticatetwo, { 
                      size: 'sm',
                      backdrop: 'static',
                      keyboard: false }).result.then((result) => {
                    });
                  }
                })
            }
        else{
        // in case of controlled medicine
      this.taskdetail.previousMedicationPrescribed[0].scriptDate = new Date().toISOString()
      if(this.taskdetail.patient.name){
        delete this.taskdetail.patient.name
      }
      if(this.taskdetail.validate.pharmacyRequestCodeDesc){
        delete this.taskdetail.validate.pharmacyRequestCodeDesc
      }
      if(this.taskdetail.validate.subCodesWithDesc){
        delete this.taskdetail.validate.subCodesWithDesc
      }
      if(this.taskdetail.patient.height_ft!==null)
      {
        delete this.taskdetail.patient.height_ft;
      }
      if(this.taskdetail.patient.height_in!==null)
      {
        this.taskdetail.patient.height_in;
      }
        this.taskdetail.validate.prescriberResponseCode = this.selectedReasonValueValidate
        let temp;
        if(this.effectiveDate)
        {
          temp = this.effectiveDate.toISOString()
          temp = temp.split('T')
        }
        this.taskdetail.validate.additionalInfo = {
          "identification":this.identification,
          "effectiveDate": this.effectiveDate?temp[0]:null,
          "specialty": this.specialty,
          "supervisor": this.supervisor,
          "subCodes":this.taskdetail.validate.additionalInfo.subCodes
        }
        let body = {
          "taskId": this.taskdetail.task.id,
          "facility_location_id":this.taskdetail.task.facility_location_id,
          "orderId": this.taskdetail.task.orderId,
          "medication": this.taskdetail.medicationRequested[0],
          "pharmacy": this.taskdetail.pharmacy,
          "pharmacyErx": this.taskdetail.pharmacyErx,
          "patient": this.taskdetail.patient,
          "prescriber": this.taskdetail.prescriber,
          "case": {
            "id": this.taskdetail.case.id
          },
          "visit": {
            "id": this.taskdetail.visit.id
          },
          "validate": this.taskdetail.validate
        }
        
        if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
          && this.tempData.role.medical_identifier==1)
          {
            body['supervisor']=this.taskdetail.supervisor;
          }
          if(body.patient.height_ft!==null)
          {
            delete body.patient.height_ft;
          }
          if(body.patient.height_in!==null)
          {
            delete body.patient.height_in;
          }
          if(body.medication.scriptDate==null)
          {
            body.medication.scriptDate=new Date();
          }
          
          this.loadSpin=true;
        this._service.validatePrescriberAuth(body).subscribe((response: any = []) => {
          this.loadSpin=false;
          
          this.toaster.success(response.message, "Success")
          this.viewSummaryFun.emit('erx')
        },err=>{
          this.loadSpin=false;
        });
  }
  }
  openModal(content) {
    this.modalService.open(content, { size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this._router.navigate(['erx']);
    });
  }
  print(IsSave,check?) {
     console.log('print',this.taskdetail)
     
   // check for nadean 
  if(this.transmiited==false){
    if(this.facilityLocationReq)
    {
      this.toaster.error(`Facility location is required`, "Error");
      this.enablePrint=true;
      return;
    }

    if(this._service.erxCheck!=2){
      for(let i=0;i<this.taskdetail.draftOrder.length;i++)
      {
       if (this.taskdetail.draftOrder[i].medication.rawMed.rawData['DefaultETCID'] == "571" && this.taskdetail.prescriber.nadean==null || this.taskdetail.prescriber.nadean == ''){
         this.toaster.error(`Prescriber's Nadean is required for  ${this.taskdetail.draftOrder[i].medication.rawMed.drugName} Medicine!`, "Error");
         this.clickOrderRx = true;
         this.enablePrint=true;
         return;
         
       }
       if (this.taskdetail.draftOrder[i].medication.rawMed.rawData['DefaultETCID'] == "571" && this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 && this.taskdetail.supervisor!=null){
        if(this.taskdetail.supervisor.nadean==null || this.taskdetail.supervisor.nadean == ''){
        this.toaster.error(`Supervisor's Nadean is required for  ${this.taskdetail.draftOrder[i].medication.rawMed.drugName} Medicine!`, "Error");
        this.clickOrderRx = true;
        this.enablePrint=true;
        return;
        }
        
      }
       
    }
    }
    else if(this._service.erxCheck==2){
       for(let i=0;this.taskdetail.draftOrder && this.taskdetail.draftOrder[0] && this.taskdetail.draftOrder[0].medication && this.taskdetail.draftOrder[0].medication.compoundMedication &&  i<this.taskdetail.draftOrder[0].medication.compoundMedication.length;i++)
    {
      if (this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.rawData['DefaultETCID'] == "571" && this.taskdetail.prescriber.nadean==null || this.taskdetail.prescriber.nadean == ''){
        this.toaster.error(`Prescriber's Nadean is required for  ${this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.drugName} Medicine!`, "Error");
        this.clickOrderRx = true;
        this.enablePrint=true;
        return;
        
      }
      if (this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.rawData['DefaultETCID'] == "571" && this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 && this.taskdetail.supervisor ){
        if(this.taskdetail.supervisor.nadean==null || this.taskdetail.supervisor.nadean == ''){
        this.toaster.error(`Supervisor's Nadean is required for  ${this.taskdetail.draftOrder[0].medication.compoundMedication[i].rawMed.drugName} Medicine!`, "Error");
        this.clickOrderRx = true;
        this.enablePrint=true;
        return;
        }
        
      }
      }
    }
    
  }
  
    
    let facilityName: any = this.storageData.getUserPracticeLocationsData()
    let prescriber=cloneDeep(this.taskdetail.prescriber)
    prescriber["practiceName"] = facilityName.facility_locations[0].facility_full_name;
    let body = {
      "draftOrder": this.taskdetail.draftOrder ? this.taskdetail.draftOrder : this.taskdetail.medicationPrescribed.map((e) => {
        // return 
        let med = {
          medication: e,
          pharmacy: this.taskdetail.pharmacy
        }
        return med;
      }),
      "patient": this.taskdetail.patient,
      "printOnly": !IsSave?((check ||this.transmiited==true)? 1 : this.taskdetail.draftOrder ? 0 : this.taskdetail.task.numAction == 8 ? 1 : 0):1,
      "printType": this.printType,
      "prescriber": prescriber,
      "case": {
        "id": !this.taskdetail.case ? null : this.taskdetail.case.id
      },
      "visit": {
        "id": !this.taskdetail.visit ? null : this.taskdetail.visit.id
      },
      "save":IsSave,
      "signature_url": this.signatureUrl ? this.signatureUrl : null
    }
    delete body.patient.height_ft;
    delete body.patient.height_in;
    if(this.transmiited==true)
    {
      body['taskId']=!this.taskdetail.task? null:this.taskdetail.task.id;
    }
    else{
      if(this.taskdetail.taskId){

        body['taskId']=this.taskdetail.taskId;
      }
    }

    if(this.faciltyId){

      body['facility_location_id']=this.faciltyId;
    }
    {
    const tempData= JSON.parse(localStorage.getItem('cm_data'));
        if(tempData.role.can_finalize==1 && tempData.role.has_supervisor==1)
        {
          if(this.taskdetail.supervisor==null)
          {
            this.toaster.error('Please select a supervisor before orderRx',"Error");
            this.clickOrderRx = true;
            this.enablePrint=true;
            return;
          }
          else{
            if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1)
      {
      let superCheck=false;
        if(this.taskdetail.supervisor.dean==null)
        {
          this.toaster.error('Supervisors DEA is Required for Erx','Error');
          superCheck=true;
          this.clickOrderRx=true;
          this.enablePrint=true;
        }
        if( this.supervisor2 && this.supervisor2.epcs_status.id!=3)
        {
        this.toaster.error('Supervisors EPCS is not Accepted','Error');
        superCheck=true;
        this.clickOrderRx=true;
        this.enablePrint=true;
        }
        if(this.supervisor2 && this.supervisor2.proofing_status!=1){
          this.toaster.error('Supervisors id proofing is required for Erx','Error');
          superCheck=true;
          this.clickOrderRx=true;
          this.enablePrint=true;
        }
        if(superCheck==true)
        {
          return;
        }
        }

            body['supervisor']=this.taskdetail.supervisor;
          }
        }
      }
    this.printed = true;
    if((!this.modalService.hasOpenModals() || !check ) && !IsSave )
    {
      this.openPrintModal();
    }
    
    
    this.loadSpin=true;
    if(IsSave==false){
    this._service.print(body).subscribe((res: any) => {
      this.loadSpin=false;
      
      let blob = new Blob([res], { type: 'application/pdf' });
      let pdfSourceLink = URL.createObjectURL(blob);
      

      document.getElementById('pdf-frame').setAttribute('src', pdfSourceLink);
      
      },err=>{
      this.loadSpin=false;
      })
    }else{
    this._service.printSave(body).subscribe((res: any) => {
      this.loadSpin=false;
      
      
        
        this.toaster.success(res.message, 'Success');
        this.closePrintModal();
      

    },err=>{
      this.loadSpin=false;
    })
  }
  }
  
  closePrintModal()
  {
    if(this.modalService.hasOpenModals()) {
      this.modalService.dismissAll()
    }
    if(!this._router.url.includes('template-manager')) {
      if (this._router.url.includes('patient')) {
        this.viewSummaryFun.emit('erx')
      }
      else {
        this._router.navigate([this._router.url.replace('/prescribe', '')])
      }
    }
  }

  closeTMModal()
  {
    if(this.modalService.hasOpenModals())
    {
      this.modalService.dismissAll()
    }
  }
  crossPrintIcon()
  {
   
    if(!this._router.url.includes('template-manager')){
       this._router.navigate(['/erx'])
    }
    
  }


  optionChange(val) {
    this.printType = val
    this.print(false,1)
  }
  validate() {
    this.loadSpin=true;
    this.requestService.sendRequest(erx_url.reason_code + '2', 'get', REQUEST_SERVERS.erx_fd_api)
      .subscribe(
        (response: any) => {
          this.loadSpin=false;
          
          
          
          this.reasonCodeValidate = []
          for (let i = 0; i < response.result.data.length; i++) {
            if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] && this.taskdetail.validate.subCodesWithDesc[0].code == "A"
              && (response.result.data[i].code == "GM" || response.result.data[i].code == "GN")) {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification={
                dean:this.taskdetail.prescriber.dean,
                nadean:this.taskdetail.prescriber.nadean,
                npi:this.taskdetail.prescriber.npi,
              }
              this.effectiveDate = null
              this.specialty = null
              this.supervisor = null
            } else if (
              (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
               (  this.taskdetail.validate.subCodesWithDesc[0].code == "B"
                  || this.taskdetail.validate.subCodesWithDesc[0].code == "C"
                  || this.taskdetail.validate.subCodesWithDesc[0].code == "D"
              ))
              && response.result.data[i].code == "GM") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification={
                dean:this.taskdetail.prescriber.dean,
                nadean:this.taskdetail.prescriber.nadean,
                npi:this.taskdetail.prescriber.npi,
              }
              this.effectiveDate = null
              this.specialty = null
              this.supervisor = null
              
            } else if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              this.taskdetail.validate.subCodesWithDesc[0].code == "E"
              && response.result.data[i].code == "GP") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification = null
              this.effectiveDate = null
              this.specialty = null
              this.supervisor = null
            } else if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              this.taskdetail.validate.subCodesWithDesc[0].code == "F"
              && response.result.data[i].code == "GS") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification = null
              this.effectiveDate = ""
              this.specialty = null
              this.supervisor = null
            } else if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              this.taskdetail.validate.subCodesWithDesc[0].code == "G"
              && response.result.data[i].code == "GM") {
              this.reasonCodeValidate.push(response.result.data[i])

              this.identification={
                dean:this.taskdetail.prescriber.dean,
                nadean:this.taskdetail.prescriber.nadean,
                npi:this.taskdetail.prescriber.npi,
              }
              
              this.effectiveDate = null
              this.specialty = null
              this.supervisor = null
            } else if (( this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              (this.taskdetail.validate.subCodesWithDesc[0].code == "H"
              || this.taskdetail.validate.subCodesWithDesc[0].code == "J"
            ))
              && response.result.data[i].code == "GT") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification = null
              this.effectiveDate = ""
              this.specialty = null
              this.supervisor = null
            } else if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              this.taskdetail.validate.subCodesWithDesc[0].code == "I"
              && response.result.data[i].code == "GQ") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification = null
              this.effectiveDate = null
              this.specialty = ""
              this.supervisor = null
            } else if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              this.taskdetail.validate.subCodesWithDesc[0].code == "K"
              && response.result.data[i].code == "GU") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification = null
              this.effectiveDate = ""
              this.specialty = null
              this.supervisor = null
            } else if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              this.taskdetail.validate.subCodesWithDesc[0].code == "L"
              && response.result.data[i].code == "GR") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification = null
              this.effectiveDate = null
              this.specialty = null
              this.supervisor = ""
            } else if (this.taskdetail.validate && this.taskdetail.validate.subCodesWithDesc && this.taskdetail.validate.subCodesWithDesc[0] &&
              this.taskdetail.validate.subCodesWithDesc[0].code == "M"
              && response.result.data[i].code == "GM") {
              this.reasonCodeValidate.push(response.result.data[i])
              this.identification = ""
              this.effectiveDate = null
              this.specialty = null
              this.supervisor = null
            }
          }
          this.selectedReasonValueValidate = this.reasonCodeValidate[0].code
          
        },err=>{
          this.loadSpin=false;
        });
  }
  getUserSpi() {
    let body = {
      user_id: this.taskdetail.prescriber.id,
    }
    this.requestService.sendRequest('get_spi', 'get', REQUEST_SERVERS.erx_fd_api, body).subscribe(async(res: any) => {
      this.userSpis = await res?.result?.data;
      this.loadSpin=false;
      if(this.userSpis && this.userSpis.length) {
        this.facilityLocationReq = false;
        this.userSpis.forEach(e=>{
          if(e.is_primary){
            this.selLocation = e?.facility_location?.facility_full_name;
            this.faciltyId=e?.facility_location_id;
            this.taskdetail.prescriber.spi=e?.spi;
            this.taskdetail.prescriber.dean=e?.dea_record?.dean;
            this.taskdetail.prescriber.nadean=e?.dea_record?.nadean;
            this.taskdetail.prescriber.addressLine1=e?.facility_location?.address;
            this.taskdetail.prescriber.addressLine2=e?.facility_location?.floor;
            this.taskdetail.prescriber.city=e?.facility_location?.city;
            this.taskdetail.prescriber.stateProvince=e?.facility_location?.state;
            this.taskdetail.prescriber.countryCode="US";
            this.taskdetail.prescriber.postalCode=e?.facility_location?.zip;
            if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
              && this.tempData.role.medical_identifier==1)
              {
                this.getSupervisors(this.faciltyId,false);
              }
          }
        })
      }
      if(this.userSpis && !this.userSpis.length) {
        this.facilityLocationReq = true;
        Object.assign(this.userSpis, this.tempData.userPracticeLocations.facility_locations)
        this.selLocation = this.tempData.userPracticeLocations.facility_locations[0].facility_full_name;
        this.faciltyId = this.tempData.userPracticeLocations.facility_locations[0].id;
        if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
          && this.tempData.role.medical_identifier==1)
          {
            this.getSupervisors(this.faciltyId,false);
          }
      }
    });
  }

  getSupervisors(fac_id,detail) {
    
		let body={
      user_id:this.taskdetail.prescriber.id,
      facility_location_id:fac_id
    }
    this.loadSpin=true;
		this.requestService
			.sendRequest(erx_url.users_supervisor, 'get', REQUEST_SERVERS.erx_fd_api,body)
			.subscribe((res) => {
        this.loadSpin=false;
				this.supervisors = res.result.data;
        
				this.supervisors.map((event: any) => {
          if(detail==false){
          var fullname = event['first_name'];
					if (event['middle_name'] != null && event['middle_name'] != '') {
            fullname = fullname + ' ' + event['middle_name'];
					}
					if (event['last_name'] != null && event['last_name'] != '') {
            fullname = fullname + ' ' + event['last_name']
					}
					
					event['full_name'] = fullname;
          
				}
          }
        );
				
        
        this.tempSupervisors=cloneDeep(this.supervisors);
        let sup=[];
        for(let k=0;k<this.tempSupervisors.length;k++)
        {
          
          for(let m=0;this.tempSupervisors[k] &&  this.tempSupervisors[k].medicalIdentifier && this.tempSupervisors[k].medicalIdentifier.spis && m<this.tempSupervisors[k].medicalIdentifier.spis.length;m++ )
          {
            
            
            if(this.tempSupervisors[k].medicalIdentifier.spis[m].facility_location_id==fac_id)
            {
              sup.push(this.tempSupervisors[k]);
              break;
            }

          }
            
          }
         
          this.supervisors=sup;
         //Adding flow in case of there is only one suitable supervisor for specific facility location
          if(this.supervisors.length==1)
          {
            this.supervisor2=this.supervisors[0];
            this.selectedSupervisor=this.supervisors[0];
            this.selectSupervisor(this.supervisors[0]);
          }
         
          if(detail==true)
          {
            for(let k=0;k<this.supervisors.length;k++)
            {
            if(this.taskdetail.prescriber.spi==this.supervisors[k].medicalIdentifier.spis[0].spi)
            {
              this.selectSupervisor(this.supervisors[k]);
              
            }
          }
        }
        
        
			},err=>{
        this.loadSpin=false;
      });
	}
  selectSupervisor(event) {
		
    if(event){
		this.supervisor2=event;
      
                let selectInd=0;
                for(let k=0;event.medicalIdentifier && event.medicalIdentifier.spis && event.medicalIdentifier.spis.length>0;k++)
                {
                  
                  
                  if(event.medicalIdentifier.spis[k].facility_location_id==this.faciltyId)
                  {
                    selectInd=k;
                    break;
                  }
                }
                let supervisor= {
                  id: event.id,
                  npi: event.medicalIdentifier && event.medicalIdentifier.npi,
                  dean:  event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].dea_record.dean,
                  stateLicenseNumber: event.medicalIdentifier && event.medicalIdentifier.stateLicenseNumber,
                  nadean: event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].dea_record.nadean,
                  spi: event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].spi,
                  firstName: event.first_name,
                  middleName: event.middle_name,
                  lastName: event.last_name,
                  addressLine1: event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].facility_location.address,
                  addressLine2: event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].facility_location.floor,
                  city:  event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].facility_location.city,
                  stateProvince: event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].facility_location.state,
                  postalCode: event.medicalIdentifier && event.medicalIdentifier.spis[selectInd] && event.medicalIdentifier.spis[selectInd].facility_location.zip 
                  && event.medicalIdentifier.spis[selectInd].facility_location.zip.replace('-', ''),
                  countryCode: "US",
                  primaryPhone: {
                    number: event.cell_no,
                  },
                }

                this.taskdetail['supervisor']=supervisor;


		

      }
      else{
        this.selectedSupervisor=null;
        delete this.taskdetail['supervisor'];
        this.clickOrderRx = true;
        this.enablePrint=true;
      }
    
	}
  OnFacilityLocationChange(event)
  {
    if(event){
      this.facilityLocationReq = false;
      if(this.taskdetail?.prescriber?.spi) {
        this.selLocation = event?.facility_location?.facility_full_name;
        this.faciltyId=event?.facility_location_id;
        this.taskdetail.prescriber.dean=event?.dea_record?.dean;
        this.taskdetail.prescriber.nadean=event?.dea_record?.nadean;
        this.taskdetail.prescriber.addressLine1=event?.facility_location?.address;
        this.taskdetail.prescriber.addressLine2=event?.facility_location?.floor;
        this.taskdetail.prescriber.city=event?.facility_location?.city;
        this.taskdetail.prescriber.stateProvince=event?.facility_location?.state;
        this.taskdetail.prescriber.countryCode="US";
        this.taskdetail.prescriber.postalCode=event?.facility_location?.zip;
        if(this.taskdetail['supervisor']) {
          this.selectedSupervisor=null;
          delete this.taskdetail['supervisor'];
        }
        if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
          && this.tempData.role.medical_identifier==1) 
        {
          this.getSupervisors(this.faciltyId,false);
        }
      }
      else {
        this.selLocation = event.facility_full_name;
        this.faciltyId=event.id;
        if(this.taskdetail['supervisor']) {
          this.selectedSupervisor=null;
          delete this.taskdetail['supervisor'];
        }
        if(this.tempData.role.can_finalize==1 && this.tempData.role.has_supervisor==1 
          && this.tempData.role.medical_identifier==1) 
        {
          this.getSupervisors(this.faciltyId,false);
        }
      }
    }
    else
    {
      this.facilityLocationReq = true;
      this.faciltyId=null;
      this.selectedSupervisor=null;
      delete this.taskdetail['supervisor'];
      this.clickOrderRx = true;
      this.enablePrint=true;
    }
  }
  // presc log is created for compound med
  prescCompoundRecord(status,action)
  {
    let body = {
      "status_id": status ,
      "user_id": this._service.data.prescriber.id,
      "action_id": action,
      "task_id": this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
      "prescriber_id":this._service.data.prescriber.id
    }
    this._service.prescriptionEventLogs(body).subscribe((response: any) => {
      
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
          "task_id": this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
          "prescriber_id":this._service.data.prescriber.id
        }
      }
      else{
        data = {
          "med_id": this._service.data.draftOrder[index].medication.id,
          "status_id": status,
          "user_id": this._service.data.prescriber.id,
          "action_id": action,
          "task_id": this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
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
            "task_id": this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
            "prescriber_id":this._service.data.prescriber.id
          }
          this._service.prescriptionEventLogs(body).subscribe((response: any) => {
            
          });
        
      
    }
  }

  


  prescriptionsLogRecords(status,action){
    if(this._service.erxCheck!=2){
      for (let i = 0; i < this._service.data.draftOrder.length; i++) {
        let data = {
          "med_id": this._service.data.draftOrder[i].medication.id,
          "status_id": status,
          "user_id": this._service.data.prescriber.id,
          "action_id": action,
          "task_id": this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
          "prescriber_id":this._service.data.prescriber.id
        }
      
        this._service.prescriptionEventLogs(data).subscribe((response: any) => {
          
        });
      }
      }
      if (this._service.erxCheck == 2) {
          let body = {
            "status_id": status ,
            "user_id": this._service.data.prescriber.id,
            "action_id": action,
            "task_id": this._service.data.taskId ? this._service.data.taskId : this._service.taskid,
            "prescriber_id":this._service.data.prescriber.id
          }
          this._service.prescriptionEventLogs(body).subscribe((response: any) => {
            
          });
        
      }
  }
  openPrintModal()
  {
    this.modalService.open(this.printPdf, { backdrop:'static', keyboard: false, size: 'lg' });
  }

  checkSupervisor()
  {
    const tempData= JSON.parse(localStorage.getItem('cm_data'));
    if(tempData.role.can_finalize==1 && tempData.role.has_supervisor==1)
  {
    if(this.taskdetail.supervisor == null && (this.supervisors && this.supervisors.length > 1)) {
      this.toaster.error('Please select a supervisor before orderRx',"Error");
      this.clickOrderRx = true;
      this.enablePrint=true;
      return;
    }
    if(this.taskdetail.supervisor == null) {
      this.toaster.error('Please ask your admin to associate a supervisor with this location: ' + this.selLocation,"Error");
      this.clickOrderRx = true;
      this.enablePrint=true;
      return;
    }
    else {
      // checking error conditions before modal popup
      if(this.errorConditionsSupervisor()){
      
      // modal opening for content disclaimer
      this.modalService.open(this.contentDisclaimer,{ 
        size: 'lg',
        backdrop: 'static',
        keyboard: false }).result.then((result)=>{
          if (result == 'Save click') {
          this.passAuth="";
          this.modalService.open(this.contentAuthenticate, { 
            size: 'sm',
            backdrop: 'static',
            keyboard: false }).result.then((result) => {
              if (result == 'Close click')
              {
               this.passAuth="";
              }
          });
        }
        })
      }
    }
    }
    else{
      // discalimer opening for content disclaimer
      this.modalService.open(this.contentDisclaimer,{ 
        size: 'lg',
        backdrop: 'static',
        keyboard: false }).result.then((result)=>{
          if (result == 'Save click') {
          this.modalService.open(this.contentAuthenticate, { 
            size: 'sm',
            backdrop: 'static',
            keyboard: false }).result.then((result) => {
          });
        }
        })
    }
  }

  errorConditionsSupervisor()
  {
    let superCheck=false;
        if(this.taskdetail.supervisor.dean==null)
        {
          this.toaster.error('Supervisors DEA is Required for Erx','Error');
          this.clickOrderRx = true;
          this.enablePrint=true;
          superCheck=true;
        }
        if(this.supervisor2.epcs_status.id!=3)
        {
        this.toaster.error('Supervisors EPCS is not Accepted','Error');
        this.clickOrderRx = true;
        this.enablePrint=true;
        superCheck=true;
        }
        if(this.supervisor2.proofing_status!=1){
          this.toaster.error('Supervisors id proofing is required for Erx','Error');
          this.clickOrderRx = true;
          this.enablePrint=true;
          superCheck=true;
        }
        if(superCheck==true)
        {
          return false
        }
        return true;
  }
  xyremCheck()
  {
    
    for(let k=0;k<this.taskdetail.draftOrder.length;k++)
    {
     if(this._service.erxCheck!=2)
     {
       for(let k=0;k<this.taskdetail.draftOrder.length;k++){
       if (this.taskdetail.draftOrder[k].medication.rawMed.rawData['DefaultETCID'] == "5619") {
             this.taskdetail.draftOrder[k].medication.pharmacyNotes='RGB: '+this.taskdetail.draftOrder[k].medication.pharmacyNotes;
           }
      } 
    }
    }
  }
  onChangeAlerts(i)
  {
    
    if(this.AllertsArray[i].draftOrder==true)
    {
      this.AllertsArray[i].draftOrder=false
    }
    else if(this.AllertsArray[i].draftOrder==false){
      this.AllertsArray[i].draftOrder=true;
    }
    
  }

  onChangeAlertsPrescribed(i){

    if(this.AllertsArrayPrescribed[i].medicationPrescribed==true)
    {
      this.AllertsArrayPrescribed[i].medicationPrescribed=false
    }
    else if(this.AllertsArrayPrescribed[i].medicationPrescribed==false){
      this.AllertsArrayPrescribed[i].medicationPrescribed=true;
    }

  }
  onChangeAlertsDispensed(i){

    if(this.AllertsArrayDispensed[i].medicationDispensed==true)
    {
      this.AllertsArrayDispensed[i].medicationDispensed=false
    }
    else if(this.AllertsArrayDispensed[i].medicationDispensed==false){
      this.AllertsArrayDispensed[i].medicationDispensed=true;
    }

  }
  onChangeAlertsRequested(i){

    if(this.AllertsArrayRequested[i].medicationRequested==true)
    {
      this.AllertsArrayRequested[i].medicationRequested=false
    }
    else if(this.AllertsArrayRequested[i].medicationRequested==false){
      this.AllertsArrayRequested[i].medicationRequested=true;
    }

  }

  onChangeAlertsPrev(i){

    if(this.AllertsArrayPrevPrescribed[i].previousMedicationPrescribed==true)
    {
      this.AllertsArrayPrevPrescribed[i].previousMedicationPrescribed=false
    }
    else if(this.AllertsArrayPrevPrescribed[i].previousMedicationPrescribed==false){
      this.AllertsArrayPrevPrescribed[i].previousMedicationPrescribed=true;
    }

  }

  onChangeAlertsDenied(i){

    if(this.AllertsArrayMedicationDenied[i].medicationDenied==true)
    {
      this.AllertsArrayMedicationDenied[i].medicationDenied=false
    }
    else if(this.AllertsArrayMedicationDenied[i].medicationDenied==false){
      this.AllertsArrayMedicationDenied[i].medicationDenied=true;
    }

  }
 taskDeleteDicclaimer()
 {
  this.modalService.open(this.contentDeleteDisclaimer,{ 
    size: 'sm',
    backdrop: 'static',
    keyboard: false }).result.then((result)=>{
      if (result == 'Save click') {
     
          this.taskDelete();
        }
    })
 }
}
