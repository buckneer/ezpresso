
export const newError = (status?: number, message?: string, options?: any) => {
    return {
        status: status || 500,
        message: message || 'Internal Server Error',
        ...options
    } 
}

export const newResponse = (message: string, status: number = 200, options?: any) => {
    return {
        status,
        message,
        ...options
    } 
}
