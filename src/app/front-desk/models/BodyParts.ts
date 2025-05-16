export interface BodyParts {
    name: string;
    id: number;
    selected: boolean;
    sensations: [Sensations]
}

export interface Sensations {
    name: string;
    id: number;
    deletedAt: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;   
}