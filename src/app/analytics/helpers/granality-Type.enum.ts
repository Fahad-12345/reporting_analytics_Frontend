
export enum GranalityType {
    Daily =1,
    Weekly = 2,
    Monthly = 3,
    Yearly = 4
}
export function GranalityTypeList(){
    return [
        {
          id: 1,
          type: 'Daily'
        },
        {
          id: 2,
          type: 'Weekly'
        },
        {
          id: 3,
          type: 'Monthly'
        },
        {
          id: 4,
          type: 'Yearly'
        },
    ]
}