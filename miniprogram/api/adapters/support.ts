function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function adaptUploadResult(input: unknown) {
  if (!isRecord(input)) {
    return {
      url: "",
      fileId: "",
    };
  }

  return {
    url:
      (typeof input.url === "string" && input.url) ||
      (typeof input.fileUrl === "string" && input.fileUrl) ||
      "",
    fileId:
      (typeof input.fileId === "string" && input.fileId) ||
      (typeof input.id === "string" && input.id) ||
      "",
  };
}
