import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HouseholdComponent } from './household.component';
import { HouseholdEditComponent } from './household-edit/household-edit.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: HouseholdComponent,
      pathMatch: 'full',
      data: {
        title: 'Edit House Hold Information'
      }
    },
    {
      path: 'edit/:id',
      component: HouseholdEditComponent,
      data: {
        title: 'Edit Household Information'
      }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HouseholdRoutingModule { }
