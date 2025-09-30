"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responder = void 0;
class Responder {
    constructor() {
    }
    send(code, body, headers) {
        try {
            return {
                statusCode: code,
                body: body ? JSON.stringify(body) : "",
                headers: Object.assign(Object.assign({}, headers), { "Content-Type": "application/json; charset=UTF-8" })
            };
        }
        catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ errorMessage: "Internal server error" }),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            };
        }
    }
}
exports.Responder = Responder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbS9SZXNwb25kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBYSxTQUFTO0lBRWxCO0lBQ0EsQ0FBQztJQUVELElBQUksQ0FBQyxJQUFvQixFQUFFLElBQVUsRUFBRSxPQUFhO1FBQ2hELElBQUk7WUFDQSxPQUFPO2dCQUNILFVBQVUsRUFBRSxJQUFJO2dCQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN0QyxPQUFPLGtDQUNBLE9BQU8sS0FDVixjQUFjLEVBQUUsaUNBQWlDLEdBQ3BEO2FBQ0osQ0FBQTtTQUNKO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPO2dCQUNILFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsWUFBWSxFQUFFLHVCQUF1QixFQUFFLENBQUM7Z0JBQy9ELE9BQU8sRUFBRTtvQkFDTCxjQUFjLEVBQUUsaUNBQWlDO2lCQUNwRDthQUNKLENBQUE7U0FDSjtJQUNMLENBQUM7Q0FDSjtBQXpCRCw4QkF5QkMifQ==