import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AttorneyFirms } from './attorney';

@Injectable({
	providedIn: 'root'
})
export class AttorneyServiceService {



	public defaultattorney: AttorneyFirms = {} as AttorneyFirms;

	private edit = new BehaviorSubject(false);
	private attorney = new BehaviorSubject(this.defaultattorney);

	public currentattorney = this.attorney.asObservable();

	public isEdit = false;

	constructor() { }

	updateAttorney(firms: AttorneyFirms) {
		this.edit.next(true);
		this.isEdit = true;
		this.attorney.next(firms);
	}
}
