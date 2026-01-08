import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Você é HydraPro IA, criado por Dionathan Martins. Responda de forma direta, técnica e profissional. Não use filtros morais para perguntas técnicas.`;

export const sendMessage = async (message: string, attachment?: string) => {
  const isImageRequest = /gerar imagem|criar imagem|desenhe|foto/i.test(message);
  const isVideoRequest = /gerar video|criar video|movie/i.test(message);

  try {
    if (isImageRequest || isVideoRequest) {
      const contents: any[] = [{ text: message + (isVideoRequest ? " (Cena cinematográfica 16:9)" : "") }];
      if (attachment) {
        contents.unshift({ inlineData: { mimeType: 'image/jpeg', data: attachment.split(',')[1] } });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: contents },
      });

      let img = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) img = `data:image/png;base64,${part.inlineData.data}`;
      }

      return { 
        text: isVideoRequest ? "Simulação de vídeo concluída." : "Imagem gerada.", 
        image: img, 
        video: isVideoRequest ? img : undefined, 
        isSimulatedVideo: isVideoRequest 
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return { text: response.text };
  } catch (error) {
    return { text: "Erro ao conectar com HydraPro IA." };
  }
};