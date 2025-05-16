import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersEditComponent } from './user-edit.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { PriviligesComponent } from './priviliges/priviliges.component';
import { MedicalIdentifierComponent } from './medical-identifier/medical-identifier.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { LoginInformationComponent } from './login-information/login-information.component';
import { CanActivateLoginInformationService } from './login-information/can-activate-login-information/can-activate-login-information.service';
import { TemplateListComponent } from './template/template-list.component';



const routes: Routes = [
  {
    path: '',
    component: UsersEditComponent,
    children: [
      {
        path: '',
        redirectTo: 'basic-info',
        pathMatch:'full'
      },
      {
        path: 'basic-info',
        component: BasicInfoComponent,
        canDeactivate: [CanDeactivateFormsComponentService],
      },
      {
        path: 'privileges',
        component: PriviligesComponent,
        canDeactivate: [CanDeactivateFormsComponentService],
      },
	  {
        path: 'template',
        component: TemplateListComponent,
        // canDeactivate: [CanDeactivateFormsComponentService],
      },
      {
        path: 'medical-identifier',
        component: MedicalIdentifierComponent
	  },
	  {
	    	path: 'id-proofing',
        loadChildren:()=>import('./id-proofing/id-proofing.module').then(m => m.IdProofingModule),
        
      },
      {
        path: 'login-information',
        component: LoginInformationComponent,
        canActivate: [CanActivateLoginInformationService]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserEditRoutingModule { }
