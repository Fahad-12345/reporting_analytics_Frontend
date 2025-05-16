import { Ifilter } from "./ifilter";

export class FilterModel implements Ifilter {

    billId = false;
	specialtyId = false;
	provider = false;
	practiceLocation = false;
	EorType = false;
	CreatedBy = false;
	UpdatedBy = false;
	action_type_ids = false;
    type_ids = false;
    paidBy = false;
	denialType = false;
	verificationType = false;
	verificationStatus = false;
	case_ids = false;
	insurance_ids = false;
	attorney_ids = false;
	bill_status_ids = false;
	payment_status_ids = false;
	denial_status_ids =false;
	eor_status_ids = false;
	patient_ids = false;
	patient_name_ids =false;
	case_id = false;
	patient_names =false;
	case_types_ids =false;
	speciality_ids =false;
	facility_ids =false;
	provider_ids =false;
	verification_status_ids =false;
	created_by_ids =false;
	updated_by_ids =false;
	appointment_types =false;
	target_practiceLocation =false;


	constructor() {}
	getPatientId(): boolean {
		return this.patient_ids;
	}
	getPatientName(): boolean {
		return this.patient_name_ids;
	}
	getEorStatus(): boolean {
		return this.eor_status_ids;
	}
	getDenialStatus(): boolean {
		return this.denial_status_ids;
	}
	getPaymentStatus(): boolean {
		return this.payment_status_ids;
	}
	getBillStatus(): boolean {
		return this.bill_status_ids
	}
	getAttorneyIds(): boolean {
		return this.attorney_ids;
	}
	getInsuranceIds(): boolean {
		return this.insurance_ids;
	}
    getPaidBy(): boolean {
        return this.paidBy;
    }
  
	getBillId(): boolean {
		return this.billId;
	}
	getSpecialty(): boolean {
		return this.specialtyId;
	}
	getProvider(): boolean {
		return this.provider;
	}
	getPracticeLocation(): boolean {
		return this.practiceLocation;
	}
	getEorType(): boolean {
		return this.EorType;
	}
	getCreatedBy(): boolean {
		return this.CreatedBy;
	}
	getUpdatedBy(): boolean {
		return this.UpdatedBy;
    }
    
    getAuctionTypeId(): boolean {
        return this.action_type_ids;
    }
    getTypeId(): boolean {
        return this.type_ids;
	}
	
	getDenialType(): boolean {
        return this.denialType;
	}
	
	getVerificationType(): boolean {
		return this.verificationType;
	}

	getVerificationStatus(): boolean {
		return this.verificationStatus;
	}
	getCaseIds(): boolean {
		return this.case_ids;
	}
	getCaseId(): boolean {
		return this.case_id;
	}
	getPatientNames(): boolean {
		return this.patient_names;
	}
	getCaseTypesIds(): boolean {
		return this.case_types_ids;
	}
	getSpecialityIds(): boolean {
		return this.speciality_ids;
	}
	getFacilityIds(): boolean {
		return this.facility_ids;
	}
	getProviderIds(): boolean {
		return this.provider_ids;
	}
	getVerificationStatusIds(): boolean {
		return this.verification_status_ids;
	}
	getCreatedByIds(): boolean {
		return this.created_by_ids;
	}
	getUpdatedByIds(): boolean {
		return this.updated_by_ids;
	}
	getAppointmentTypes(): boolean {
		return this.appointment_types;
	}
	getTargetPracticeLocation(): boolean {
		return this.target_practiceLocation;
	}
}
