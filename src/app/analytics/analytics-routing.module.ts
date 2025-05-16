import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsComponent } from './components/analytics/analytics.component';
const routes: Routes = [
  {
    path: '',
    component: AnalyticsComponent,
    data: {
      title: 'Analytics',
      link: {},

    },
    children: [
      {
        path: 'admin',
        loadChildren:()=>import('../analytics/admin/admin.module').then(m => m.AdminModule)
      },
      {
        path: 'provider',
        loadChildren:()=>import('../analytics/provider/provider.module').then(m => m.ProviderModule)
      },
      {
        path: 'practice-manager',
        loadChildren:()=>import('../analytics/practice-manager/practice-manager.module').then(m => m.PracticeManagerModule)
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
