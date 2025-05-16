import { SharedModule } from '@shared/shared.module';
import { IdProofingComponent } from './id-proofing.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProofingInformationComponent } from './proofing-information/proofing-information.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { HistoryComponent } from './history/history.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { IdProofingRoutingModule } from './id-proofing-routing.module';
import { NoticeModalComponent } from './proofing-information/notice-modal/notice-modal.component';

@NgModule({
	declarations: [IdProofingComponent, ProofingInformationComponent, HistoryComponent, ManageAccountComponent, NoticeModalComponent],
	imports: [
		IdProofingRoutingModule,
		SharedModule
	]
})
export class IdProofingModule { }
