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
                    "9": body.laudo,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uSm9mVXNlQ2FzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmlnZ2VyL3NlcnZpY2VzL25vdGlmaWNhdGlvbkpvZlVzZUNhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBYSxZQUFZO0lBYXZCLFlBQVksVUFBeUIsRUFBRSxJQUFrQjtRQVRqRCxhQUFRLEdBQTJCO1lBQ3pDLGdCQUFnQixFQUFFLHNDQUFzQztZQUN4RCxpQkFBaUIsRUFBRSxzQ0FBc0M7WUFDekQscUJBQXFCLEVBQUUsc0NBQXNDO1lBQzdELGlCQUFpQixFQUFFLHNDQUFzQztZQUN6RCxtQkFBbUIsRUFBRSxzQ0FBc0M7WUFDM0QsbUJBQW1CLEVBQUUsc0NBQXNDO1NBQzVELENBQUM7UUFHQSxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFTO1FBQ2xCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM3RCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV6RCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxrREFBa0QsQ0FBQyxDQUFDO1FBRTNHLE1BQU0sT0FBTyxHQUFvRCxFQUFFLENBQUM7UUFFcEUsTUFBTSxZQUFZLEdBQUcsS0FBSyxFQUFFLGFBQWtCLEVBQUUsYUFBa0IsRUFBRSxFQUFFO1lBQ3BFLE1BQU0sT0FBTyxHQUFHO2dCQUNkLEVBQUUsRUFBRSxJQUFJLENB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