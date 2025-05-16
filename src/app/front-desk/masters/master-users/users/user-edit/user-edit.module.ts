import { AddTemplateFormComponent } from './template/components/add-template-form/add-template-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserEditRoutingModule } from './user-edit-routing.module';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { PriviligesComponent } from './priviliges/priviliges.component';
import { MedicalIdentifierComponent } from './medical-identifier/medical-identifier.component';
import { UsersEditComponent } from './user-edit.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { BusyLoaderModule } from '@shared/busy-loader/busy-loader.module';
import { MastersSharedModule } from '@appDir/front-desk/masters/shared/masters-shared.module';
import { LoginInformationComponent } from './login-information/login-information.component';
import { ConfirmPasswordModalComponent } from './login-information/confirm-password-modal/confirm-password-modal.component';
import { CanActivateLoginInformationService } from './login-information/can-activate-login-information/can-activate-login-information.service';
import { RequiredFieldsFormComponent } from './required-fields-form/required-fields-form.component';
import { UserTemplateManagerComponent } from '../components/user-template-manager/user-template-manager.component';
import { UserTemplateManagerFormComponent } from '../components/user-template-manager-form/user-template-manager-form.component';
import { AddSpecialtyFormComponent } from './priviliges/components/add-specialty/add-specialty-form.component';
import { AddSupervisorFormComponent } from './priviliges/components/add-supervisor/add-supervisor-form.component';	
import { TemplateListComponent } from './template/template-list.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FilterTemplateComponent } from './template/components/filter-template/filter-template.component';
import { DeleteAppointmentsComponent } from './delete-appointments/delete-appointments.component';


@NgModule({
  declarations: [UsersEditComponent, BasicInfoComponent, PriviligesComponent, MedicalIdentifierComponent, 
	LoginInformationComponent, ConfirmPasswordModalComponent, RequiredFieldsFormComponent,UserTemplateManagerComponent,UserTemplateManagerFormComponent,
	AddSpecialtyFormComponent, AddSupervisorFormComponent,TemplateListComponent,AddTemplateFormComponent, FilterTemplateComponent, DeleteAppointmentsComponent],
  imports: [
    CommonModule,
    UserEditRoutingModule,
    TabsModule.forRoot(),
    FdSharedModule, SharedModule,
    BusyLoaderModule,
    MastersSharedModule,
    SharedModule,
	MatSlideToggleModule
  ], entryComponents: [ConfirmPasswordModalComponent, RequiredFieldsFormComponent,UserTemplateManagerFormComponent,
	AddSpecialtyFormComponent, AddSupervisorFormComponent, AddTemplateFormComponent], 
  providers: [
    CanActivateLoginInformationService
  ]
})
export class UserEditModule { }
