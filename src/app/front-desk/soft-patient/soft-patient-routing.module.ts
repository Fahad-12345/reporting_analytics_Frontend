import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoftPatientVisitComponent } from './components/soft-patient-visit/soft-patient-visit.component';
import { SoftPatinetComponent } from './components/soft-patinet/soft-patinet.component';

const routes: Routes = [
	{
			path: 'list',
			children:[
				{ path : '', pathMatch:'full', component: SoftPatinetComponent ,data:{title: 'Ovada-Soft Registration'}},
				{path: 'add',component: SoftPatientVisitComponent,data: {title: 'Ovada-Soft Registration-Add'}	},
				{path: 'edit/:id',component: SoftPatientVisitComponent,data: {title: 'Ovada-Soft Registration-Edit'}	},
			]		
		  },	
]	;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SoftPatientRoutingModule { }
