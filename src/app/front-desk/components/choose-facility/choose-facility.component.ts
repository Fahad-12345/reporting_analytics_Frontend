import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { MatSelectChange } from '@angular/material/select';
import { CurrentFacilitiesDropDown } from '@appDir/shared/layouts/main-header/current-facilities-dropdown.abstract.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-choose-facility',
	templateUrl: './choose-facility.component.html',
	styleUrls: ['./choose-facility.component.scss']
})
export class ChooseFacilityComponent extends CurrentFacilitiesDropDown implements OnInit, AfterViewInit {

	constructor(protected requestService: RequestService,
		public aclService: AclService,
		protected activeModal: NgbActiveModal, protected router: Router,
		private authService: AuthService, protected storageData: StorageData,
		protected toastrService: ToastrService) {
		super(aclService, router, requestService, storageData, activeModal, toastrService);
	}
	toppings = null;


	// public facilities: any[] = [];




	ngOnInit() {
		this.getPracticesDropDownData(() => {
			debugger;
			if (this.storageData.isSuperAdmin()) {
				this.facilityitem = this.facilites.facility_locations.map(loc => loc.id)
				this.onSubmit()
			} else if (this.facilites && this.facilites.facility_locations.length == 1) {
				this.facilityitem = [this.facilites.facility_locations[0].id]
				this.onSubmit()
			}

		});
		this.facilityitem = this.storageData.getFacilityLocations();
	}



	ngAfterViewInit() {
		setTimeout(() => this.toppings = [])
		// this.toppings = [];
	}

	cancel() {
		this.activeModal.close(false);
	}


	logout() {

		this.router.navigate(['login']);
		this.authService.logout().subscribe(resp => {
			this.storageData.clear();
			// localStorage.clear();

		});
	}


	onPracitceSelectionChange($event: MatSelectChange) {
		const selectedPractice = $event.value;
		if (!selectedPractice.length) {
			this.currentSimiler = []
			return;
		}
		this.currentSimilarPermissions(selectedPractice);
	}



}
