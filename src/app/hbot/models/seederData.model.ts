export class HBOTSeederData {
    diseases: Diseases[];
    disorders: Disorders[];
    medications: Medications[];
    pressures: Pressures[];
}

export class Diseases {
    id: number;
    name: string;
}

export class Disorders {
    id: number;
    name: string;
}

export class Medications {
    id: number;
    name: string;
}

export class Pressures {//seeded moded
    id: number;
    name: string;
}

export class GetPressuresModel {//get api request model
    id: number;
    hbot_pressure_id: number;
    hbot_session_id: number;
    end_time: string;
    start_time: string;
}

export class HBOTSession {
    ata: string;
    comments: string;
    diseases: Diseases[];
    diseases_ids: number[];
    disorders: Disorders[];
    disorders_ids: number[];
    doctor_reviewed: string;
    ear_planes: string;
    id: number;
    mask: string;
    max_psi: string;
    medications: Medications[];
    medications_ids: number[];
    pressures: GetPressuresModel[];
    psi: string;
    psi_ear_pressurized: string;
    session_id: number;
    time_spent_at_max: string;
    time_started_down: string;
    time_to_zero: string;
    total_time_in_chamber: string;
}
