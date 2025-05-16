import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlantypeComponent } from './plantype/plantype.component';

const routes: Routes = [
	{
		path:'',
		component:PlantypeComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterPlanTypeRoutingModule { }
