import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PacketsListComponent } from './component/packets-list/packets-list.component';
import { PacketsComponent } from './component/packets/packets.component';

const routes: Routes = [
	{
		path: '',
		component: PacketsComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'packet-list' },
			{
				path: 'packet-list',
				component: PacketsListComponent,
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PacketsRoutingModule {}
