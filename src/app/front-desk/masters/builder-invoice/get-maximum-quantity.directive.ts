import { Directive } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Directive({
  selector: '[getMaximumQuantity]',
})
export class GetMaximumQuantityDirective {
  constructor(private toastrService: ToastrService) {}

  compareQuantities(event, index, inventories?, row?, patientServicesDetails?) {
    let getInventory = inventories.find(
      (inventory) => inventory.id == row.inventory_id
    );
    let max =
      patientServicesDetails.length > 0 &&
      patientServicesDetails[index]['total_remaining_quantity']
        ? patientServicesDetails[index]['total_remaining_quantity']
        : getInventory.remaining_quantity;
    if (Number(event.target.value) > Number(max)) {
      event.target.value = '1';
      let toast = this.toastrService;
      toast.toastrConfig.preventDuplicates = true;
      toast.error(`There isn't enough quantity available`, 'Error');
      return;
    }
  }
}
