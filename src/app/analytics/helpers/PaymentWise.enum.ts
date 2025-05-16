export enum PaymentWiseDropDown {
    All = 0,
    Patient = 1,
    Employer = 2,
    Insurance = 3,
    LawFirm = 4
  }


  export enum HighestPayingDropDown {
    Patient = 1,
    Insurance = 2,
    Firm = 3,
    Employer = 4,
    Other = 5
  }
  export enum PaymentWiseDropDownName {
    
    Patient = "Patient",
    Employer = "Employer",
    Insurance = "Insurance",
    LawFirm =  "LawFirm"
  }
  export function DropDownOptionsList(){
  return  [{value:'Insurance',name :'Insurance'},{value:'Patient',name :'Patient'},{value:'Employer',name :'Employer'},{value:'LawFirm',name :'LawFirm'}]
  }