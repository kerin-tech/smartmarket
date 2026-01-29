import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const visionService = {
  /**
   * Envía una imagen a GPT-4o Vision y extrae los datos de forma estructurada.
   */
  async extractDataFromTicket(base64Image: string) {
    try {
      // 1. Limpieza del string: Si el string ya trae el prefijo "data:image/...", lo removemos
      // para evitar duplicados al enviarlo a la API.
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Eres un experto en lectura de tickets de compra de supermercados. 
            Tu objetivo es extraer información y devolverla estrictamente en formato JSON. 
            Reglas:
            1. Si no ves un dato, pon null.
            2. La fecha debe estar en formato ISO 8601.
            3. Los valores numéricos no deben tener símbolos de moneda.
            4. Asegúrate de capturar bien los nombres de los productos y sus precios.`
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Extrae los datos de este ticket con la siguiente estructura JSON:
                {
                  "storeName": "nombre de la tienda",
                  "date": "2024-05-20T10:00:00Z",
                  "items": [
                    {
                      "productName": "Nombre del producto",
                      "quantity": 1.0,
                      "unitPrice": 10.50,
                      "discountPercentage": 0
                    }
                  ],
                  "total": 10.50
                }` 
              },
              {
                type: "image_url",
                image_url: {
                  // Volvemos a poner el prefijo correctamente con el string limpio
                  "url": `data:image/jpeg;base64,${cleanBase64}`,
                  "detail": "high"
                }
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : null;
    } catch (error: any) {
      // Log más detallado para debug
      console.error("Error detallado en VisionService:", error.message);
      throw new Error("No se pudo procesar la imagen del ticket");
    }
  }
};