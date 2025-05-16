import { Injectable } from '@angular/core';
import { MainService } from '@appDir/shared/services/main-service';
import { EnumSpecialtyTypes } from './specialty-types';

@Injectable({
  providedIn: 'root'
})
export class CalendarEvaluationService {

  constructor(private mainService:MainService) { }
  EnabledFlow(data?,type?) {
		switch(type) {
			case 'onlySpecialty' : 
			this.enabledFlowOnlySpecialty(data,type);
			break;
			case 'specialtyWithTemplateType' :
			this.enabledFlowSpecialtyWithTemplateType(data,type);
			break;
			case 'specialtyWithMedicalOrHbot':
			this.enabledFlowSpecialtyWithMedicalOrHbot(data,type);
			break;
			default:
			return;
		}
	}
	enabledFlowOnlySpecialty(data?,type?) {
		if(type == 'onlySpecialty') {
			switch(data.speciality_key) {
				case EnumSpecialtyTypes.MEDICAL_DOCTOR :
				this.mainService.setenableSaveRecordMedicalDoctor(true);
				break;
				case EnumSpecialtyTypes.HBOT :
					this.mainService.setenableSaveRecordHbot(true);
				break;
				default:
					this.mainService.setenableSaveRecordManualSpeciality(true);
			}
		}
	}
	enabledFlowSpecialtyWithTemplateType(data?,type?) {
		if(type == 'specialtyWithTemplateType') {
			switch(data.speciality_key) {
				case EnumSpecialtyTypes.MEDICAL_DOCTOR && data.template_type === 'manual' ? EnumSpecialtyTypes.MEDICAL_DOCTOR : null :
				this.mainService.setenableSaveRecordManualSpeciality(false);
				break;
				case EnumSpecialtyTypes.MEDICAL_DOCTOR :
				this.mainService.setenableSaveRecordMedicalDoctor(false);
				break;
				case EnumSpecialtyTypes.HBOT && data.template_type === 'manual' ? EnumSpecialtyTypes.HBOT : null :
					this.mainService.setenableSaveRecordManualSpeciality(false);
				break;
				case EnumSpecialtyTypes.HBOT :
					this.mainService.setenableSaveRecordHbot(false);
				break;
				default:
					this.mainService.setenableSaveRecordManualSpeciality(false);
			}
		}
	}
	enabledFlowSpecialtyWithMedicalOrHbot(data?,type?) {
		if(type == 'specialtyWithMedicalOrHbot') {
			switch(data.speciality_key) {
				case EnumSpecialtyTypes.MEDICAL_DOCTOR && data.template_type === 'manual' ? EnumSpecialtyTypes.MEDICAL_DOCTOR : null :
          this.mainService.setenableSaveRecordManualSpeciality(true);
					break;
				case EnumSpecialtyTypes.MEDICAL_DOCTOR :
          this.mainService.setenableSaveRecordMedicalDoctor(true);
					break;
				case EnumSpecialtyTypes.HBOT && data.template_type === 'manual' ? EnumSpecialtyTypes.HBOT : null :
					this.mainService.setenableSaveRecordManualSpeciality(true);
					break;
				case EnumSpecialtyTypes.HBOT :
          this.mainService.setenableSaveRecordHbot(true);
					break;
				default:
        //   this.mainService.setenableSaveRecordManualSpeciality(true);
			}
		}
	}
}
