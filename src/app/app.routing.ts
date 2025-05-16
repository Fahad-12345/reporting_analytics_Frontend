import {
	RouterModule,
	Routes,
} from '@angular/router';
import { BillFileUploadComponent } from './pages/content-pages/bill-file-upload/bill-file-upload.component';

import {
	ForgotPasswordComponent,
} from './pages/content-pages/forgot-password/forgot-password.component';
import { LoginPageComponent } from './pages/content-pages/login/login-page.component';
import { AuthGuard } from './shared/auth/auth-guard.service';

const routes: Routes = [
	{ path:'', 
	loadChildren:()=>import('./wrapper/wrapper.module').then(m => m.WrapperModule),
	canActivate: [AuthGuard]}
	,
	{ path: 'login', component: LoginPageComponent, data: { title: 'Login Page' } },
	{ path: 'billing-file-upload', component: BillFileUploadComponent, data: { title: 'Bill File Upload Form' }, canActivate: [AuthGuard] },
	{
		path: 'forgot-password',
		component: ForgotPasswordComponent,
		data: { title: 'Forgot Password' },
	},
	{ path: '**', 
	loadChildren:()=>import('./not-found/not-found.module').then(m => m.NotFoundModule),
 },
];
export const AppRoutes = RouterModule.forRoot(routes, {
	 initialNavigation: 'enabledBlocking',
});
