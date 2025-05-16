import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReferralsComponent } from './referrals.component';
import { ReferrEditComponent } from './components/referr-edit/referr-edit.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
// import { USERPERMISSIONS } from '../UserPermissions';

const routes: Routes = [{
	path: '',
	children: [
		{
			path: '',
			component: ReferralsComponent,
			// pathMatch: '',
			data: {
				title: 'Edit Referr Information',
				permission: USERPERMISSIONS.patient_case_list_referrals_physical_information_tab
			},
			canDeactivate: [CanDeactivateFormsComponentService],
		},
		{
			path: 'referr/edit',
			component: ReferrEditComponent,
			data: {
				title: 'Edit Referral Information',
				permission: USERPERMISSIONS.patient_case_list_referrals_physical_information_edit
			},
			//canDeactivate: [CanDeactivateFormsComponentService]
		}
	]
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReferralsRoutingModule { }
