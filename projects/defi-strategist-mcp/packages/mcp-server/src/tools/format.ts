export function toolText(summary: string, data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: `${summary}\n\n${JSON.stringify(data, null, 2)}`,
      },
    ],
    structuredContent: data as Record<string, unknown>,
  };
}

export function toolError(message: string) {
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true as const,
  };
}