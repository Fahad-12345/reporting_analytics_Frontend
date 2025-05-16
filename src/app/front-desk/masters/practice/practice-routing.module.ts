import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PracticeComponent } from './practice.component';
import { PracticeListingComponent } from './practice/practice-listing/practice-listing.component';
import { PracticeAddComponent } from './practice/practice-add/practice-add.component';
import { PracticeEditComponent } from './practice/practice-edit/practice-edit.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { HospitalComponent } from './hospital/hospital/hospital.component';

const routes: Routes = [
  {
    path: '',
    component: PracticeComponent,
    children: [
      { path: '', redirectTo: 'practice/list', pathMatch: 'full' },
      {
        path: 'practice/list',
        component: PracticeListingComponent,
        data: {
          title: 'Practice',
          permission: USERPERMISSIONS.master_practice_menu
        },

      },
      {
        path: 'practice/add',
        component: PracticeAddComponent,
        data: {
          title: 'Practice',
          permission: USERPERMISSIONS.master_practice_add_new
        },
        //canDeactivate: [CanDeactivateFormsComponentService],
      },
      {
        path: 'practice/edit/:id',
        component: PracticeEditComponent,
        data: {
          title: 'Practice',
          permission: USERPERMISSIONS.master_practice_edit
        },
        //canDeactivate: [CanDeactivateFormsComponentService],
      },
      {

        path: 'hospital',
        component: HospitalComponent,
        data: {
          title: 'Hospital',
          permission: USERPERMISSIONS.master_practice_menu
          // permission: USERPERMISSIONS.master_hospital_add
        },
      },
	  {
		path: 'referral',
    loadChildren:()=>import('./referring-physician/referring-physician/referring-physician.module').then(m => m.ReferringPhysicianModule),
    
		data: {
			title: 'Referring Physician',
			permission: USERPERMISSIONS.master_practice_referring_physician_menu
		}
	},
    ]
    ,
    resolve: { route: AclResolverService, state: AclResolverService }
  },
  // { path: 'add', loadChildren: './add-facility/add-facility.module#AddFacilityModule' },
  // { path: 'edit', loadChildren: './edit-facility/edit-facility.module#EditFacilityModule' }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PracticeRoutingModule { }
