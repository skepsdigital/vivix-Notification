"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notification = void 0;
class notification {
    constructor(httpClient, uuid) {
        this.stateMap = {
            "d1_liberado_01": "025229ea-b323-4c84-8801-ec4faba49945",
            "d2_motorista_01": "3b7eba6e-ed48-4699-a17e-ea18ea958f80",
            "d3_monitoramento_01": "323a3c21-7573-4b73-91e6-e9145b18020c",
            "d4_liberacao_01": "23f6aadc-bc47-4bd7-8bbb-b00eb1e08e4f",
            "d5_solicitacao_01": "d3ca8f10-e72e-4696-b2ce-0fa95625dea7",
            "d5_solicitacao_02": "d3ca8f10-e72e-4696-b2ce-0fa95625dea7"
        };
        this.httpClient = httpClient;
        this.uuid = uuid;
    }
    async init(body) {
        const templateKey = this.identificarTemplate(body);
        const mensagensParams = this.formatarBody(body, templateKey);
        const mensagensConfig = this.formatar(body, templateKey);
        const emptyField = this.findEmptyField(mensagensParams);
        if (emptyField) {
            const err = new Error("Campo obrigatório ausente ou vazio");
            err.statusCode = 422;
            throw err;
        }
        console.log("Authorization", process.env.BLIP_TOKEN || "Key dml2aXhyb3V0ZXI6N29sTk5PdkJKR1NzWFIxbDZkNmM=");
        const results = [];
        const sendCampaign = async (messageParams, messageConfig) => {
            const payload = {
                id: this.uuid(),
                to: "postmaster@activecampaign.msging.net",
                method: "set",
                uri: "/campaign/full",
                type: "application/vnd.iris.activecampaign.full-campaign+json",
                resource: {
                    campaign: {
                        name: this.buildCampaignName(body.nome),
                        campaignType: "Individual",
                        flowId: process.env.FLOW_ID || "808bdb24-d9c4-4947-88f0-f91c3b7e9da2",
                        stateId: this.stateMap[templateKey],
                        masterState: "botvixhumanizado2@msging.net",
                    },
                    audience: {
                        recipient: this.formatWhatsAppNumber(body.whatsApp),
                        messageParams: messageParams,
                    },
                    message: messageConfig,
                },
            };
            console.log("Payload enviado:", JSON.stringify(payload, null, 2));
            try {
                const response = await this.httpClient.post("https://vivix.http.msging.net/commands", payload, {
                    headers: {
                        Authorization: process.env.BLIP_TOKEN || "Key dml2aXhyb3V0ZXI6N29sTk5PdkJKR1NzWFIxbDZkNmM=",
                    },
                });
                results.push({ success: true, data: response.data });
            }
            catch (error) {
                results.push({ success: false, error: error.message });
            }
        };
        if (Array.isArray(mensagensParams)) {
            for (let i = 0; i < mensagensParams.length; i++) {
                await sendCampaign(mensagensParams[i], mensagensConfig[i]);
            }
        }
        else {
            await sendCampaign(mensagensParams, mensagensConfig);
        }
        return results;
    }
    identificarTemplate(body) {
        if (body.transportadora)
            return "d3_monitoramento_01";
        if (body.horarioChegada)
            return "d2_motorista_01";
        if (body.listaPedidosPendentes && body.listaPedidosPendentes.length > 0) {
            if (body.listaPedidosPendentes[0].valorPedido)
                return "d4_liberacao_01";
        }
        if (body.produtosReclamados) {
            if (!body.laudo || body.laudo.trim() === "") {
                return "d5_solicitacao_02";
            }
            return "d5_solicitacao_01";
        }
        if (body.numPedido)
            return "d1_liberado_01";
        throw new Error("Estrutura de JSON não reconhecida");
    }
    formatar(body, templateKey) {
        switch (templateKey) {
            case "d3_monitoramento_01":
                return {
                    messageTemplate: "d3_monitoramento_01",
                    messageTemplateLanguage: "pt_BR",
                    messageParams: [
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                    ],
                };
            case "d2_motorista_01":
                return {
                    messageTemplate: "d2_motorista_01",
                    messageTemplateLanguage: "pt_BR",
                    messageParams: [
                        "1",
                        "2",
                        "3",
                        "4",
                    ],
                };
            case "d1_liberado_01":
                return {
                    messageTemplate: "d1_liberado_01",
                    messageTemplateLanguage: "pt_BR",
                    messageParams: ["1", "2"],
                };
            case "d4_liberacao_01":
                return (body.listaPedidosPendentes || []).map((pedido) => ({
                    messageTemplate: "d4_liberacao_01",
                    messageTemplateLanguage: "pt_BR",
                    messageParams: [
                        "1",
                        "2",
                        "3",
                        "4",
                    ],
                }));
            case "d5_solicitacao_01":
                return (body.produtosReclamados || []).map((produto) => ({
                    messageTemplate: "d5_solicitacao_01",
                    messageTemplateLanguage: "pt_BR",
                    messageParams: [
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                    ],
                }));
            case "d5_solicitacao_02":
                return (body.produtosReclamados || []).map((produto) => ({
                    messageTemplate: "d5_solicitacao_02",
                    messageTemplateLanguage: "pt_BR",
                    messageParams: ["1", "2", "3", "4", "5", "6", "7", "8"],
                }));
            default:
                throw new Error("Template não mapeado");
        }
    }
    formatarBody(body, templateKey) {
        switch (templateKey) {
            case "d3_monitoramento_01":
                return {
                    "1": body.nome,
                    "2": body.faturamento,
                    "3": body.nf,
                    "4": body.transportadora,
                    "5": body.distancia,
                    "6": body.previsaoChegada,
                    "7": body.localizacao,
                };
            case "d2_motorista_01":
                return {
                    "1": body.nome,
                    "2": body.horarioChegada,
                    "3": body.numPedido,
                    "4": body.DataHoraGrade,
                };
            case "d1_liberado_01":
                return {
                    "1": body.nome,
                    "2": body.numPedido
                };
            case "d4_liberacao_01":
                return (body.listaPedidosPendentes || []).map((pedido) => {
                    let dataSolicitacao = pedido.dataSolicitacao;
                    if (dataSolicitacao) {
                        try {
                            const data = new Date(dataSolicitacao);
                            const day = String(data.getUTCDate()).padStart(2, "0");
                            const month = String(data.getUTCMonth() + 1).padStart(2, "0");
                            const year = data.getUTCFullYear();
                            dataSolicitacao = `${day}/${month}/${year}`;
                        }
                        catch (e) {
                            console.warn("Erro ao formatar dataSolicitacao:", pedido.dataSolicitacao);
                        }
                    }
                    return {
                        "1": body.nome,
                        "2": pedido.numPedido,
                        "3": dataSolicitacao,
                        "4": pedido.valorPedido,
                    };
                });
            case "d5_solicitacao_01":
                return (body.produtosReclamados || []).map((produto) => ({
                    "1": body.nome,
                    "2": body.ticket,
                    "3": body.statusResolução,
                    "4": produto.nomeProduto,
                    "5": produto.qtdReclamada,
                    "6": produto.qtdProcedente,
                    "7": body.nf,
                    "8": body.valorCredito,
                    "9": body.laudo.replace(/\n+/g, ' '),
                }));
            case "d5_solicitacao_02":
                return (body.produtosReclamados || []).map((produto) => ({
                    "1": body.nome,
                    "2": body.ticket,
                    "3": body.statusResolução,
                    "4": produto.nomeProduto,
                    "5": produto.qtdReclamada,
                    "6": produto.qtdProcedente,
                    "7": body.nf,
                    "8": body.valorCredito,
                }));
            default:
                throw new Error("Template não mapeado");
        }
    }
    findEmptyField(params) {
        if (Array.isArray(params)) {
            for (let i = 0; i < params.length; i++) {
                for (const key in params[i]) {
                    if (!params[i][key])
                        return { field: key, index: i + 1 };
                }
            }
        }
        else {
            for (const key in params) {
                if (!params[key])
                    return key;
            }
        }
        return null;
    }
    formatWhatsAppNumber(rawNumber) {
        if (!rawNumber)
            throw new Error("Número de WhatsApp não informado");
        return rawNumber.replace(/\D/g, "");
    }
    buildCampaignName(nome) {
        const agora = new Date();
        const data = agora.toLocaleDateString("pt-BR");
        const hora = agora.toLocaleTimeString("pt-BR", { hour12: false });
        const ms = agora.getMilliseconds();
        return `${nome} - ${data} ${hora}.${ms}`;
    }
}
exports.notification = notification;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uSm9mVXNlQ2FzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmlnZ2VyL3NlcnZpY2VzL25vdGlmaWNhdGlvbkpvZlVzZUNhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBYSxZQUFZO0lBYXZCLFlBQVksVUFBeUIsRUFBRSxJQUFrQjtRQVRqRCxhQUFRLEdBQTJCO1lBQ3pDLGdCQUFnQixFQUFFLHNDQUFzQztZQUN4RCxpQkFBaUIsRUFBRSxzQ0FBc0M7WUFDekQscUJBQXFCLEVBQUUsc0NBQXNDO1lBQzdELGlCQUFpQixFQUFFLHNDQUFzQztZQUN6RCxtQkFBbUIsRUFBRSxzQ0FBc0M7WUFDM0QsbUJBQW1CLEVBQUUsc0NBQXNDO1NBQzVELENBQUM7UUFHQSxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFTO1FBQ2xCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM3RCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXhELElBQUksVUFBVSxFQUFFO1lBQ2QsTUFBTSxHQUFHLEdBQVEsSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUNqRSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztZQUNyQixNQUFNLEdBQUcsQ0FBQztTQUNYO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksa0RBQWtELENBQUMsQ0FBQztRQUUzRyxNQUFNLE9BQU8sR0FBb0QsRUFBRSxDQUFDO1FBRXBFLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxhQUFrQixFQUFFLGFBQWtCLEVBQUUsRUFBRTtZQUNwRSxNQUFNLE9BQU8sR0FBRztnQkFDZCxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDZixFQUFFLEVBQUUsc0NBQXNDO2dCQUMxQyxNQUFNLEVBQUUsS0FBSztnQkFDYixHQUFHLEVBQUUsZ0JBQWdCO2dCQUNyQixJQUFJLEVBQUUsd0RBQXdEO2dCQUM5RCxRQUFRLEVBQUU7b0JBQ1IsUUFBUSxFQUFFO3dCQUNSLElBQUksRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDdkMsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxzQ0FBc0M7d0JBQ3JFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzt3QkFDbkMsV0FBVyxFQUFFLDhCQUE4QjtxQkFDNUM7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLFNBQVMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzt3QkFDbkQsYUFBYSxFQUFFLGFBQWE7cUJBQzdCO29CQUNELE9BQU8sRUFBRSxhQUFhO2lCQUN2QjthQUNGLENBQUM7WUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxFLElBQUk7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FDekMsd0NBQXdDLEVBQ3hDLE9BQU8sRUFDUDtvQkFDRSxPQUFPLEVBQUU7d0JBQ1AsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGtEQUFrRDtxQkFDNUY7aUJBQ0YsQ0FDRixDQUFDO2dCQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUN0RDtZQUFDLE9BQU8sS0FBVSxFQUFFO2dCQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDeEQ7UUFDSCxDQUFDLENBQUM7UUFFRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1RDtTQUNGO2FBQU07WUFDTCxNQUFNLFlBQVksQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7U0FDdEQ7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsbUJBQW1CLENBQUMsSUFBUztRQUMzQixJQUFJLElBQUksQ0FBQyxjQUFjO1lBQUUsT0FBTyxxQkFBcUIsQ0FBQztRQUN0RCxJQUFJLElBQUksQ0FBQyxjQUFjO1lBQUUsT0FBTyxpQkFBaUIsQ0FBQztRQUNsRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN2RSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXO2dCQUMzQyxPQUFPLGlCQUFpQixDQUFDO1NBQzVCO1FBQ0QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzNDLE9BQU8sbUJBQW1CLENBQUM7YUFDNUI7WUFDRCxPQUFPLG1CQUFtQixDQUFDO1NBQzVCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxRQUFRLENBQUMsSUFBUyxFQUFFLFdBQW1CO1FBQ3JDLFFBQVEsV0FBVyxFQUFFO1lBQ25CLEtBQUsscUJBQXFCO2dCQUN4QixPQUFPO29CQUNILGVBQWUsRUFBRSxxQkFBcUI7b0JBQ3RDLHVCQUF1QixFQUFFLE9BQU87b0JBQ2hDLGFBQWEsRUFBRTt3QkFDYixHQUFHO3dCQUNILEdBQUc7d0JBQ0gsR0FBRzt3QkFDSCxHQUFHO3dCQUNILEdBQUc7d0JBQ0gsR0FBRzt3QkFDSCxHQUFHO3FCQUNKO2lCQUNGLENBQUE7WUFFTCxLQUFLLGlCQUFpQjtnQkFDcEIsT0FBTztvQkFDSCxlQUFlLEVBQUUsaUJBQWlCO29CQUNsQyx1QkFBdUIsRUFBRSxPQUFPO29CQUNoQyxhQUFhLEVBQUU7d0JBQ2IsR0FBRzt3QkFDSCxHQUFHO3dCQUNILEdBQUc7d0JBQ0gsR0FBRztxQkFDSjtpQkFDRixDQUFBO1lBRUwsS0FBSyxnQkFBZ0I7Z0JBQ25CLE9BQU87b0JBQ0wsZUFBZSxFQUFFLGdCQUFnQjtvQkFDakMsdUJBQXVCLEVBQUUsT0FBTztvQkFDaEMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztpQkFDMUIsQ0FBQztZQUVKLEtBQUssaUJBQWlCO2dCQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUQsZUFBZSxFQUFFLGlCQUFpQjtvQkFDbEMsdUJBQXVCLEVBQUUsT0FBTztvQkFDaEMsYUFBYSxFQUFFO3dCQUNiLEdBQUc7d0JBQ0gsR0FBRzt3QkFDSCxHQUFHO3dCQUNILEdBQUc7cUJBQ0o7aUJBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFTixLQUFLLG1CQUFtQjtnQkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVELGVBQWUsRUFBRSxtQkFBbUI7b0JBQ3BDLHVCQUF1QixFQUFFLE9BQU87b0JBQ2hDLGFBQWEsRUFBRTt3QkFDYixHQUFHO3dCQUNILEdBQUc7d0JBQ0gsR0FBRzt3QkFDSCxHQUFHO3dCQUNILEdBQUc7d0JBQ0gsR0FBRzt3QkFDSCxHQUFHO3dCQUNILEdBQUc7d0JBQ0gsR0FBRztxQkFDSjtpQkFDRixDQUFDLENBQUMsQ0FBQztZQUVOLEtBQUssbUJBQW1CO2dCQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQVksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDNUQsZUFBZSxFQUFFLG1CQUFtQjtvQkFDcEMsdUJBQXVCLEVBQUUsT0FBTztvQkFDaEMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztpQkFDeEQsQ0FBQyxDQUFDLENBQUM7WUFFTjtnQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDM0M7SUFDSCxDQUFDO0lBRUQsWUFBWSxDQUFDLElBQVMsRUFBRSxXQUFtQjtRQUV6QyxRQUFRLFdBQVcsRUFBRTtZQUNuQixLQUFLLHFCQUFxQjtnQkFDeEIsT0FBTztvQkFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2QsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXO29CQUNyQixHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ1osR0FBRyxFQUFFLElBQUksQ0FBQyxjQUFjO29CQUN4QixHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVM7b0JBQ25CLEdBQUcsRUFBRSxJQUFJLENBQUMsZUFBZTtvQkFDekIsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXO2lCQUN0QixDQUFDO1lBQ0osS0FBSyxpQkFBaUI7Z0JBQ3BCLE9BQU87b0JBQ0wsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNkLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYztvQkFDeEIsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTO29CQUNuQixHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWE7aUJBQ3hCLENBQUM7WUFDSixLQUFLLGdCQUFnQjtnQkFDbkIsT0FBTztvQkFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2QsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTO2lCQUNwQixDQUFDO1lBQ0osS0FBSyxpQkFBaUI7Z0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7b0JBQzVELElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7b0JBQzdDLElBQUksZUFBZSxFQUFFO3dCQUNuQixJQUFJOzRCQUNGLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDOzRCQUN2QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDdkQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUM5RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7NEJBQ25DLGVBQWUsR0FBRyxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUM7eUJBQzdDO3dCQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUNBQW1DLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3lCQUMzRTtxQkFDRjtvQkFDRCxPQUFPO3dCQUNMLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSTt3QkFDZCxHQUFHLEVBQUUsTUFBTSxDQUFDLFNBQVM7d0JBQ3JCLEdBQUcsRUFBRSxlQUFlO3dCQUNwQixHQUFHLEVBQUUsTUFBTSxDQUFDLFdBQVc7cUJBQ3hCLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDTCxLQUFLLG1CQUFtQjtnQkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVELEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZCxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ2hCLEdBQUcsRUFBRSxJQUFJLENBQUMsZUFBZTtvQkFDekIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxXQUFXO29CQUN4QixHQUFHLEVBQUUsT0FBTyxDQUFDLFlBQVk7b0JBQ3pCLEdBQUcsRUFBRSxPQUFPLENBQUMsYUFBYTtvQkFDMUIsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUNaLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDdEIsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7aUJBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBQ04sS0FBSyxtQkFBbUI7Z0JBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM1RCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2QsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNO29CQUNoQixHQUFHLEVBQUUsSUFBSSxDQUFDLGVBQWU7b0JBQ3pCLEdBQUcsRUFBRSxPQUFPLENBQUMsV0FBVztvQkFDeEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxZQUFZO29CQUN6QixHQUFHLEVBQUUsT0FBTyxDQUFDLGFBQWE7b0JBQzFCLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDWixHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVk7aUJBQ3ZCLENBQUMsQ0FBQyxDQUFDO1lBQ047Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQzNDO0lBQ0gsQ0FBQztJQUVPLGNBQWMsQ0FBQyxNQUFXO1FBQ2hDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO3dCQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7aUJBQzFEO2FBQ0Y7U0FDRjthQUFNO1lBQ0wsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO29CQUFFLE9BQU8sR0FBRyxDQUFDO2FBQzlCO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRCxvQkFBb0IsQ0FBQyxTQUFpQjtRQUNwQyxJQUFJLENBQUMsU0FBUztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNwRSxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxJQUFZO1FBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDekIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNsRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkMsT0FBTyxHQUFHLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO0lBQzNDLENBQUM7Q0FDRjtBQTFSRCxvQ0EwUkMifQ==