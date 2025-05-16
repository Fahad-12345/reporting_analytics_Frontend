import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { HbotService } from '@appDir/hbot/service/hbot.service';
import { ManualSpecialitiesUrlEnum } from '@appDir/manual-specialities/manual-specialities-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { VisitSession } from '@appDir/manual-specialities/models/VisitSession.model';
import { HBOTUrlEnums } from '@appDir/hbot/HBOTUrlEnums.enum';
import { zip } from 'rxjs'
import { HBOTSeederData } from '@appDir/hbot/models/seederData.model';
import { removeEmptyAndNullsArraysFormObject, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-hbot',
  templateUrl: './hbot.component.html',
  styleUrls: ['./hbot.component.scss']
})
export class HbotComponent implements OnInit {


  constructor(private requestService: RequestService, private hbotService: HbotService) {

  }

  showRoute: boolean = false;
  appointmentDetail: any
  ngOnInit() {
    let app_detail = JSON.parse(localStorage.getItem('templateObj'))
    this.hbotService.initializeAppointmentDetail(app_detail)

    let appointmentDetail = this.hbotService.getAppointmentDetail()
    this.appointmentDetail = this.hbotService.getAppointmentDetail()
    let { case_id, patientId, doctorId, speciality_id, appointment_id, visitId, id, checkInTime, speciality, location_id,template_id,provider_id,technician_id,template_type ,reading_provider_id,cd_image} = appointmentDetail;

    let $seeder = this.requestService.sendRequest(HBOTUrlEnums.getSeeders, 'get', REQUEST_SERVERS.fd_api_url)
    let $createSession = this.requestService.sendRequest(ManualSpecialitiesUrlEnum.createSession, 'post', REQUEST_SERVERS.fd_api_url_vd, {
      case_id, patient_id: patientId, doctor_id: doctorId, speciality_id, appointment_id: id, appointment_type_id: visitId, visit_date: checkInTime, facility_location_id: location_id, template_id:template_id,provider_id:provider_id,technician_id:technician_id,template_type:template_type,
	  reading_provider:reading_provider_id,
	  cd:cd_image?1:cd_image==false?0:null,
    })

    zip($seeder, $createSession).subscribe(data => {
      debugger;
      let seededData: HBOTSeederData = data[0]['result']['data'];
      this.hbotService.initializeSeederData(seededData);
      let session = data[1]['result']['data']
      let $session = this.requestService.sendRequest(ManualSpecialitiesUrlEnum.getCodes, 'get', REQUEST_SERVERS.fd_api_url_vd, removeEmptyAndNullsFormObject({ id: session.id })).subscribe(data => {
        let visitSessionCodes: VisitSession = data['result']['data']
        session.icd_codes = visitSessionCodes.icd_codes
        session.cpt_codes = visitSessionCodes.cpt_codes
        this.hbotService.initializeSession(session)
        this.showRoute = true;
      })





    })

  }

}
