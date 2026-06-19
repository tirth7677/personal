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

// Generates a temporary signed URL for READING a private GCP object, valid for 24 hours.
// Used when serving a file back to the frontend (e.g. displaying a bounty's image/video).
// Returns null if filePath is null/empty, so callers can pass through bounty.filePath
// directly without an extra if-check.
export const getSignedReadUrl = async (filePath: string | null): Promise<string | null> => {
  if (!filePath) return null;

  const [url] = await bucket.file(filePath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  return url;
};

// Generates a temporary signed URL for the FRONTEND to upload a file directly to GCS.
// Valid for 15 minutes — short window since this is only for the upload step itself.
// The backend never touches the actual file bytes in this flow.
export const getSignedUploadUrl = async (
  filePath: string,
  contentType: string
): Promise<string> => {
  const [url] = await bucket.file(filePath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return url;
};