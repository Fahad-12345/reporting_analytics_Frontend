import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AclService } from '@appDir/shared/services/acl.service';
@Component({
	selector: 'app-front-desk-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent extends PermissionComponent implements OnInit {
	public menu: any[] = [];
	public mainmenu: any[] = [];
	public submenu: any[] = [];
	public ssubmenu: any[] = [];
	public ssubmenu3: any[] = [];

	constructor(
		router: Router,
		private storageData: StorageData,
		private analyticsService: AnalyticsService,
		aclService: AclService,
		
	) {
		super(aclService, router);
	}

	ngOnInit()  {
		this.menu = this.storageData.getMenu();//this.aclSerive.fetchMenu();
		this.getReportsPermissions().then(() => {
			this.replaceStatusReport();
			this.makePermissionMenu();
		});
	}
	getModule() {
	}

	 replaceStatusReport() {
		const appointmentReportObj = {
			id: 122,
			name: 'Appointment Report',
			parent_id: 113,
			routerLink: '/front-desk/reports/appointment-reports',
			slug: 'appointment-reports',
		  };
		this.menu.forEach((menuItem) => {
		  if (menuItem.slug === 'reports_menu' && menuItem.sub_menus) {
			const statusReportIndex = menuItem.sub_menus.findIndex(
			  (subMenuItem: any) => subMenuItem.slug === 'status-report'
			);
	  		if (statusReportIndex !== -1) {
			  menuItem.sub_menus[statusReportIndex] = appointmentReportObj;
			}
		  }
		});
	  }

	pushAnalyticsReports(denial:Boolean,payment:Boolean,ar:Boolean){
		this.menu.forEach(mainMenu=>{
		if (mainMenu['slug']=== "reports_menu"){
		if(denial){
			mainMenu.sub_menus.push({
				id: 119,
				name: "Denial Report",
				parent_id:113,
				slug: "denial-reports"});
		}
		if(payment){
			mainMenu.sub_menus.push({

				id: 121,
				name: "Payment Report",
				parent_id:113,
				slug: "payment-reports"});
		}
		if(ar){
			mainMenu.sub_menus.push({
				id: 120,
				name: "A/R Report",
				parent_id:113,
				slug: "ar-reports"});
		}
	}
	})
	}

	// getReportsPermissions(){
	// 	const userId = this.storageData.getUserId()
	// 	const userObject = {user_id : userId}
	// 		return new Promise((resolve, reject) => {
	// 		  this.analyticsService.post(AnalyticsUrlsEnum.permissions, userObject).subscribe(
	// 			(response) => {
	// 			  const visit = response.result.data
	// 			  if (visit ) {
	// 				this.storageData.setAnalyticsPermission(visit)
	// 				const reportType =visit.report_type;
	// 				const dashboardType = visit.dashboard_type;
	// 				let pushed ;
	// 				if(reportType && reportType.length > 0){
	// 					if(reportType.includes('*')){
	// 						pushed =this.pushAnalyticsReports(true,true,true)
	// 					}else{
	// 						if(reportType.includes('denial')){
	// 							pushed = this.pushAnalyticsReports(true,false,false)
	// 						}
	// 						if(reportType.includes('payment')){
	// 							this.pushAnalyticsReports(false,true,false)
	// 						}
	// 						if(reportType.includes('ar')){
	// 							this.pushAnalyticsReports(false,false,true)
	// 						}
	// 					}
	// 				}
	// 				resolve(true);
	// 				if(pushed){
	// 				return true
	// 			} else{
	// 				return false
	// 			}
	// 			  } else {
	// 				resolve(false);
	// 			  }
	// 			},
	// 			(error) => {
	// 			  console.error('Error fetching visit status data:', error);
	// 			  resolve(false);
	// 			}
	// 		  );
	// 		})
	// }
	getReportsPermissions() {
		return new Promise((resolve, reject) => {
		  const permissions : any = this.storageData.getAnalyticsPermission();
		  if (permissions && this.storageData.IsReportShowAble()) {
			const reportType = permissions.report_type;
			if (reportType && reportType.length > 0) {
			  if (reportType.includes('*')) {
				this.pushAnalyticsReports(true, true, true);
			  } else {
				if (reportType.includes('denial')) {
				  this.pushAnalyticsReports(true, false, false);
				}
				if (reportType.includes('payment')) {
				  this.pushAnalyticsReports(false, true, false);
				}
				if (reportType.includes('ar')) {
				  this.pushAnalyticsReports(false, false, true);
				}
			  }
			}
			resolve(true);
		  } else {
			resolve(false);
		  }
		});
	  }
	  

	makePermissionMenu(){
		this.menu.forEach(mainMenu=>{
			{
				if (mainMenu['slug']=== "patient_menu"){
					mainMenu['icon']= "icon-patient";
				}
				else if (mainMenu['slug']=== "scheduler_menu"){
					mainMenu['icon']= "icon-Scheduler";
				}
				else if (mainMenu['slug']=== "master_menu"){
					mainMenu['icon']= "icon-master";
				}
				else if (mainMenu['slug']=== "template_menu"){
					mainMenu['routerLink'] = "/template-manager";
					mainMenu['icon']= "icon2-edit";

				}
				mainMenu.sub_menus&&mainMenu.sub_menus.forEach(subMenu => {
					if (subMenu['slug']==="patient_patient_list_menu"){

						subMenu['routerLink'] = "/front-desk/patients/list";
					}
					else if (subMenu['slug']==="patient_case_list_menu"){
						subMenu['routerLink'] = "/front-desk/cases/list";
					} 
					else if (subMenu['slug']==="soft-patient-list-menu"){
						subMenu['routerLink'] = "/front-desk/soft-patient/list";
					} 


					else if (subMenu['slug'] === "main_erx_task_list") {

						subMenu['routerLink'] = "/erx";
					}
					else if (subMenu['slug'] === "main_erx_prescribe") {
						subMenu['routerLink'] = "/erx/prescribe";
					}
					else if (subMenu['slug'] === "main_erx_reports") {
						subMenu['routerLink'] = "/erx/reports";
					}

					else if (subMenu['slug'] === 'admin-billing-created-bills-menu'){
						subMenu['routerLink'] = "/bills/bill-list";
						mainMenu['icon']= "icon-billing";
					}

					else if (subMenu['slug'] ==='admin-billing-visits-menu'){
						subMenu['routerLink'] = "/unbilled-visits/visits-list";
					}

					else if (subMenu['slug'] ==='reports-menu-bill-speciality'){
						subMenu['routerLink'] = "/bills/bill-speciality-list";
					}
					else if (subMenu['slug'] ==='transportation-report'){
						subMenu['routerLink'] = "/front-desk/reports/transportation-reports";
					}
					else if (subMenu['slug'] ==='status-report'){
						subMenu['routerLink'] = "/front-desk/reports/appointment-status-reports";
					}
					else if (subMenu['slug'] ==='denial-detail-reports'){
						subMenu['routerLink'] = "/front-desk/reports/denial-detail-reports";
					}
					else if (subMenu['slug'] ==='denial-reports'){
						subMenu['routerLink'] = "/front-desk/reports/denial-reports";
					}
					else if (subMenu['slug'] ==='appointment-reports'){
						subMenu['routerLink'] = "/front-desk/reports/appointment-reports";
						subMenu['queryParams'] = { type: 1 };
					}
					else if (subMenu['slug'] ==='ar-reports'){
						subMenu['routerLink'] = "/front-desk/reports/ar-reports";
					}
					else if (subMenu['slug'] ==='payment-reports'){
						subMenu['routerLink'] = "/front-desk/reports/payment-reports";
						subMenu['queryParams'] = { type: 1 };
					}

					else if (subMenu['slug']=== this.userPermissions.adminBillingPomMenu){
						subMenu['routerLink'] = "/pom/pom-list";
					}
					else if (subMenu['slug']=== this.userPermissions.adminBillingPacketMenu){
						subMenu['routerLink'] = "/packet/packet-list";
					}
				

					else if (subMenu['name']==="NF2")
					{
						subMenu['routerLink'] = '/front-desk/reports/nf2-reports';
						mainMenu['icon']= "icon-reports";
					}
					else if (subMenu['slug']==="master_provider_menu"){

						if (this.aclService.hasPermission(this.userPermissions.master_speciality_tab) ){
							subMenu['routerLink'] = "/front-desk/masters/providers/speciality";
							
						}
						else if ( this.aclService.hasPermission(this.userPermissions.master_case_type_tab)){
							subMenu['routerLink'] = "/front-desk/masters/providers/case-type";
							
						}
						else if (  this.aclService.hasPermission(this.userPermissions.master_visit_type_tab)){
							subMenu['routerLink'] = "/front-desk/masters/providers/visit-type";	
						}	
					}
					else if (subMenu['slug']==="master_practice_menu"){
						if(this.aclService.hasPermission(USERPERMISSIONS.master_practice_tab))
						{
							subMenu['routerLink'] = "/front-desk/masters/practice/practice/list";
						}
						else if(this.aclService.hasPermission(USERPERMISSIONS.master_hospital_tab))
						{
							subMenu['routerLink'] = "/front-desk/masters/practice/hospital";
						}
						else if(this.aclService.hasPermission(USERPERMISSIONS.master_practice_referring_physician_menu))
						{
							if(this.aclService.hasPermission(this.userPermissions.master_clinic_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/practice/referral/clinic";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_referring_physician_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/practice/referral/physician/list";
							}
						}
					}

					else if (subMenu['slug']==="master_user_menu"){

						if (this.aclService.hasPermission(this.userPermissions.master_user_list_tab) ){
							subMenu['routerLink'] = "/front-desk/masters/users/creation/list";
						  
					   	}
					   else if (this.aclService.hasPermission(this.userPermissions.master_user_roles_tab) 
					   && !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
					   ){
						subMenu['routerLink'] = "/front-desk/masters/users/role";
						   
					   }
					   else if (this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab))
					   {
						subMenu['routerLink'] = "/front-desk/masters/users/designation";
						 
					   }
					   else if (this.aclService.hasPermission(this.userPermissions.master_user_department_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_designation_tab) )
					  {
						subMenu['routerLink'] = "/front-desk/masters/users/department";
						  
					   }
					   else if (this.aclService.hasPermission(this.userPermissions.master_user_emp_type_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_department_tab))
					   {
						subMenu['routerLink'] = "/front-desk/masters/users/employment-type"; 
					   }
					   else if (this.aclService.hasPermission(this.userPermissions.master_user_emp_by_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_list_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_roles_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_designation_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_department_tab)
					   && !this.aclService.hasPermission(this.userPermissions.master_user_emp_type_tab) )
					   {
						subMenu['routerLink'] = "/front-desk/masters/users/employment-by";			  
						   }
					 }	
					
					else if (subMenu['slug']==="master_billing_menu"){
						if (this.aclService.hasPermission(this.userPermissions.master_billing_insurance_menu) ){

							if(this.aclService.hasPermission(this.userPermissions.master_billing_insurance_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/insurance/insurance";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_adjuster_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/insurance/adjuster-information";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_plan_name_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/insurance/planname";
							}

							else if(this.aclService.hasPermission(this.userPermissions.master_billing_plan_type_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/insurance/plantype";
							}
							
							
						}
						else if (this.aclService.hasPermission(this.userPermissions.master_billing_attorney_menu) ){

							if(this.aclService.hasPermission(this.userPermissions.master_billing_firm_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/attorney/firm";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_attorney_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/attorney/attorney";
							}
							
						
						}
						else if (this.aclService.hasPermission(this.userPermissions.master_billing_employer_menu) ){
							
							subMenu['routerLink'] = "/front-desk/masters/billing/employer";
						
						}
						else if (this.aclService.hasPermission(this.userPermissions.master_billing_employer_menu) ){
							
							subMenu['routerLink'] = "/front-desk/masters/billing/clearinghouse";
						
						}
						else if (this.aclService.hasPermission(this.userPermissions.master_billing_codes_menu) ){
							if(this.aclService.hasPermission(this.userPermissions.master_billing_codes_icd_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/codes/Icd-codes";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_codes_cpt_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/codes/Cpt-codes";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_codes_hcpcs_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/codes/Hcpcs-codes";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_codes_fee_sc_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/codes/Fee-Schedule";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_codes_code_type_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/codes/Fee-Type";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_billing_codes_fee_sc_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/codes/Code-Type";
							}

						

							// this.onClickLink('codes/Icd-codes');
						}
						else if (this.aclService.hasPermission(this.userPermissions.master_billing_billing_menu) ){
							if(this.aclService.hasPermission(this.userPermissions.master_bb_pt_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/payment-type";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_vt_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/verification-type";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_denial_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/denial-type";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_pb_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/paid-by";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_pos_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/place-of-service";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_mod_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/modifiers-type";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_cs_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/case-status";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_region_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/region";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_billing_title_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/billing-title";
							}
							else if(this.aclService.hasPermission(this.userPermissions.master_bb_emp_type_tab))
							{
								subMenu['routerLink'] = "/front-desk/masters/billing/billing-master/billing-employment-type";
							}
						}
						else if (subMenu['slug'] === "master_invoice_menu"){
							debugger;
							// subMenu['routerLink'] = "/front-desk/masters/billing/invoice";
							subMenu['routerLink'] = "/front-desk/masters/billing/codes/Cpt-codes";

						}
					
					}
					else if(subMenu['slug'] === "master_invoice_menu"){
						debugger;
						subMenu['routerLink'] = "/front-desk/masters/billing/invoice";
					}
					else if (subMenu['slug']==="master_template_menu"){
						subMenu['routerLink'] = "/front-desk/masters/template";
					}
					else if (subMenu['slug']==="master_erx_menu"){
						subMenu['routerLink'] = "/front-desk/masters/erx";
					}
					else if (subMenu['slug']==="scheduler_scheduler_list_menu"){
						subMenu['routerLink'] = "/scheduler-front-desk/schedule-list";
					}
					else if (subMenu['slug']==="scheduler_appointment_list_menu"){
						subMenu['routerLink'] = "/scheduler-front-desk/appointments";
					}
					else if (subMenu['slug']==="scheduler_doctor_calendar_menu"){
						subMenu['routerLink'] = "/scheduler-front-desk/doctor-calendar";
					}
					else if (subMenu['slug']==="scheduler_waiting_list_for_front_desk_menu"){
						subMenu['routerLink'] = "/front-desk/masters/providers";
					}
					else if (subMenu['slug']==="scheduler_cancelled_appointment_list_menu"){
						subMenu['routerLink'] = "/scheduler-front-desk/cancel-app";
					}
					else if (subMenu['slug']==="scheduler_customize_menu" && this.aclService.hasPermission(this.userPermissions.scheduler_customize_menu)){
						if(this.aclService.hasPermission(this.userPermissions.customize_facility_menu))
						{
							subMenu['routerLink'] = "/scheduler-front-desk/customize/location";
						}
						else if(this.aclService.hasPermission(this.userPermissions.customize_speciality_menu))
						{
							subMenu['routerLink'] = "/scheduler-front-desk/customize/specialty";
						}
						else if(this.aclService.hasPermission(this.userPermissions.customize_preference_menu))
						{
							subMenu['routerLink'] = "/scheduler-front-desk/customize/preferences";
						}
						
					}
					else if (subMenu['slug']==="scheduler_assignment_menu"){
						if(this.aclService.hasPermission(this.userPermissions.assignment_menu))
						{
							subMenu['routerLink'] = "/scheduler-front-desk/speciality";
						}
						else if(this.aclService.hasPermission(this.userPermissions.assignment_menu) && this.aclService.hasPermission(this.userPermissions.notification_menu))
						{
							subMenu['routerLink'] = "/scheduler-front-desk/notifications_sup";
						}
					}
					else if (subMenu['slug']==="scheduler_waiting_list_doctor_menu"){
						subMenu['routerLink'] = "/scheduler-front-desk/waiting-list-doc";
					}
					else if (subMenu['slug'] === "master_invoice_menu"){
						debugger;
						subMenu['routerLink'] = "/front-desk/masters/billing/invoice";
					}
					else {
						subMenu['routerLink'] = "/404";	
					}
				});
			}

		});
	}
	navigatToChild(param) {
		return true;
	}
	navigate(menuItem) {
		debugger;
		(menuItem.sub_menus) ? null : this.router.navigate([menuItem.link]);
	}
}
