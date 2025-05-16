export interface IFilter {
	getBillId(): boolean;
	getSpecialty(): boolean;
	getProvider(): boolean;
	getPracticeLocation(): boolean;
	getEorType(): boolean;
	getCreatedBy(): boolean;
    getUpdatedBy(): boolean;
    getAuctionTypeId(): boolean;
    getTypeId(): boolean;
	getPaidBy(): boolean;
	getDenialType(): boolean;
	getVerificationType(): boolean;
	getVerificationStatus(): boolean;
	getCaseIds(): boolean;
	getInsuranceIds(): boolean;
	getAttorneyIds(): boolean;
	getPaymentStatus(): boolean;
	getBillStatus(): boolean;
	getDenialStatus(): boolean;
	getEorStatus(): boolean;
	getPatientId(): boolean;
	getPatientName(): boolean;
	getCaseId(): boolean;
	getPatientNames(): boolean;
	getCaseTypesIds(): boolean;
	getSpecialityIds(): boolean;
	getFacilityIds(): boolean;
	getProviderIds(): boolean;
	getVerificationStatusIds(): boolean;
	getCreatedByIds(): boolean;
	getUpdatedByIds(): boolean;
	getPacketId(): boolean;
	getJobStatus(): boolean;
	getPomId(): boolean;
	getEmployee(): boolean;

}

export class FilterModel implements IFilter {
	billId = false;
	specialtyId = false;
	provider = false;
	practiceLocation = false;
	EorType = false;
	CreatedBy = false;
	UpdatedBy = false;
	created_at = false;
	updated_at = false;
	action_type_ids = false;
    type_ids = false;
    paidBy = false;
	denialType = false;
	verificationType = false;
	verificationStatus = false;
	case_ids = false;
	insurance_ids = false;
	attorney_ids = false;
	bill_status_id  = false;
	payment_status_ids = false;
	denial_status_ids =false;
	eor_status_ids = false;
	patient_ids = false;
	patient_name_ids =false;
	patient_name =false;
	case_type_ids =false;
	speciality_ids =false;
	facility_ids =false;
	provider_ids =false;
	verification_status_ids =false;
	created_by_ids =false;
	updated_by_ids =false;
	packet_id =false;
	job_status =false;
	pom_ids =false;
	employer_ids = false; 


	constructor() {}
	
	getEmployee(): boolean {
		return this.employer_ids;
	}
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
		return this.bill_status_id 
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
  	// Use as bill id filter
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
	getcreated_at(): boolean {
		return this.created_at;
    }
	getupdated_at(): boolean {
		return this.updated_at;
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
	// Use as case id filter
	getCaseId(): boolean {
		return this.case_ids;
	}
	// Use as patient name filter
	getPatientNames(): boolean {
		return this.patient_name;
	}
	// Use as case type filter
	getCaseTypesIds(): boolean {
		return this.case_type_ids;
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
	// Use as packet id filter
	getPacketId(): boolean {
		return this.packet_id;
	}
	// Use as job status filter
	getJobStatus(): boolean {
		return this.job_status;
	}
	// Use as pom id filter
	getPomId(): boolean {
		return this.pom_ids;
	}
}
