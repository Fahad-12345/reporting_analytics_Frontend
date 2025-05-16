import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployerComponent } from './employer.component';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

const routes: Routes = [
  {
    path: "",
    component: EmployerComponent,
    data: { title: 'Employer', permission: USERPERMISSIONS.patient_case_list_insurance_employer_tab },
    canDeactivate: [CanDeactivateFormsComponentService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployerRoutingModule { }
