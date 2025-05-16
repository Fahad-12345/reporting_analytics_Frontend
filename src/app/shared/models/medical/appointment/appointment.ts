import { Case } from './case/case';
import { Doctor } from './doctor/doctor';
import { MedicalSession } from './medical-session/medical-session';
import { Patient } from './patient/patient';

export class Appointment {
    public _id: number;
    public _start: string; // Appointment start date and time
    public _end: string; // Appointment end date and time
    public _title: string;
    public _chartNo: string;
    public _status: string;
    public _checkInTime: string;
    public _speciality: string;
    public _dateOfAccident: string;
    public _caseId: string;
    public _patientId: string;
    public _doctorId: string;
    public _visitType: string;
    public _visitId: number;
    public _isComplete: Boolean;
    public _doctor: Doctor;
    public _patient: Patient;
    public _case: Case;
    public _session: MedicalSession;
    public _previousAppointmentDate: string;

    /**
     * Creates an instance of appointment.
     * @param appointment 
     */
    constructor(appointment) {
        this.setAppointment(appointment);
    }

    /**
     * Sets appointment
     * @param appointment 
     */
    setAppointment(appointment) {
        if (appointment) {
            this.id = appointment.id || null;
            this.start = appointment.start || null;
            this.end = appointment.end || null;
            this.title = appointment.title || null;
            this.chartNo = appointment.chartNo || null;
            this.status = appointment.status || null;
            this.speciality = appointment.speciality || null;
            this.caseId = appointment.caseId || null;
            this.patientId = appointment.patientId || null;
            this.doctorId = appointment.doctorId || null;
            this.visitType = appointment.visitType || null;
            this.visitId = appointment.visitId || null;
            this.isComplete = appointment.isComplete || false;
            this.doctor = appointment.doctor || null;
            this.patient = appointment.patient || null;
            this.case = (appointment.case) || null;
            this.session = appointment.session || null;
            this.previousAppointmentDate = appointment.previousAppointmentDate || null;
            this.checkInTime = appointment.checkInTime || null;
        }

    }


    /**
     * Gets id
     */
    public get id(): number {
        return this._id;
    }

    /**
     * Sets id
     */
    public set id(id: number) {
        this._id = id;
    }

    /**
     * Gets start
     */
    public get start(): string {
        return this._start;
    }

    /**
     * Sets start
     */
    public set start(start: string) {
        this._start = start;
    }

    /**
     * Gets end
     */
    public get end(): string {
        return this._end;
    }

    /**
     * Sets end
     */
    public set end(end: string) {
        this._end = end;
    }

    /**
     * Gets title
     */
    public get title(): string {
        return this._title;
    }

    /**
     * Sets title
     */
    public set title(title: string) {
        this._title = title;
    }

    /**
     * Gets chart no
     */
    public get chartNo(): string {
        return this._chartNo;
    }

    /**
     * Sets chart no
     */
    public set chartNo(chartNo: string) {
        this._chartNo = chartNo;
    }

    /**
     * Gets status
     */
    public get status(): string {
        return this._status;
    }

    /**
     * Sets status
     */
    public set status(status: string) {
        this._status = status;
    }

    /**
     * Gets check in time
     */
    public get checkInTime(): string {
        return this._checkInTime;
    }

    /**
     * Sets check in time
     */
    public set checkInTime(checkInTime: string) {
        this._checkInTime = checkInTime;
    }

    /**
     * Gets speciality
     */
    public get speciality(): string {
        return this._speciality;
    }

    /**
     * Sets speciality
     */
    public set speciality(speciality: string) {
        this._speciality = speciality;
    }

    /**
     * Gets date of accident
     */
    public get dateOfAccident(): string {
        return this._dateOfAccident;
    }

    /**
     * Sets date of accident
     */
    public set dateOfAccident(dateOfAccident: string) {
        this._dateOfAccident = dateOfAccident;
    }

    /**
     * Gets case id
     */
    public get caseId(): string {
        return this._caseId;
    }

    /**
     * Sets case id
     */
    public set caseId(caseId: string) {
        this._caseId = caseId;
    }

    /**
     * Gets patient id
     */
    public get patientId(): string {
        return this._patientId;
    }

    /**
     * Sets patient id
     */
    public set patientId(patientId: string) {
        this._patientId = patientId;
    }

    /**
     * Gets doctor id
     */
    public get doctorId(): string {
        return this._doctorId;
    }

    /**
     * Sets doctor id
     */
    public set doctorId(doctorId: string) {
        this._doctorId = doctorId;
    }

    /**
     * Gets visit type
     */
    public get visitType(): string {
        return this._visitType;
    }

    /**
     * Sets visit type
     */
    public set visitType(visitType: string) {
        this._visitType = visitType;
    }

    /**
     * Gets visit id
     */
    public get visitId(): number {
        return this._visitId;
    }

    /**
     * Sets visit id
     */
    public set visitId(visitId: number) {
        this._visitId = visitId;
    }

    /**
     * Gets whether is complete
     */
    public get isComplete(): Boolean {
        return this._isComplete;
    }

    /**
     * Sets whether is complete
     */
    public set isComplete(isComplete: Boolean) {
        this._isComplete = isComplete;
    }

    /**
     * Gets doctor
     */
    public get doctor(): Doctor {
        return this._doctor;
    }

    /**
     * Sets doctor
     */
    public set doctor(doctor: Doctor) {
        this._doctor = doctor;
    }

    /**
     * Gets patient
     */
    public get patient(): Patient {
        return this._patient;
    }

    /**
     * Sets patient
     */
    public set patient(patient: Patient) {
        this._patient = patient;
    }

    /**
     * Gets case
     */
    public get case(): Case {
        return this._case;
    }

    /**
     * Sets case
     */
    public set case(_case: Case) {
        this._case = _case;
    }

    /**
     * Gets session
     */
    public get session(): MedicalSession {
        return this._session;
    }

    /**
     * Sets session
     */
    public set session(session: MedicalSession) {
        this._session = new MedicalSession(session);
    }

    /**
     * Gets previous appointment date
     */
    public get previousAppointmentDate(): string {
        return this._previousAppointmentDate;
    }

    /**
     * Sets previous appointment date
     */
    public set previousAppointmentDate(previousAppointmentDate: string) {
        this._previousAppointmentDate = previousAppointmentDate;
    }

}
