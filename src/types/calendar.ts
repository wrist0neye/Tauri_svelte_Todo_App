export interface Schedule{
    id: null | number | string,
    title: string,
    content: string,
    startDate : Date,
    endDate : Date,
    // attachments : Array,
    // notifications:
}

export interface viewMode{
    id: string,
    label: string
}