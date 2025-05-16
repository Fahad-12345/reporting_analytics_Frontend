import { Component, OnInit } from '@angular/core';
import { LayoutService } from '@appDir/template-manager/services/layout.service';

@Component({
	selector: 'app-carry-forward',
	templateUrl: './carry-forward.component.html',
	styleUrls: ['./carry-forward.component.scss'],
})
export class CarryForwardComponent implements OnInit {
	constructor(public layoutService: LayoutService) {}

	ngOnInit() {}
	carryCheck(check) {
		if (check == 'c') {
			this.layoutService.carryDrop = true;
			this.layoutService.carryModal.close('Carry Forward');
		} else if (check == 'n') {
			this.layoutService.carryDrop = false;
			this.layoutService.carryModal.close('Normal');
		} else {
			this.layoutService.carryDrop = false;
			this.layoutService.carryModal.close('None');
		}
	}
}
