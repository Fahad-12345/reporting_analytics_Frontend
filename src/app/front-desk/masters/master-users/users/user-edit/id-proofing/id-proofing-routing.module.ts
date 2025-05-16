import { ProofingInformationComponent } from './proofing-information/proofing-information.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { IdProofingComponent } from './id-proofing.component';
import { HistoryComponent } from './history/history.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';



const routes: Routes = [
	{
		path: '',
		component: IdProofingComponent,
		children: [
			{
				path: '',
				redirectTo: 'proofing-information'
			},
			{
				path: 'proofing-information',
				component: ProofingInformationComponent,
				//   canDeactivate: [CanDeactivateFormsComponentService],
			},
			{
				path: 'history',
				component: HistoryComponent,
				//   canDeactivate: [CanDeactivateFormsComponentService],
			},
			{
				path: 'manage-account',
				// component: ManageAccountComponent
			},
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class IdProofingRoutingModule { }
