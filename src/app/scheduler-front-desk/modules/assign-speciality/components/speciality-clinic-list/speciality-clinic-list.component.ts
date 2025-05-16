import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { isEmpty } from 'lodash';


import { SubjectService } from '../../subject.service';

@Component({
	selector: 'app-speciality-clinic-list',
	templateUrl: './speciality-clinic-list.component.html',
	styleUrls: ['./speciality-clinic-list.component.scss'],
})
export class SpecialityClinicListComponent implements OnInit {
	public loadMoreTemparray: any = [];
	public searchedClinics: any = [];
	@Input() tempClinics: any = [];
	public isClinicClicked: boolean = false;
	public 
	public isShowAllClinicList: boolean = true;
	public click: boolean = false;
	public isSpecialityClicked: boolean = true;
	public isShowFilter: boolean = false;
	public isShowSpecialityFilter: boolean = false;
	public isShowMore: boolean = true;
	public isShowLess: boolean = true;
	// public isShowFilterClinicList: boolean = true;
	public isCheckAddMore;
	public isCheckShowLess;
	public clinicName;
	public specName:string=''
	public clinicArea;
	public clinicAddress;
	public offsetMore;
	public clinicsLength;
	public isClinicCheck: boolean = false;
	@Output() selectClinic = new EventEmitter();
	@Output() selectSpeciality = new EventEmitter();
	@Input() clinics: any;
	@Input() speciality: any;

	//
	public filterClinic;
	public filterSpeciality
	//
	constructor(public subjectService: SubjectService) {
		this.clinicName = '';
		this.clinicArea = '';
		this.clinicAddress = '';
	}
	ngOnInit() {
		this.subjectService.castClinics.subscribe((res) => {
			if (res.length != 0) {
				this.clinics = res;
				this.filterClinic = [];
				// this.filterClinic=this.clinics;
				this.searchClinicByNameByAddress();
				// this.clinicClicked();
			}
		});
		this.clinicClicked();
	}
	ngOnChanges(): void {
		this.filterSpeciality=this.speciality;
		this.searchSpecialityByNameByAddress();
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.
		
	}

	onSpecialtyChange(spec)
	{
		this.filterClinic=[];
		this.selectSpeciality.emit(spec)
	}
	onClinicChange(clinic)
	{
		this.filterSpeciality=[];
		this.selectClinic.emit(clinic)
	}
	/*Get clinics function*/
	public clinicClicked() {
		this.click = false;
		this.isClinicClicked = true;
		this.isShowSpecialityFilter=false
		if (this.clinicName != '' || this.clinicArea != '' || this.clinicAddress != '') {
			this.isShowAllClinicList = false;
			this.isClinicCheck = true;
			// this.isShowFilterClinicList = false;
			this.isShowFilter = true;
			this.searchClinicByNameByAddress();
		} else if (this.clinicName === '' || this.clinicArea === '' || this.clinicAddress === '') {
			this.isShowAllClinicList = false;
			this.isClinicCheck = false;
			this.isShowFilter = false;
			if (this.clinics.length != 0) {
				this.loadMoreTemparray = [];
				//hhh
				this.filterClinic = [];
				this.filterClinic=this.clinics;
				//
				// for (var i = 0; i < this.clinics.length; i++) {
				// 	// if (i < 5) {
				// 	//   this.loadMoreTemparray.push(this.clinics[i]);
				// 	//   this.isShowMore = true;
				// 	//   this.isShowLess = true;
				// 	// }
				// 	// else {
				// 	//   this.offsetMore = 5;
				// 	//   if (this.clinics.length === 5) {
				// 	//     this.isShowMore = true;
				// 	//   }
				// 	//   else {
				// 	//     this.isShowMore = false;
				// 	//   }
				// 	//   break;
				// 	// }

				// 	//Show All Clinics...hhh
				// 	//this.loadMoreTemparray.push(this.clinics[i]);
				// 	this.filterClinic.push(this.clinics[i]);
				// 	console.log(this.filterClinic);

				// 	this.isShowMore = true;
				// 	this.isShowLess = true;
				// 	//
				// }
			}
		}
		this.isSpecialityClicked = true;
		//console.log("CLINICS",this.loadMoreTemparray);
	}

	/*Get specialities function*/
	public specialityClicked() {
		this.isClinicCheck = false;
		this.click = true;
		// this.isShowFilterClinicList = true;
		this.isClinicClicked = false;
		this.isShowFilter = false;
		this.isSpecialityClicked = false;
		this.isShowAllClinicList = true;
		
		if(this.specName)
		{
			this.isShowSpecialityFilter=true;
			this.searchSpecialityByNameByAddress();
		}
		else
		{
			this.isShowSpecialityFilter=false;
			this.searchSpecialityByNameByAddress
		}
	}
	/*Show clinic filter function*/
	public showClinicFilter(event) {
		if (event.target.checked) {
			this.isShowFilter = true;
		} else {
			this.isShowFilter = false;
			this.clinicName = '';
			this.clinicAddress = '';
			this.clinicArea = '';
			this.searchClinicByNameByAddress();
		}
	}

	/*Show clinic filter function*/
	public showSpecialtyFilter(event) {
		if (event) {
			// this.specName=''
		} else {
			this.specName=''
			this.searchSpecialityByNameByAddress();
			// this.isShowSpecialityFilter=false
			// this.clinicName = '';
			// this.clinicAddress = '';
			// this.clinicArea = '';
			// this.searchClinicByNameByAddress();
		}
	}

	public searchClinicByNameByAddress() {
		
		let tempDisplay = this.clinics.filter((element) => {
			// let facility_full_name=((element.facility_name?element.facility_name.toLowerCase():'')+(element.name?'-'+element.name.toLowerCase():''))
			// // return element.facility_name.toLowerCase().includes(this.clinicName.toLowerCase()) || element.name.toLowerCase().includes(this.clinicName.toLowerCase()) ;
			// // let facility_full_name=`${{}}`element.facility_name?element.facility_name.toLowerCase():'')+(element.name?+'-'+element.name.toLowerCase():''))

			// // return  (element.facility_name?element.facility_name.toLowerCase():''+'-'+element.name?element.name.toLowerCase():'').includes(this.clinicName.toLowerCase());
			// return  facility_full_name.includes(this.clinicName.toLowerCase());

			let facility_full_name=((element.facility_name?element.facility_name.toLowerCase():'')+(element.name?'-'+element.name.toLowerCase():''))
			let facility_full_name_qualifier=((element && element.facility 
				&& element.facility.qualifier
				?element.facility.qualifier.toLowerCase():'')+(element.qualifier?'-'+element.qualifier.toLowerCase():''))
	
			return  (facility_full_name.includes(this.clinicName.toLowerCase()) || facility_full_name_qualifier.includes(this.clinicName.toLowerCase()));

		});

		if(!isEmpty(this.clinicAddress))
		{
			let address=this.clinicAddress.replace(/[, ]+/g, " ").trim();
			this.filterClinic = tempDisplay.filter((element) => {
				// let address_floor_city_state_zip=((element.address?element.address.toLowerCase():'')+(element.floor?' '+element.floor.toLowerCase():'')+(element.city?', '+element.city.toLowerCase():'')+(element.state?', '+element.state.toLowerCase():'')+(element.zip?', '+element.zip.toLowerCase():''))
				// let address_floor_city_state_zip=((element.address?element.address.toLowerCase():'')+(element.floor?' '+element.floor.toLowerCase():'')+(element.city?' '+element.city.toLowerCase():'')+(element.state?' '+element.state.toLowerCase():'')+(element.zip?' '+element.zip.toLowerCase():''))	
				let address_floor_city_state_zip=((element.address?element.address.toLowerCase():'')+(element.floor?' '+element.floor.toLowerCase():'')+(element.city?' '+element.city.toLowerCase():'')+(element.state?' '+element.state.toLowerCase():'')+(element.zip?' '+element.zip.toLowerCase():''))
				// if (element.address && element.city && element.state && element.zip) {
					// return element.address.toLowerCase().includes(this.clinicAddress.toLowerCase()) || element.city.toLowerCase().includes(this.clinicAddress.toLowerCase()) || (element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());
					// return  (element.address.toLowerCase()+(element.floor?' '+element.floor:'')+', '+element.city.toLowerCase()+', '+element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());
				return address_floor_city_state_zip.toLowerCase().includes(address.toLowerCase())
				// }
				// return false
			});
		}
		else
		this.filterClinic = tempDisplay
		
		// console.log(this.filterDoc);
		// console.log(this.displaySpec);
	}

	public searchSpecialityByNameByAddress() {
		let tempDisplay = this.speciality.filter((element) => {
			
			// return element.name? element.name.toLowerCase().includes(this.specName.toLowerCase()):''.includes(this.specName.toLowerCase());
			let specialty_name=((element.name?element.name.toLowerCase():''))
			let specialty_name_qualifier=((element.qualifier?element.qualifier.toLowerCase():''))
	
			return  (specialty_name.includes(this.specName.toLowerCase()) || specialty_name_qualifier.includes(this.specName.toLowerCase()));
		
		});

	
		this.filterSpeciality = tempDisplay
		
		// console.log(this.filterDoc);
		// console.log(this.displaySpec);
	}
}
