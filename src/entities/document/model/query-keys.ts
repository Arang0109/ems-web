import type { DocumentCategory } from "@shared/model";

export const documentKeys = {
  all: ["document"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (category?: DocumentCategory) => [...documentKeys.lists(), category ?? null] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
  versionList: () => [...documentKeys.all, "versions"] as const,
  versions: (documentId: number) => [...documentKeys.versionList(), documentId] as const,
};
