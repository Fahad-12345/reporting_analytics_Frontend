import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

import {
	NgxDatatableCustomModule,
} from '@appDir/shared/modules/ngx-datatable-custom/ngx-datatable-custom.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LocationComponent } from './components/location/location.component';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { SpecialtyComponent } from './components/specialty/specialty.component';
import { CustomizePopupComponent } from './modals/customize-popup/customize-popup.component';
import {
	SpecialityEditModalComponent,
} from './modals/speciality-edit-modal/speciality-edit-modal.component';
import { SchedulerCustomizeRoutingModule } from './scheduler-customize-routing.module';
import { SchedulerCustomizeComponent } from './scheduler-customize.component';
import { CustomizeService } from './service/customize.service';
import { TableFilterComponent } from './shared/table-filter/table-filter.component';

@NgModule({
	declarations: [
		LocationComponent,
		SchedulerCustomizeComponent,
		SpecialtyComponent,
		PreferencesComponent,
		TableFilterComponent,
		CustomizePopupComponent,
		SpecialityEditModalComponent,
	],
	providers: [CustomizeService, NgbActiveModal],
	entryComponents: [CustomizePopupComponent, SpecialityEditModalComponent],
	imports: [
		CommonModule,
		SchedulerCustomizeRoutingModule,
		NgxDatatableCustomModule,
		SharedModule,
		MatSelectModule,
	],
})
export class SchedulerCustomizeModule {}
