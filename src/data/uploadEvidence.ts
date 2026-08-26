"use client";

import { Roles } from "@kleros/kleros-app";

type UploadFile = (
  file: File,
  role: Roles,
) => Promise<string | null | undefined>;

/**
 * Uploads an optional attachment plus the evidence JSON that references it, and
 * returns both URIs. Throws a descriptive Error when either upload fails so the
 * caller can surface it however it likes (toast, inline, etc.).
 */
export async function uploadEvidence(
  uploadFile: UploadFile,
  {
    name,
    description,
    file,
  }: { name: string; description: string; file?: File | null },
): Promise<{ evidenceUri: string; fileURI?: string }> {
  let fileURI: string | undefined;
  if (file) {
    const uploaded = await uploadFile(file, Roles.Evidence);
    if (!uploaded) throw new Error("Failed to upload file.");
    fileURI = uploaded;
  }

  const evidenceFile = new File(
    [JSON.stringify({ name, description, fileURI })],
    "evidence",
    { type: "text/plain" },
  );
  const evidenceUri = await uploadFile(evidenceFile, Roles.Evidence);
  if (!evidenceUri) throw new Error("Failed to upload evidence.");

  return { evidenceUri, fileURI };
}
