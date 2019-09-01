export interface Socket {
    id?: number
    status?: SocketStatus
    energy?: number
    manufacturer?: string
    plugId?: number
    ip?: string
}

export enum SocketStatus {
    'AVAILABLE' = 'AVAILABLE',
    'CHARGING' = 'CHARGING',
    'CHARGING_FINISHED' = 'CHARGING_FINISHED',
    'UNAVAILABLE' = 'UNAVAILABLE'
}