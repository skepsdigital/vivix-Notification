"use strict";
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const Responder_1 = require("../commom/Responder");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const notificationJofUseCase_1 = require("./services/notificationJofUseCase");
const handler = async (event) => {
    const responder = new Responder_1.Responder();
    try {
        const useCase = new notificationJofUseCase_1.notification(axios_1.default, uuid_1.v4);
        const body = JSON.parse(event.body);
        try {
            const response = await useCase.init(body);
            return responder.send(200, response);
        }
        catch (useCaseError) {
            console.error(useCaseError);
            if (useCaseError.statusCode) {
                return responder.send(useCaseError.statusCode, { error: useCaseError.message });
            }
            return responder.send(500, { errorMessage: 'Erro ao executar.' });
        }
    }
    catch (error) {
        console.error(error);
        return responder.send(500);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHJpZ2dlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7O0dBV0c7Ozs7OztBQUdILG1EQUFnRDtBQUVoRCxrREFBMEI7QUFFMUIsK0JBQW9DO0FBQ3BDLDhFQUFpRTtBQUUxRCxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQzFCLEtBQTJCLEVBQ0ssRUFBRTtJQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLEVBQUUsQ0FBQztJQUNsQyxJQUFJO1FBQ0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxxQ0FBWSxDQUFDLGVBQUssRUFBRSxTQUFNLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFjLENBQUMsQ0FBQztRQUM5QyxJQUFJO1lBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQW1CLENBQUMsQ0FBQztZQUN6RCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3RDO1FBQUMsT0FBTyxZQUFpQixFQUFFO1lBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDNUIsSUFBSSxZQUFZLENBQUMsVUFBVSxFQUFFO2dCQUMzQixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUNqRjtZQUNELE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1NBQ25FO0tBQ0Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzVCO0FBQ0gsQ0FBQyxDQUFDO0FBckJXLFFBQUEsT0FBTyxXQXFCbEIifQ==