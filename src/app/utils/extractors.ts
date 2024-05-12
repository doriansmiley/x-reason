export function extractJsonFromBackticks(text: string): string | null {
    const regex = /```\s*(?:json\s*)?([^`]+)```/is;
    const match = text.match(regex);
    return match ? match[1].trim() : null;
}