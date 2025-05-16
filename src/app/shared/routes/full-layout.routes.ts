import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { AuthService } from '../auth/auth.service';
import { RoleGuardService } from '../auth/role-guard-service.service';

import { DynamicFormComponentDemo } from '../dynamic-form/dynamic-form-component/dynamic-form.component';




export const Full_ROUTES: Routes = [
	{
		redirectTo:'',
		pathMatch:'full',
		path:'front-desk',
		

	},
	{
		path: 'home',
		loadChildren:()=>import('app/home/home.module').then(m => m.HomeModule)

	},
	{
		path: 'scheduler-front-desk',
	loadChildren:()=>import('app/scheduler-front-desk/scheduler-front-desk.module').then(m => m.SchedulerFrontDeskModule)
	},

	{
		path: 'manual-specialities',
		loadChildren:()=>import('app/manual-specialities/manual-specialities.module').then(m => m.ManualSpecialitiesModule)
	},
	{
		path: 'hbot',
		loadChildren:()=>import('app/hbot/hbot.module').then(m => m.HbotModule)
	},
	{
		path: 'medical-doctor',
		loadChildren:()=>import('app/medical-doctor/medical-doctor.module').then(m => m.MedicalDoctorModule)
	},
	
	{
		path: 'unbilled-visits',
	 	loadChildren:()=>import('app/bill-visits/bill-visits.module').then(m => m.BillVistsModule)

	},
	{
		path: 'payments',
    	loadChildren:()=>import('app/payments/payment.module').then(m => m.PaymentModule)

	},
	{
		path: 'denial',
		loadChildren:()=>import('app/denial/denial.module').then(m => m.DenialModule)

	},

	{
		path: 'verification',
		loadChildren:()=>import('app/verification/verification.module').then(m => m.VerificationModule)
	},
	{
		path: 'eor',
		loadChildren:()=>import('app/eor/eor.module').then(m => m.EorModule)

	},
	{
		path: 'pom',
		loadChildren:()=>import('app/pom/pom.module').then(m => m.PomBillModule),

	},
	{
        path:'visit-reports',
		loadChildren : () => import('app/front-desk/reports/visit-report/visit-report.module').then(m =>m.VisitReportModule)
	},
	{
		path:'bills',
		loadChildren:()=>import('app/bill-payment/bill-payment.module').then(m => m.BillPaymentModule),

		data: {
			title: 'Billing',
		},
	},
	{
		path: 'front-desk',
		loadChildren:()=>import('app/front-desk/front-desk.module').then(m => m.FrontDeskModule),
		data: {
			expectedRole: 'front-desk',
		},
	},
	{ path: 'front-desk/patients', 
	loadChildren:()=>import('app/front-desk/patient/patient.module').then(m => m.PatientModule)
},
 { path: 'front-desk/cases',
  loadChildren:()=>import('app/front-desk/cases/cases.module').then(m => m.CasesModule)

},
	{ path: 'front-desk/reports',
	 loadChildren:()=>import('app/front-desk/reports/reports.module').then(m => m.ReportsModule)
	},

	{ path: 'front-desk/masters', 
	loadChildren:()=>import('app/front-desk/masters/masters.module').then(m => m.MastersModule)
},

// },
	{
		path: 'erx',
		loadChildren:()=>import('app/erx/erx.module').then(m => m.ErxUserModule),
	},
	{
			path: 'front-desk/masters/practice',
			loadChildren:()=>import('app/front-desk/masters/practice/practice.module').then(m => m.PracticeModule),
			data: {
			}
		},
		
	{
		path: 'template-manager',
		loadChildren:()=>import('app/template-manager/template-manager.module').then(m => m.TemplateManagerModule),
		data: {
			expectedRole: 'front-desk',
		},
	},
	{
		path: 'dynamic-form',
		component: DynamicFormComponentDemo,
	},
	{
		path: 'packet',
		loadChildren:()=>import('app/packets/packets.module').then(m => m.PacketsModule),
		data: {
			expectedRole: 'Packets',
		}
	},
	{
		path:'analytics',
		loadChildren : () => import('app/analytics/analytics.module').then((m =>m.AnalyticsModule)),
		canActivate:[AuthGuard]
	}
];
