import { DialogEnum } from "./Case.model";

export class PatientModel {
    id: number;
    key: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: Date;
    gender: GenderEnum;
    age: number;
    ssn: string;
    height_ft: number;
    height_in: number;
    weight_lbs: number;
    weight_kg: number;
    meritial_status: MaritalStatusEnum;
    profile_avatar: string;
    need_translator: boolean;
    language: string;
    is_pregnant: string;
    is_law_enforcement_agent: DialogEnum;
    allergy_status_id: string | null
    allergy_types : []
}
export enum GenderEnum {
    male = 'male',
    female = 'female',
    other = 'indeterminate',
    x = 'x'
}
export enum MaritalStatusEnum {
    single = 'single',
    married = 'married',
    divorce = 'divorced',
    widowed = 'widowed'
}
