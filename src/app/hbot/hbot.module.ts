import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HbotRoutingModule } from './hbot-routing.module';
import { HbotNotesComponent } from './components/hbot-notes/hbot-notes.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HbotComponent } from './components/hbot/hbot.component';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';

import { AclService } from '../shared/services/acl.service';
import { ContradictionToHbotComponent } from './components/contradiction-to-hbot/contradiction-to-hbot.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { FilesListModalComponent } from './components/files-list-modal/files-list-modal.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { DoctorCalendarService } from '@appDir/shared/modules/doctor-calendar/doctor-calendar.service';
import { CalendarModule } from 'angular-calendar';
// import { NgxCoolDialogsService } from 'ngx-cool-dialogs';
@NgModule({
	declarations: [
		HbotNotesComponent,
		HbotComponent,
		ContradictionToHbotComponent,
		ProfileHeaderComponent,
		FilesListModalComponent,

	],
	imports: [
		CommonModule,
		HbotRoutingModule,
		SharedModule,
		CalendarModule,
		ReactiveFormsModule,
		DynamicFormModule,
		FormsModule,
		NgxDatatableModule, BusyLoaderModule, SignatureModule

	], providers: [
		MDService,
		AclRedirection,
		AclService,
		CalendarMonthService,
		AppointmentModalDialogService,DoctorCalendarService
	], exports: [ProfileHeaderComponent], entryComponents: [FilesListModalComponent]
})
export class HbotModule { }
