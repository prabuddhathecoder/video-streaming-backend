class ApiError extends Error{
    constructor (
        statusCode,
        massage='Something went wrong',
        errors=[],
        stack=''

    ){
        super(massage),
        this.statusCode=statusCode,
        this.data=null,
        this.massage=this.message
        this.success=false
        this.errors=this.errors

        if(stack){
             this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError }