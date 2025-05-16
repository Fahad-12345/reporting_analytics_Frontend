import { PatientModel, GenderEnum, MaritalStatusEnum } from "./Patient.model";
import { CaseTypeIdEnum } from "./CaseTypeEnums";
// import { InsuranceAndLocationsModel, AdjusterInformationModel } from "@appDir/front-desk/masters/billing/models/AdjusterInformation.Model";

export class CaseModel {
    id: number;
    is_finalize: boolean;
	case_referral_id: number;
    patient_id: number;
	case_type:caseType;
    case_type_id: CaseTypeIdEnum;
	is_transferring_case:any=0;
	category:Category;
    category_id: number;
    caseAttorney: any;
    casePracticeLocations: any[];
    caseHomeLocations: any[];
    practice: number[]
    home: number[]
    patient: PatientModel;
    basic_information: PatientDetailModel;
    form_filler_information: PatientDetailModel;
    emergency_information: PatientDetailModel;
    guarantor_information: PatientDetailModel;
    accident: AccidentInformation;
    insurance: CaseInsurance;
    employer: EmployerModel;
    attorney: AttorneyModel;
    case_insurances: any[];
    last_appointment: Date;
    next_appointment: Date;
	purpose_of_visit:PurposeOfVisit;
	purpose_of_visit_id:number;
    accident_information: any;
	mri:MRI;
	date_of_admission:Date;
}

export class MRI
{
	case_id:number;
	id: number;
	intake_four_id:number;
	intake_one_id:number;
	intake_six_id:number;
	intake_three_id:number;
	intake_two_id:number;
	mri_intake_4:MriIntake4;
	mri_intake_three:any;
	mri_intake_1:MriIntake1 = new MriIntake1();
	mri_intake_3:MriIntake3;
	mri_intake_2:MriIntake2;
	mri_radiology_id:number;
	mri_radiology_montage:MriRadiologyMontage;
    mri_intake_6: MriIntake6;

	constructor(values: Object={}){
		Object.assign(this, values);
	}


}
export class MriIntake2{
	id:number;
	eye_injury_metallic_object: boolean;
    eye_injury_metallic_object_description: boolean;
    injury_by_metallic_object: boolean;
    injury_by_metallic_object_description: boolean;
    medicines: any[] = [];
    recently_taken_medication: boolean;
}
export class MriIntake3{
	id:number;
	is_alergic_to_food_medication:boolean;
	food_allergy:Boolean;
	iodine_contrast:boolean;
	latex_allergy:true;
	others:string;

}
export class MriIntake6{
	id:number;
    date_of_period: any;
    description: any;
    is_breastfeeding: any;
    is_fertility_treatment: any;
    is_hormonal_treatment: boolean;
    is_post_menopausal: boolean;
    late_menstural_period_id: boolean;

}

export class MriIntake4{
	id:number;
    is_anemia_disease: boolean;
    is_chemotherapy: boolean;
    is_history: boolean;
    is_radiation_therapy: boolean;

}

export class MriRadiologyMontage{
	id:number;
    aneurysm_clip: boolean;
	body_piercing: boolean;
	body_weigth: boolean;
	cardiac_pacemaker: boolean;
	cardioverter: boolean;
	dentures: boolean;
	diaphragm: boolean;
	hearing_aid: boolean;
	infusion_device: boolean;
	magnetically_activated: boolean;
	mechanical_heart_valves: boolean;
	metallic_fragment: boolean;
	metallic_stent: boolean;
	spinal_cord_stimulator: boolean;

}
export class MriIntake1{
	constructor(values: Object={}){
		Object.assign(this, values);
	}
	id:number;
	is_imaging_study:boolean;
	imaging_study_details:ImagingStudyDetails[];
	
	is_prior_surgery:boolean;
	prior_surgery_details:PriorSurgeryDetails[];
	medical_symptoms:string;
	is_previous_problem:boolean;
	previous_problem_description:string;
	latex_allergy:true;
	

}

export class PriorSurgeryDetails{
	id:number;
	date:string;
	surgery_type_id:number;
	is_body_part:boolean;
	mri_id:number;
	surgery_type:surgeryType
}
export class surgeryType{
	id:number;
	name:string;
	slug:string;
}

export class ImagingStudyDetails{
	id:number;
	date:string;
	type_of_study_id:number;
	body_part_id:number;
	mri_intake_1_id:number;
	type_of_study:TypeOfStudy;
	mri_body_part:MriBodyPart
}
export class TypeOfStudy{
	id:number;
	name:string;
	slug:string;
}

export class MriBodyPart{
	id:number;
	body_part_id:number;
	body_part:BodyPart;
	
}

export class BodyPart{
	id:number;
	name:number;
	slug:string;
	
}


export class practiceLocation {
    case_id: number;
    id: number;
    key: number;
    practice_location_id: number;
}
export class PurposeOfVisit
{
	created_at: string
	created_by: number
	deleted_at: number
	id: number
	key: null
	name: string
	slug: string
	updated_at: string
	updated_by: number
}


export class Category
{
	created_at: string
	created_by: number
	deleted_at: number
	id: number
	key: null
	name: string
	slug: string
	updated_at: string
	updated_by: number
}
export class caseType {
	created_at:string;
	created_by:number;
	deleted_at: number;
	id:number;
	key:number;
	name:string;
	slug:string;
	updated_at:string;
	updated_by:string;

}
export class AttorneyModel {
    id: number;
    case_id: number;
    attorney_id: number;
    firm_id: number;
    firm_location_id: number;
    attorney: AttorneyDataModel;
    firm: FirmModel;
    third_party_firm: FirmModel;
    firm_location: FirmLocationModel;
    third_party_firm_location: FirmLocationModel;
    contact_person: PatientDetailModel
}

export class FirmLocationModel {
    id: number;
    firm_id: number;
    location_name: string;
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    cell: string;
    ext: string;
    fax: string;
    email: string;
    contact_person_first_name: string;
    contact_person_middle_name: string;
    contact_person_last_name: string;
    contact_person_phone: string;
    contact_person_cell: string;
    contact_person_ext: string;
    contact_person_fax: string;
    contact_person_email: string;
    comments: string;
    is_main: boolean;
    place_of_service_id: number;
}

export class AttorneyDataModel {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    street_address: string;
    suit_floor: string;
    city: string;
    state: string;
    zip: string;
    phone_no: string;
    ext: string;
    email: string;
    cell_no: string;
    fax: string;
    comments: string;
}

export class FirmModel {
    id: number;
    name: string;
}



export class EmployerModel {
    yearly_employer_dialog: DialogEnum;
    secondary_employer_dialog: DialogEnum;
    primary_employer_dialog: DialogEnum;
    case_employers: CaseEmployer[];
    employment_information: EmploymentInformationModel;
    return_to_work: ReturnToWorkModel
}

// export class CaseEmployerObject {
//     yearly_employer_dialog: DialogEnum;
//     secondary_employer_dialog: DialogEnum;
//     primary_employer_dialog: DialogEnum;
//     data: CaseEmployer[]
// }
export class CaseEmployerUpdateObject {
    secondary_employer_dialog: DialogEnum;
    yearly_employer_dialog: DialogEnum;
    primary_employer_dialog: DialogEnum
    primary_employer: CaseEmployer;
    secondary_employer: { is_deleted: boolean, data: CaseEmployer[] };
    yearly_employer: { is_deleted: boolean, data: CaseEmployer[] }
    employment_information: EmploymentInformationModel;
    return_to_work: ReturnToWorkModel
}
export class ReturnToWorkModel {
    id: number;
    case_id: number;
    work_stop: boolean;
    work_stop_date: string;
    return_to_work: boolean;
    return_to_work_date: string;
    current_employment_status: string;
    type_ofassignment: string;
    illness_notice: boolean;
    illness_notice_date: string;
    given_notice: boolean;
    contact_person_id: number;
    contact_person: ContactPersonModel;
}

export class ContactPersonModel {
    // "first_name": "Muhammad",
    // "middle_name": "zack",
    // "last_name": "Muaz",
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
}

export class EmploymentInformationModel {
    id: number;
    case_id: number;
    title: string;
    activities: string;
    type: string;
    type_description: string;
    receive_lodging: boolean;
    lodging_description: string;
    is_deleted: boolean;
    gross_salary: number;
    often_paid: string;
    course_of_employment: DialogEnum;
    unemployment_benefits: DialogEnum;
    weekly_earning: number;
    no_of_hours_per_day: number;
    no_of_days_per_week: number;
}

export class CaseEmployer {

    id: number;
    case_id: number;
    employer_id: number;
    employer_type_id: CaseEmployerTypeEnum;
    occupation: string;
    date_hired: string;
    end_Date: string;
    is_time_looses: boolean;
	is_verified:boolean;
    employer_name: string;
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip: string;
    phone_no: string;
    ext: string;
    fax: string;
    email: string;
    is_deleted: boolean;
    update_call_from_primary : boolean;
    // id: number;
    // case_id: number;
    // employer_id: number;
    // employer_type_id: CaseEmployerTypeEnum
    // occupation: string;
    // date_hired: string;
    // end_Date: string;
    // is_time_looses: boolean;
    // caseEmployerType: CaseEmployerType;
    // employer: EmployerDataModel
}

export class EmployerDataModel {
    id: number;
    employer_name: string;
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip: number;
    contactPersonFirstName: string;
    contactPersonMiddleName: string;
    contactPersonLastName: string;
    contactPersonPhoneNo: string;
    contactPersonExt: string;
    contactPersonFax: string;
    contactPersonEmail: string;
    comments: string;
}



export class CaseEmployerType {
    id: number;
    name: string;
}


export class CaseInsurance {
    primary_insurance: InsuranceModel;
    secondary_insurance: InsuranceModel;
    tertiary_insurance: InsuranceModel;
    private_health_insurance: InsuranceModel;
}




export class InsuranceModel {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    claim_no: string;
    policy_no: string;
    wcb_no: string;
    member_id: number;
    group_no: string;
    insurance_plan_name_id:number;
    insurance_company: InsuranceDataModel;
    adjustor: AdjustorModel;
    private_health_dialog: DialogEnum;
    secondary_dialog: DialogEnum;
    tertiary_dialog: DialogEnum;
    prior_authorization_no: string;
    insured: string;
    is_policy_holder: boolean;
    payer:any
}

export class InsuranceDataModel {
    id: number;
    name: string;
    insurance_code: string;
    location_id: number;
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip: string;
    phone_no: string;
    cell_no: string;
    ext: string;
    fax: string;
}

export class AdjustorModel {
    id: number;
    adjustor_id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    phone_no: string;
    ext: string;
    fax: string;
    email: string;
    cell_no: string;
}

export enum InsuranceTypeEnum {
    primary = 'primary',
    secondary = 'secondary',
    tertiary = 'tertiary',
    private_health = 'private_health'
}

export class PatientDetailModel {
    id: number;
    case_id: number;
    contact_person_type_id: contactPersonTypeEnum;
    contact_person_relation_id: number;
    other_relation_description: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    ssn: string;
    dob: string;
    age: number;
    gender: GenderEnum;
    email: string;
    fax: string;
    cell_phone: string;
    home_phone: string;
    work_phone: string;
    ext: string;
    height_in: number;
    height_ft: number;
    weight_lbs: number;
    weight_kg: number;
    marital_status: MaritalStatusEnum;
    is_resedential_same: number;
    is_form_filler: DialogEnum;
    is_emergency: DialogEnum;
    is_guarantor: DialogEnum;
    workplace_name: string;
    object_id: number;
    mail_address: AddressModel
    residential_address: AddressModel;

}

export class AddressModel {
    id: number;
    contact_person_id: number;
    type: AddressEnum;
    street: string;
    apartment: string;
    latitude: string;
    longitude: string;
    city: string;
    state: string;
    zip: string;
}
export enum AddressEnum {
    mailing = 'mailing',
    residential = 'residential'
}
export enum contactPersonTypeEnum {
    self = 1,
    form_filler = 2,
    emergency = 3,
    guarantor = 4,
    attorney = 5,
    referring_physician = 6,
    primary_physician = 7,
    supervisor = 8,
    vehicle_driver = 9,
    vehicle_owner = 10,
    notified_supervisor = 11,
    witness_to_accident = 12,
    people_living_with = 13,
    current_treated_by = 14,
    previous_treated_by = 15
}

export class AccidentInformation {
    accident_information: AccidentInformationData
    object_involved: ObjectInvolved;
    witness_to_accident: WitnessToAccidentModel
}

export class WitnessToAccidentModel {
    anyone_see_injury_dialog: DialogEnum;
    data: PatientDetailModel[]
}
export class AccidentInformationData {
    id: number;
    case_id: number;
    accident_date: Date | string;
    accident_time: string;
    patient_at_time_of_accident: string;
    driver_type: string;
    at_time_of_accident_other_description: string;
    usual_work_location: boolean;
    location_reason: string;
    accident_location: string;
    accident_happend: string;
    street_no: string;
    city: string;
    state: string;
    zip: number;
    nature_of_accident: string;
    activity_at_injury: string;
    injury_description: string;
    injured_at_work_location: boolean;
    case_established: string;
    had_ime: boolean;
    occupational_disease: number;
}
export class ObjectInvolved {
    id: number;
    object_involved: boolean;
    object_involved_description: string;
    vehicle_involved: DialogEnum;
    vehicle_belongs_to: VehicleBelongsToEnum;
    driver_was: string;
    accident_reported: boolean;
    reporting_date: string;
    precint: string;
    state: string;
    city: string;
    country: string;
    was_this: string;
    was_this_description: string;
    vehicle_was: string;
    no_of_vehicle_involved: number;
    vehicle_patient_were_in: number;
    was_this_car: string;
    also_owner_of_vehicle: boolean
}

export enum VehicleBelongsToEnum {
    'patient'
    , 'employer'
    , 'other'
}
export enum CaseEmployerTypeEnum {
    primary = 1,
    secondary = 2,
    yearly = 3
}

export enum DialogEnum {
    self = 'self',
    other = 'other',
    yes = 'yes',
    no = 'no',
    skip = 'skip',
    none = 'none',
    not_sure = 'not_sure',
    one = 1,
    zero=0,
    two = 2,
    three = 3
}
export enum CaseCategorySlugEnum {
    MEDICAL = 'medical',
    SURGICAL = 'surgical',
    DIAGNOSTIC = 'diagnostic'
}
