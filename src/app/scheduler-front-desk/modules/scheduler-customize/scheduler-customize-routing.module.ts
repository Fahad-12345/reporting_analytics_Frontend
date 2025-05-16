import { NgModule } from '@angular/core';
import {
	RouterModule,
	Routes,
} from '@angular/router';

import { LocationComponent } from './components/location/location.component';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { SpecialtyComponent } from './components/specialty/specialty.component';
import { SchedulerCustomizeComponent } from './scheduler-customize.component';

const routes: Routes = [
	{
		path: '',
		component: SchedulerCustomizeComponent,
		children: [
			{
				path:'',
				redirectTo:'location',
				pathMatch:'full'
			},
			{ path: 'location', component: LocationComponent },

			{ path: 'specialty', component: SpecialtyComponent },
			{ path: 'preferences', component: PreferencesComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SchedulerCustomizeRoutingModule {}
