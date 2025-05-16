import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { Dashboard, DashboardTypes, RoleType } from '@appDir/analytics/helpers/role.enum';
import { SummeryStats } from '@appDir/analytics/models/summery-stats.model';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { chartNames } from '@appDir/analytics/helpers/charts.enum';
import { convertToCsv, setProgress, updateRandomProgress } from '@appDir/analytics/shared/export-csv';
@Component({
  selector: 'app-summery-stats',
  templateUrl: './summery-stats.component.html',
  styleUrls: ['./summery-stats.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class SummeryStatsComponent implements OnChanges {
  static hideProgressModal() {
    throw new Error('Method not implemented.');
  }
  static setProgress(arg0: number) {
    throw new Error('Method not implemented.');
  }
  @Input('filters') filters: any;
  classArray: string[] = [];

  logedInUserType: any;
  dataAssigned: Boolean = false;
  userType = RoleType;
  summeryStats: SummeryStats = new SummeryStats();
  isUserDoctor: Boolean = false;
  isUserAdmin : Boolean  = false;
  targetedDashboard : string = '';
  dashboard = Dashboard;
  dashboardType = DashboardTypes;
  
  constructor(private authService: AuthService,private storageData: StorageData, private analyticsService: AnalyticsService) {
    this.logedInUserType = this.authService.getUserType();
    this.targetedDashboard = this.storageData.getDashboardNavigation();
    const analyticsPermissions : any = this.storageData.getAnalyticsPermission();
    if(analyticsPermissions){
    if (analyticsPermissions.dashboard_type?.length !== 0 ) {
      this.isUserAdmin = true;
    } else {
      this.isUserAdmin = false
    }
  }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getSummaryData(this.filters);
  }
  getSummaryData(filters): void {
    this.isUserDoctor = this.storageData.isDoctor();
    this.dataAssigned = false;
    let apiEndpoint = '';
    if (this.isUserAdmin && (this.targetedDashboard != DashboardTypes.PracticeManager) && (this.targetedDashboard != DashboardTypes.Provider)) {
      apiEndpoint = AnalyticsUrlsEnum.Admin_Summary;
    } else  if (this.logedInUserType === this.userType?.PracticeManager || (this.targetedDashboard == DashboardTypes.PracticeManager)) {
      apiEndpoint = AnalyticsUrlsEnum.PM_Summary;
    } else 
     {
      apiEndpoint = AnalyticsUrlsEnum.Provider_Summary;
    }
    this.analyticsService.post(apiEndpoint, filters).subscribe(
      (response) => {
        const res = response?.result?.data;
        this.summeryStats = res;
        this.dataAssigned = true;
      },
      (error) => {
      }
    );
  }
  getIconClass(isPositive: boolean, value: any): string {
    if (value !== 0 && value !== '0.00' && value !== '0') {
      return isPositive
        ? 'fa fa-solid fa-arrow-up'
        : 'fa fa-solid fa-arrow-down';
    } else {
      return '';
    }
  }
  getIconClassUp(value: any): string {
    if (value !== 0) {
      return 'fa fa-solid fa-arrow-up';
    } else {
      return '';
    }
  }
  getIconClassDown(value: any): string {
    if (value !== 0) {
      return 'fa fa-solid fa-arrow-down';
    } else {
      return '';
    }
  }
  getIconPaymentClass(isPositive: boolean, value: number): string {
    if (value != 0) {
      return this.summeryStats.isPaymentPositive
        ? 'fa fa-solid fa-arrow-up'
        : 'fa fa-solid fa-arrow-down';
    } else {
      return '';
    }
  }
  getIconRecivableClass(isPositive: boolean, value: number): string {
    if (value != 0) {
      return this.summeryStats.isReceivablesPositive
        ? 'fa fa-solid fa-arrow-up'
        : 'fa fa-solid fa-arrow-down';
    } else {
      return '';
    }
  }
  getColorClassUp(isPositive: boolean, value: number): string {
    // return green color when change is positive
    if (value != 0) {
      return isPositive ? 'card-icon-green d-flex' : 'card-icon-red d-flex';
    } else {
      return 'card-icon-grey d-flex';
    }
  }
  getColorClass(isPositive: boolean, value: number): string {
    // return green color when change is positive
    if (value != 0) {
      return isPositive ? 'card-icon-green d-flex' : 'card-icon-red d-flex';
    } else {
      return 'card-icon-grey d-flex';
    }
  }
  getColorClassDown(isPositive: boolean, value: number): string {
    // return green color when change is positive
    if (value != 0) {
      return isPositive ? 'card-icon-red d-flex' : 'card-icon-green d-flex';
    } else {
      return 'card-icon-grey d-flex';
    }
  }
  showProgressModal() {
    const modalElement = document.getElementById(
      'progressModal'
    ) as HTMLElement;
    if (modalElement) {
      modalElement.style.display = 'block';
    }
  }
  hideProgressModals() {
    const modalElement = document.getElementById(
      'progressModal'
    ) as HTMLElement;
    if (modalElement) {
      modalElement.style.display = 'none';
    }
  }

  completedAppointmentsExport() {
    const [chartName, fileName] = chartNames.CompletedAppointments.split(',');
    this.pmExportCommonFuction(chartName, fileName);
  }
  averageWaitTimeExport() {
    const [chartName, fileName] = chartNames.AverageWaitTime.split(',');
    this.pmExportCommonFuction(chartName, fileName);
  }
  CancelNoShow() {
    const [chartName, fileName] = chartNames.CancelNoShow.split(',');
    this.pmExportCommonFuction(chartName, fileName);
  }
  DenialRate() {
    const [chartName, fileName] = chartNames.DenialRate.split(',');
    this.pmExportCommonFuction(chartName, fileName);
  }
  unbilledvisitExport() {
    const [chartName, fileName] = chartNames.UnbilledVisit.split(',');
    this.pmExportCommonFuction(chartName, fileName);
  }

  cancelledAppointmentsExport() {
    const [chartName, fileName] = chartNames.CancelNoShow.split(',');
    this.exportCommonFunctionForProvider(chartName, fileName);
  }

  unfinalizedVisitsExport() {
    const [chartName, fileName] = chartNames.UnfinalizedVisits.split(',');
    this.exportCommonFunctionForProvider(chartName, fileName);
  }

  totalBilledExport() {
    const [chartName, fileName] = chartNames.totalBilledExport.split(',')
    this.adminExportCommonFuction(chartName, fileName)
  }
  totalPaymentExport() {
    const [chartName, fileName] = chartNames.totalPaymentExport.split(',')
    this.adminExportCommonFuction(chartName, fileName)
  }
  totalAccountReceivableExport() {
    const [chartName, fileName] = chartNames.totalAccountReceivableExport.split(',')
    this.adminExportCommonFuction(chartName, fileName)

  }
  totalInterestExport() {
    const [chartName, fileName] = chartNames.totalInterestExport.split(',')
    this.adminExportCommonFuction(chartName, fileName)

  }
  totalWriteOffExport() {
    const [chartName, fileName] = chartNames.totalWriteOffExport.split(',')
    this.adminExportCommonFuction(chartName, fileName)
  }



  adminExportCommonFuction(chartName, fileName) {
    const newFilters = { ...this.filters, chartName: chartName };
    newFilters.disableLoaderForExports = true;

    const modalElement = document.getElementById('progressModal') as HTMLElement;
    const progressBar = document.getElementById('progressBar') as HTMLProgressElement;
    this.showProgressModal();
    let currentProgress = 0;

    const randomProgressInterval = setInterval(() => {
      currentProgress = updateRandomProgress(currentProgress, progressBar);
  }, 500); 

    this.analyticsService.post(AnalyticsUrlsEnum.admin_Export_API, newFilters).subscribe(
        (response) => {
            clearInterval(randomProgressInterval); 
            const res = response.result.data;

            if (res && (Array.isArray(res) ? res.length > 0 : true)) {
                convertToCsv(res, fileName, modalElement, progressBar);
            }
        },
        (error) => {
            clearInterval(randomProgressInterval); 
        }
    );
}
  
  exportCommonFunctionForProvider(chartName, fileName) {
    const newFilters = { ...this.filters, chartName: chartName };
    newFilters.disableLoaderForExports = true;
    const modalElement = document.getElementById('progressModal') as HTMLElement;
    const progressBar = document.getElementById('progressBar') as HTMLProgressElement;
    this.showProgressModal();
    let currentProgress = 0;

    const randomProgressInterval = setInterval(() => {
      currentProgress = updateRandomProgress(currentProgress, progressBar);
  }, 500); 

    this.analyticsService
      .post(AnalyticsUrlsEnum.PROVIDER_EXPORT_API, newFilters)
      .subscribe(
        (response) => {
          clearInterval(randomProgressInterval);
          const res = response.result.data;
          if (res && (Array.isArray(res) ? res.length > 0 : true)) {
            convertToCsv(res, fileName, modalElement, progressBar);
          } else {
            throw new Error('No Data to Export');
          }
        },
        (error) => {
          clearInterval(randomProgressInterval); 
        }
      );
  }

  pmExportCommonFuction(chartName, fileName) {
    const newFilters = { ...this.filters, chartName: chartName };
    newFilters.disableLoaderForExports = true;
    const modalElement = document.getElementById('progressModal') as HTMLElement;
    const progressBar = document.getElementById('progressBar') as HTMLProgressElement;
    this.showProgressModal();
    let currentProgress = 0;
    const randomProgressInterval = setInterval(() => {
      currentProgress = updateRandomProgress(currentProgress, progressBar);
  }, 500); 

    this.analyticsService
      .post(AnalyticsUrlsEnum.PM_EXPORT_API, newFilters)
      .subscribe(
        (response) => {
          clearInterval(randomProgressInterval);
          const res = response.result.data;
          if (res && (Array.isArray(res) ? res?.length > 0 : true)) {
            convertToCsv(res, fileName, modalElement, progressBar);
          }
        },
        (error) => {
          clearInterval(randomProgressInterval);
        }
      );
}
}
