import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { RejectedData } from './model/rejected-data';
import { AcceptedData } from './model/accepted-data';

@Injectable({
	providedIn: 'root',
})
export class CarryForwardService {
	public carryForwarded = new Subject<boolean>();
	constructor() {}

	public carryForwardClicked = (value: boolean) => {
		this.carryForwarded.next(value);
	};

	public resetCarryForward() {
		this.carryForwarded.complete();
		this.carryForwarded.closed = true;
		this.carryForwarded = new Subject<boolean>();
	}

	// public rejectCarryForward = new Subject<RejectedData>();

	// public carryForwardRejected = (value: RejectedData) => {
	// 	this.rejectCarryForward.next(value);
	// };

	public acceptCarryForward = new Subject<AcceptedData>();

	public carryForwardAccepted = (value: AcceptedData) => {
		this.acceptCarryForward.next(value);
	};
}
