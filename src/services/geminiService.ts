
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Shift, ShiftTypeID } from "../types";

// Lazy singleton: only instantiated on first AI call, not at module load time.
// This avoids a crash when process.env.API_KEY is undefined at startup.
let _ai: GoogleGenAI | null = null;
const getAi = () => {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return _ai;
};

export const autoScheduleShifts = async (
  employees: Employee[],
  startDate: string,
  endDate: string
): Promise<Partial<Shift>[]> => {
  const prompt = `
    Erstelle einen Dienstplan für den Zeitraum von ${startDate} bis ${endDate}.
    Mitarbeiter Profile: ${JSON.stringify(employees.map(e => ({
    id: e.id,
    name: e.name,
    assignments: e.skillAssignments,
    daysPerWeek: e.contractHours
  })))}
    Schicht-Typen: MORNING, LATE, NIGHT, WEEKEND_DAY.
    
    Regeln:
    1. Berücksichtige die Prioritäten (niedrigere Zahl = wichtigere Aufgabe für diesen MA).
    2. Berücksichtige die Prozentanteile (wie oft ein MA eine bestimmte Qualifikation ausübt).
    3. Ein Mitarbeiter darf nur eine Schicht pro Tag haben.
    4. Jede Nachtschicht (NIGHT) benötigt jemanden mit 'Nachtdienst-Zertifikat'.
    5. Gib für jeden Tag und jede Schichtart eine Zuweisung zurück, sofern sinnvoll.
  `;

  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              employeeId: { type: Type.STRING },
              date: { type: Type.STRING, description: 'YYYY-MM-DD' },
              typeId: { type: Type.STRING, description: 'Einer der Schicht-Typen ID' },
              roleName: { type: Type.STRING, description: 'Rollenname aus dem Dienstplan' }
            },
            required: ["employeeId", "date", "typeId"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<Shift>[];
    }
    return [];
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};
