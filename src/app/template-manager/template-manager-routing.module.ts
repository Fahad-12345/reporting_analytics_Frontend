import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateManagerComponent } from './template-manager.component';
import { HomeComponent } from './components/home/home.component';
const routes: Routes = [
	{
		path: '',
		component: TemplateManagerComponent,
		children: [
			{
				path: '',
				component: HomeComponent,
			},
			{
				path: 'instance',
				component: HomeComponent,
			},
		],
	},
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class TemplateManagerRoutingModule {}
