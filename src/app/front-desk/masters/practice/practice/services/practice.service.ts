import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { FacilityUrlsEnum } from '../utils/facility-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
@Injectable({
  providedIn: 'root'
})
export class PracticeService {
  appointments_slugs=["schedule_change","patient_cancelled","other","insurance_issues","as_per_atty","transport", "practice_off","provider_cancelled"];

  constructor(protected requestService: RequestService) {}

  public facilityStatus(data){
    return this.requestService
    .sendRequest(
      FacilityUrlsEnum.Facility_Status_Update,
      'PUT',
      REQUEST_SERVERS.fd_api_url,
      data,
    )
}

public facilityLocationsAppointments(data){
  return this.requestService
  .sendRequest(
    FacilityUrlsEnum.Facility_Locations_Appointments,
    'GET',
    REQUEST_SERVERS.schedulerApiUrl1,
    data,
  )
}

public getAppointmensComments(){
  return this.requestService
  .sendRequest(
    FacilityUrlsEnum.appointmentCancellationComments,
      'GET',
    REQUEST_SERVERS.schedulerApiUrl1,
  )
}

public CancelAppointmentAndAssigments(data){
  return this.requestService
  .sendRequest(
    FacilityUrlsEnum.updateAppointmentAndAssigment,
      'PUT',
    REQUEST_SERVERS.schedulerApiUrl1,
    data,
  )
}

public appointmentsCommentsSelection(arr) {
  const selectedAppointment = arr?.filter(appointment => this.appointments_slugs.includes(appointment?.slug));
  const selectAppointmentName = selectedAppointment.find(appointment => appointment?.slug === 'practice_off')?.name || '';

  return { selectedAppointment, selectAppointmentName };
}


}
