import { Storage } from "@google-cloud/storage";
import { config } from "./env";

// Development: authenticate using a local service account key file.
// Production (Cloud Run): no keyFilename needed — Cloud Run's attached
// service account provides Application Default Credentials automatically.
export const storage =
  config.nodeEnv === "production"
    ? new Storage()
    : new Storage({ keyFilename: config.gcpKeyFilePath });

export const bucket = storage.bucket(config.gcpBucketName);

// Generates a temporary signed URL for a private GCP object, valid for 24 hours.
// Returns null if filePath is null/empty, so callers can pass through bounty.filePath
// directly without an extra if-check.
export const getSignedUrl = async (filePath: string | null): Promise<string | null> => {
  if (!filePath) return null;

  const [url] = await bucket.file(filePath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  });

  return url;
};