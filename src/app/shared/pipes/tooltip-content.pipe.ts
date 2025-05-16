import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tooltipContent'
})
export class TooltipContentPipe implements PipeTransform {

  transform(value: any, args?: any): string {
    if (value && value['visit_status_slug'] == 'no_show') {
      return 'The Appointment Cannot Be Modified Due To Being Backdated.'
    } else if (value && value['visit_status_slug'] == 'checked_out') {
      return 'The Appointment Cannot Be Modified Because The Visit Has Been Created.'
    }
    else if (value && value['visit_status_slug'] == 'in_session') {
      return 'The Appointment Cannot Be Modified Because The Patient Is Currently Checked-In.'
    }
    else if (!(value && value['allow_multiple_cpt_codes'])) {
      return 'This Button Cannot Be Used Because The “Allow Multiple CPTs” Toggle Is Off Against The Selected Specialty And Visit Type.'
    }else{
      return 'Add CPT'
    }
    return null;
  }

}
