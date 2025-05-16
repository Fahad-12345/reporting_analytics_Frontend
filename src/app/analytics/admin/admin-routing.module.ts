import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '@appDir/shared/auth/role-guard-service.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    data: {
      title: 'Admin Dashboard',
      expectedRole: 'super_admin'
    },
    canActivate:[RoleGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
