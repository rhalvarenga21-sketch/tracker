
import { GoogleGenAI } from "@google/genai";
import { Ticket } from '../types';

// FIX: Per coding guidelines, initialize GoogleGenAI client directly with process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function formatTicketsForPrompt(tickets: Ticket[]): string {
    return tickets.map(ticket => `
- Date: ${ticket.connectDate}
- Partner: ${ticket.partnerName} (${ticket.partnerId})
- Region: ${ticket.region}
- Status: ${ticket.currentStatus}
- Area: ${ticket.discussionArea} -> ${ticket.discussionSubArea}
- Action Taken: ${ticket.actionTaken}
    `).join('\n');
}

export const generateReport = async (tickets: Ticket[]): Promise<string> => {
    if (tickets.length === 0) {
        return "No activities to report.";
    }

    const formattedTickets = formatTicketsForPrompt(tickets);
    
    const prompt = `
        As an expert analyst, generate a concise and professional summary report for a management team based on the following daily activity logs.
        The report should be structured with the following sections:
        1.  **Overall Summary:** A brief, high-level overview of the day's activities.
        2.  **Key Accomplishments:** Highlight completed tasks, resolved issues, and major progress points.
        3.  **Items in Progress:** List tasks that are currently open or pending and require further action.
        4.  **Action Items for Management (if any):** Clearly state any points that require management's attention or decision.

        Use clear headings, bullet points, and a professional tone.

        Here are the activity logs:
        ${formattedTickets}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate report from Gemini API.");
    }
};
