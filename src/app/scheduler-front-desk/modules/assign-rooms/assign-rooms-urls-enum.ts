export enum AssignRoomsUrlsEnum {
    getAllRoomsOfClinic = '/rooms/getAllRoomsOfClinic',
	doctorFilter = '/user_facilities/doctorFilter',
	getFilteredAvailableDoctor="/available-doctors/get-filtered-doctor"
,    getAvailableRoomsForDoctor = '/roomAssigns/getAvailableRoomsForDoctor',
    addRoomAssignment = '/roomAssigns/addRoomAssignment',
    deleteRoomAssignment = '/roomAssigns/deleteRoomAssignment',
    changeRoomAssignmentOfAppointments = '/roomAssigns/changeRoomAssignmentOfAppointments',
    getAppointmentsForRoomAssign = '/roomAssigns/getAppointmentsForRoomAssign',
    getVisitSession = 'vd/visit_session/get_visit_session_against_appointments_ids',
	getAppointmentsDataForProviderCalender='/appointments/get-provider-calender-data',
}
