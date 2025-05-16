
export const FRONT_DESK_LINKS: any[] = [
    { 
      link: 'patient/patient_summary', 
      name: 'Patient Summary',  
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    { 
      link: 'patient/personal-information', 
      name: 'Personal Information',  
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    { 
      // link: 'insurance/edit-all', 
      link: 'case-insurance', 
      name: 'Insurance',  
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    // { 
    //   link: 'attorney/edit', 
    //   name: 'Attorney',  
    //   caseType: ['WC', 'No Fault', 'Private', 'Lien', 'Self Pay'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI', 'Drug Testing'] 
    // },
    // { 
    //   link: 'referring/edit-all', 
    //   name: 'Physician Information',  
    //   caseType: ['WC', 'No Fault', 'Private', 'Lien', 'Self Pay'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI', 'Drug Testing'] 
    // },
    // { 
    //   link: 'employer', 
    //   name: 'Employer',  
    //   caseType: ['WC', 'No Fault', 'Private', 'Lien', 'Self Pay'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI', 'Drug Testing'] 
    // },
    { 
      link: 'injury', 
      name: 'Injury', 
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical'], 
      purpose: ['Injury']
    },
    // { 
    //   link: 'accident/edit', 
    //   name: 'Accident', 
    //   caseType: ['No Fault','Private', 'Other', 'Lien', 'Diagnostic', 'Self Pay'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI', 'Drug Testing'] 
    // },
    { 
      link: 'referrals', 
      name: 'Referrals',  
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    { 
      link: 'document', 
      name: 'Documents', 
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    // { 
    //   link: 'vehicles/vehicle-info/edit', 
    //   name: 'Vehicle Information', 
    //   caseType: ['No Fault', 'Diagnostic', 'Lien', 'Private'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI'] 
    // },
    // { 
    //   link: 'household', 
    //   name: 'Household Information', 
    //   caseType: ['No Fault', 'Diagnostic', 'Lien', 'Private'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI'] 
    // },
    // { 
    //   link: 'documents', 
    //   name: 'Documents', 
    //   caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI', 'Drug Testing'] 
    // },
    { 
      link: 'scheduler', 
      name: 'Scheduler', 
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    { 
      link: 'billing', 
      name: 'Billing', 
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    { 
      link: 'collection', 
      name: 'Collection', 
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    { 
      link: 'marketing', 
      name: 'Marketing', 
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    { 
      link: 'comments', 
      name: 'Comments', 
      caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
      speciality: ['Medical', 'Diagnostic'], 
      purpose: ['Injury', 'MRI', 'Drug Testing'] 
    },
    // { 
    //   link: 'bodyparts', 
    //   name: 'Bodyparts',  
    //   caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
    //   speciality: ['Medical', 'Diagnostic'], 
    //   purpose: ['Injury', 'MRI', 'Drug Testing'] 
    // },
    // { 
    //   link: 'mri', 
    //   name: 'MRI Diagnostice',  
    //   caseType: ['WC', 'No Fault', 'Private', 'Diagnostic', 'Lien', 'Self Pay'], 
    //   speciality: ['Diagnostic'], 
    //   purpose: ['MRI'] 
    // },
  ];
  
  export function leftPanelLinks(page){
    if(page=='front-desk'){
        return FRONT_DESK_LINKS;
    }
    else{
        return {};
    } 
  }