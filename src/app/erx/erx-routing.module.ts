import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErxComponent } from './erx.component';
import { HomeComponent } from './components/home/home.component';
import { PrescribeComponent } from './components/prescribe/prescribe.component';
import { ViewSummaryComponent} from './components/view-summary/view-summary.component';
const routes: Routes = [
  {
    path: '',
    component: ErxComponent,
    children: [
        {
          path: '',
          component: HomeComponent,
        },
        {
          path: 'prescribe',
          component: PrescribeComponent,
        },
        {
          path: 'view-summary',
          component: ViewSummaryComponent,
        },
        {
          path: 'reports',
          loadChildren:()=>import('./components/reports/reports.module').then(m => m.ReportsModule),
        }
      ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErxRoutingModule { }
