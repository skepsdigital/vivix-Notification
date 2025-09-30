import { APIGatewayProxyResult } from "aws-lambda";
import HttpStatusCode from "./HttpStatusCode";

export class Responder {

    constructor() {
    }
    
    send(code: HttpStatusCode, body?: any, headers?: any): APIGatewayProxyResult {
        try {
            return {
                statusCode: code,
                body: body ? JSON.stringify(body) : "",
                headers: {
                    ...headers,
                    "Content-Type": "application/json; charset=UTF-8"
                }
            }   
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ errorMessage: "Internal server error" }),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            }
        }
    }
}
