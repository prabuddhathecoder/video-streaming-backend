class ApiResponse{
    constructor(statusCode,data,massess='Success'){
        this.statusCode=statusCode
        this.data=data
        this.massess=massess
        this.success=statusCode < 400
    }
}
export {ApiResponse}