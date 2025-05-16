export const FABRIC_OBJECT_PROPS = {
    lockMovementX: true,
    lockMovementY: true,
    lockScalingY: true,
    lockScalingX: true,
    lockRotation: true,
    lockScalingFlip: true, // to lock flipping while scalling
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: true,
    strokeUniform: true,
    subTargetCheck: true,
    hasControls: false,
    noScaleCache: false,
    objectCache: false,
    statefullCache: true,
    selectable : false,
    borderScaleFactor: 1
  }

  export const DEFAULT_CANVAS_HEIGHT = 400
  export const DEFAULT_CANVAS_WIDTH = 700

  export const DOCTOR_EVALUATION_SECTION_TYPES = {
    EVALUATION_PREVIEW: "Preview",
    INSTANCE_PREVIEW: "PDF Preview"
  }

  export enum UI_COMPONENT_TYPES {
    CALCULATION = 'calculation',
    CHECKBOX = 'checkBox',
    DRAWING = 'drawing',
    DROPDOWN = 'dropDown',
    IMAGE_LABEL = 'image',
    INCREMENT = 'increment',
    INPUT = 'input',
    INTELLISENSE = 'intellisense',
    INTENSITY = 'intensity',
    LINE = 'line',
    RADIO = 'radio',
    SIGNATURE = 'templatesignature',
    SIMPLE_IMAGE = 'simpleImage',
    SWITCH = 'switch',
    TABLE_DROPDOWN = 'tableDropdown',
    TEXT = 'text'
  }
  
  export interface signatureTypeObject {
    name: string,
    type: SIGNATURE_TYPES
  }

  export enum SIGNATURE_TYPES {
    DOCTOR_SIGNATURE = "DOCTOR_SIGNATURE",
    PATIENT_SIGNATURE = "PATIENT_SIGNATURE",
    PA_SIGNATURE = "PA_SIGNATURE",
    OTHER_SIGNATURE = "OTHER_SIGNATURE"
  }
  
  export enum GENERATE_PDF_OPTIONS {
    GENERATE_AND_FINALIZE,
    GENERATE_SINGLE_REPORT,
    GENERATE_ALL_REPORTS
  }

  export const SignatureTypesArray: signatureTypeObject[] = [
    {  
      name: "Doctor Signature",
      type: SIGNATURE_TYPES.DOCTOR_SIGNATURE
    },
    {  
      name: "Patient Signature",
      type: SIGNATURE_TYPES.PATIENT_SIGNATURE
    },
    {
      name: "PA Signature",
      type: SIGNATURE_TYPES.PA_SIGNATURE
    },
    {
      name: "Other",
      type: SIGNATURE_TYPES.OTHER_SIGNATURE
    }
  ]

export interface uiAnswer {
  answer: string
}


