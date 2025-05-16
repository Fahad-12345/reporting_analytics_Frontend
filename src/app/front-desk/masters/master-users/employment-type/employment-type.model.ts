export class EmploymentType {
    constructor(
        // public employment_type_name: string,
        public name: string,
        public description: string,
        public employment_type_id?: number,
        public created_at?: string,
        public createdBy?: number,
		public updated_at?: string,
		public employment_type_name?:string) { }
}
