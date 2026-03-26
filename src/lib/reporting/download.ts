function buildFileName(prefix: string) {
  const dateLabel = new Date().toISOString().slice(0, 10);

  return `${prefix}-${dateLabel}.csv`;
}

export function createCsvDownloadResponse(prefix: string, content: string) {
  return new Response(content, {
    headers: {
      "cache-control": "private, no-store",
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${buildFileName(prefix)}"`,
      "x-content-type-options": "nosniff"
    }
  });
}
