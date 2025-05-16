import { Observable } from 'rxjs';
import { of } from 'rxjs';

export class BillingMockService {
	Mock_getSpecialitiesWithCount = [
		{
			description: "jdsgajsfjdfgsafee",
			id: 2,
			is_create_appointment: 1,
			name: "Acupuncture333eee33",
			over_booking: 52,
			time_slot: 12
		}
	]
	Mock_getBilling = {
		id: 20,
		'appointment_type_id': 1,
		'case_types': 'WC',
		'claim_no': '',
		'doctor_id': '6',
		'insurance': null,
		'no_of_days': 238,
		'practices': 1,
		'speciality_id': 1,
		'visit_date_format': '2020-08-28',
		'visit_session_state_id': '1',
		'cpt_codes': [{ id: 11, is_editable: 1 }],
		'icd_codes': [{ id: 1, is_editable: 1 }]
	}
	getSpecialitiesWithCount(case_id = 3): Observable<boolean> {

		return of(true)
	}
	getBilling(): Observable<any> {
		return of(this.Mock_getBilling)
	}
	getvisitType(): Observable<any> {
		return of(true)
	}
	searchSpeciality(): Observable<any> {
		return of(true)
	}
	getCaseTypes(): Observable<any> {
		return of(true)
	}
	getStatusList(): Observable<any> {
		return of(true)
	}
}
