import multer from "multer";

// Memory storage: file is held in RAM as a Buffer, then pushed directly to GCP.
// No file size limit configured yet — known gap, to be added later.
export const upload = multer({
  storage: multer.memoryStorage(),
});