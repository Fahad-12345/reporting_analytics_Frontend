import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CaseInsuranceComponent } from './case-insurance.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { MriIntakesComponent } from './mri-intakes/mri-intakes.component';

const routes: Routes = [
	{
		path: "",
		redirectTo: "insurance",
		pathMatch: "full"
	},
	{
		path: "insurance",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./insurance/insurance.module').then(m => m.InsuranceModule),

		data: {
			permission: USERPERMISSIONS.patient_case_list_insurance_insurance_tab
		}
	},
	{
		path: "attorney",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./attorney/attorney.module').then(m => m.AttorneyModule),
		data: {
			permission: USERPERMISSIONS.patient_case_list_insurance_attorney_tab
		}
	},
	{
		path: "employer",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./employer/employer.module').then(m => m.EmployerModule),
		data: {
			permission: USERPERMISSIONS.patient_case_list_insurance_employer_tab
		}
	},
	{
		path: "accident",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./accident/accident.module').then(m => m.AccidentModule),

		data: {
			permission: USERPERMISSIONS.patient_case_list_insurance_accident_tab
		}
	},
	{
		path: "vehicle",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./vehicle/vehicle.module').then(m => m.VehicleModule),
		data: {
			permission: USERPERMISSIONS.patient_case_list_insurance_vehicle_tab
		}
	},
	{
		path: "house-hold-info",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./house-hold-info/house-hold-info.module').then(m => m.HouseHoldInfoModule),

		data: {
			permission: USERPERMISSIONS.patient_case_list_insurance_household_tab
		}
	},
	{
		path: "authorization",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./authorization/authorization.module').then(m => m.AuthorizationModule),

		data: {
			permission: USERPERMISSIONS.patient_authorization_tab
		}
	},
	{
		path: "medical-treatment",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./medical-treatment/medical-treatment.module').then(m => m.MedicalTreatmentModule),

		data: {
			permission: USERPERMISSIONS.patient_case_list_insurance_medical_treatment_tab
		}
	},
	{
		path: "mri-intake",
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./mri-intake/mri-intake.module').then(m => m.MriIntakeModule),

		
		data: {
			permission: USERPERMISSIONS.patient_mri_intake_tab
		}
	},

	{
		path:'mri-intakes',
		component: CaseInsuranceComponent,
		loadChildren:()=>import('./mri-intakes/mri-intakes.module').then(m => m.MRIIntakesModule),

	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CaseInsuranceRoutingModule { }
