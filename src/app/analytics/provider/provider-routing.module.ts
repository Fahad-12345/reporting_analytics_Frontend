import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '@appDir/shared/auth/role-guard-service.service';
import { ProviderDashboardComponent } from './provider-dashboard/provider-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: ProviderDashboardComponent,
    data: {
      title: 'Provider Dashboard',
      expectedRole: 'provider'
    },
    canActivate:[RoleGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }
