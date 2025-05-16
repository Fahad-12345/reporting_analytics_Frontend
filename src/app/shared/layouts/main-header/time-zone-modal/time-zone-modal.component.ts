import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment-timezone'
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-time-zone-modal',
	templateUrl: './time-zone-modal.component.html',
	styleUrls: ['./time-zone-modal.component.scss']
})
export class TimeZoneModalComponent implements OnInit {

	constructor(private activeModal: NgbActiveModal, private fb: FormBuilder, private storageData: StorageData) { }

	form: FormGroup
	offsetTmz: Array<{ timeZone: string, offset: number }> = []
	ngOnInit() {
		let timeZones = moment.tz.names()
		for (var i in timeZones) {
			this.offsetTmz.push(
				{
					timeZone: "(GMT" + moment.tz(timeZones[i]).format('Z') + ") " + timeZones[i],
					offset: ((parseInt(moment.tz(timeZones[i]).format('ZZ')) / 100) * 60) * -1
				}
			);
		}
		this.form = this.fb.group({
			timeZone: [this.storageData.getUserTimeZone()]
		})
	}

	close() {
		this.activeModal.close()
	}
	submit(form) {
		// form.timeZone.offset = ((parseInt(form.timeZone.offset) / 100) * 60) * -1
		this.storageData.setUserTimeZone(form.timeZone)
		this.activeModal.close()
	}
}
