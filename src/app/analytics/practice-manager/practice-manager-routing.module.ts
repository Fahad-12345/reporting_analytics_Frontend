import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '@appDir/shared/auth/role-guard-service.service';
import { PracticeManagerDashboardComponent } from './practice-manager-dashboard/practice-manager-dashboard.component';

const routes: Routes = [

  {
    path: 'dashboard',
    component: PracticeManagerDashboardComponent,
    data: {
      title: 'Practice Manager Dashboard',
      expectedRole: 'practice_manager'
    },
    canActivate:[RoleGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PracticeManagerRoutingModule { }
