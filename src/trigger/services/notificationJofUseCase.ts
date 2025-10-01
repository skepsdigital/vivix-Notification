import { AxiosInstance } from "axios";
type uuidFunction = () => string;

export class notification {
  private uuid: uuidFunction;
  private httpClient: AxiosInstance;

  private stateMap: Record<string, string> = {
    "d1_liberado_01": "025229ea-b323-4c84-8801-ec4faba49945",
    "d2_motorista_01": "3b7eba6e-ed48-4699-a17e-ea18ea958f80",
    "d3_monitoramento_01": "323a3c21-7573-4b73-91e6-e9145b18020c",
    "d4_liberacao_01": "23f6aadc-bc47-4bd7-8bbb-b00eb1e08e4f",
    "d5_solicitacao_01": "d3ca8f10-e72e-4696-b2ce-0fa95625dea7",
    "d5_solicitacao_02": "d3ca8f10-e72e-4696-b2ce-0fa95625dea7"
  };

  constructor(httpClient: AxiosInstance, uuid: uuidFunction) {
    this.httpClient = httpClient;
    this.uuid = uuid;
  }

  async init(body: any) {
    const templateKey = this.identificarTemplate(body);
    const mensagensParams = this.formatarBody(body, templateKey);
    const mensagensConfig = this.formatar(body, templateKey);
    const emptyField = this.findEmptyField(mensagensParams);

    if (emptyField) {
      const err: any = new Error("Campo obrigatório ausente ou vazio");
      err.statusCode = 422;
      throw err;
    }

    console.log("Authorization", process.env.BLIP_TOKEN || "Key dml2aXhyb3V0ZXI6N29sTk5PdkJKR1NzWFIxbDZkNmM=");

    const results: { success: boolean; data?: any; error?: any }[] = [];

    const sendCampaign = async (messageParams: any, messageConfig: any) => {
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
        const response = await this.httpClient.post(
          "https://vivix.http.msging.net/commands",
          payload,
          {
            headers: {
              Authorization: process.env.BLIP_TOKEN || "Key dml2aXhyb3V0ZXI6N29sTk5PdkJKR1NzWFIxbDZkNmM=",
            },
          }
        );
        results.push({ success: true, data: response.data });
      } catch (error: any) {
        results.push({ success: false, error: error.message });
      }
    };

    if (Array.isArray(mensagensParams)) {
      for (let i = 0; i < mensagensParams.length; i++) {
        await sendCampaign(mensagensParams[i], mensagensConfig[i]);
      }
    } else {
      await sendCampaign(mensagensParams, mensagensConfig);
    }

    return results;
  }

  identificarTemplate(body: any): string {
    if (body.transportadora) return "d3_monitoramento_01";
    if (body.horarioChegada) return "d2_motorista_01";
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
    if (body.numPedido) return "d1_liberado_01";
    throw new Error("Estrutura de JSON não reconhecida");
  }

  formatar(body: any, templateKey: string) {
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
          }

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
          }

      case "d1_liberado_01":
        return {
          messageTemplate: "d1_liberado_01",
          messageTemplateLanguage: "pt_BR",
          messageParams: ["1", "2"],
        };

      case "d4_liberacao_01":
        return (body.listaPedidosPendentes || []).map((pedido: any) => ({
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
        return (body.produtosReclamados || []).map((produto: any) => ({
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
        return (body.produtosReclamados || []).map((produto: any) => ({
          messageTemplate: "d5_solicitacao_02",
          messageTemplateLanguage: "pt_BR",
          messageParams: ["1", "2", "3", "4", "5", "6", "7", "8"],
        }));  

      default:
        throw new Error("Template não mapeado");
    }
  }

  formatarBody(body: any, templateKey: string) {

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
        return (body.listaPedidosPendentes || []).map((pedido: any) => {
          let dataSolicitacao = pedido.dataSolicitacao;
          if (dataSolicitacao) {
            try {
              const data = new Date(dataSolicitacao);
              const day = String(data.getUTCDate()).padStart(2, "0");
              const month = String(data.getUTCMonth() + 1).padStart(2, "0");
              const year = data.getUTCFullYear();
              dataSolicitacao = `${day}/${month}/${year}`;
            } catch (e) {
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
        return (body.produtosReclamados || []).map((produto: any) => ({
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
        return (body.produtosReclamados || []).map((produto: any) => ({
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

  private findEmptyField(params: any): string | { field: string, index: number } | null {
    if (Array.isArray(params)) {
      for (let i = 0; i < params.length; i++) {
        for (const key in params[i]) {
          if (!params[i][key]) return { field: key, index: i + 1 };
        }
      }
    } else {
      for (const key in params) {
        if (!params[key]) return key;
      }
    }
    return null;
  }

  
  formatWhatsAppNumber(rawNumber: string): string {
    if (!rawNumber) throw new Error("Número de WhatsApp não informado");
    return rawNumber.replace(/\D/g, "");
  }

  buildCampaignName(nome: string): string {
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR", { hour12: false });
    const ms = agora.getMilliseconds();
    return `${nome} - ${data} ${hora}.${ms}`;
  }
}