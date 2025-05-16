import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { AutomateModalComponent } from '../../modals/automate-modal/automate-modal.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';

@Component({
	selector: 'assign-doctor-calendar-header',
	templateUrl: 'calendar-header.component.html',
	styleUrls: ['calendar-header.component.scss']
})
export class AssignDoctorCalendarHeaderComponent {
	/**
	 * selected clinics
	 */
	@Input()
	clinics: any;

	/**
	 * currently selected view i.e; (Month/Week/Day)
	 */
	@Input()
	view: string;

	/**
	 * Currently selected value of swapping (Doctor/Clinic OR Clinic/Doctor)
	 */
	@Input() isSwapped: any;

	/**
	 * selected doctors
	 */
	@Input()
	doctors: any;

	/**
	 * selected date of calendar
	 */
	@Input()
	viewDate: Date;

	/**
	 * Date change on next button from header
	 */
	@Output()
	changeDatePickerMonthNext: EventEmitter<any> = new EventEmitter();

	/**
	 * Date change on previous button from header
	 */
	@Output()
	changeDatePickerMonthPrev: EventEmitter<any> = new EventEmitter();


	@Input()
	locale: string = 'en';

	@Input()
	swaps: any;

	/**
	 * on change of view (Month/Week / Day)
	 */
	@Output()
	viewChange: EventEmitter<string> = new EventEmitter();

	/**
	 * on change of date from header
	 */
	@Output()
	viewDateChange: EventEmitter<Date> = new EventEmitter();

	constructor(
		public _service: HomeComponent,
		public automateModal: NgbModal,
		public _supervisorService: SchedulerSupervisorService) {

	}

	/**
	 * Date change on next button from header (emit changeDatePickerMonthNext)
	 */
	sendDataNext(date) {
		this.changeDatePickerMonthNext.emit(date)
	}

	/**
	 * Date change on previous button from header (emit changeDatePickerMonthPrev)
	 */
	sendDataPrev(date) {
		this.changeDatePickerMonthPrev.emit(date)
	}

	/**
	 * Handle Currently selected value of swapping (Doctor/Clinic OR Clinic/Doctor)
	 */
	swap() {
		this._service.shift();
	}

	/**
	 * initialize values for automate modal and open the Modal
	 */
	public openModal() {
		if (this.swaps) {
			this._supervisorService.selectedDoc = this.doctors
			this._supervisorService.selectedClinic = this.clinics
		}
		else {
			this._supervisorService.selectedDoc = this.clinics
			this._supervisorService.selectedClinic = this.doctors
		}
		//  this._supervisorService.selectedClinic=this.clinics;
		//  this._supervisorService.selectedDoc=this.doctors;
		const activeModal = this.automateModal.open(AutomateModalComponent, {
			windowClass: "xlModal", backdrop: 'static',
			keyboard: true
		});
	}

	/**
	 * Date change on from header (emit viewChange)
	 */
	public viewChangeFun(text) {
		this.viewChange.emit(text)
	}
}
