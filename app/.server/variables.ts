import path from "path";
import os from "os";

export const SEGUIMIENTO_CONFIGURABLE_PATH = path.join(
  os.homedir(),
  "Templates",
  "Hojas",
  `SEGUIMIENTO_CONFIGURABLE.odt`
);

export const SEGUIMIENTO_GENERICA_PATH = path.join(os.homedir(), "Templates", "Hojas", `SEGUIMIENTO_GENERICA.pdf`);
export const GET_DOCUMENT_PATH = (documento: string) => path.join(os.homedir(), "Templates", "Documentos", documento);
// export const GET_FILE_PATH = (dir: string, documento: string) => path.join(os.homedir(), dir, documento);
export const PAPER_PRINTER_NAME = "Brother_HL-1200_series";
export const OUTPUT_FOLDER = path.join(os.homedir(), "Templates", `Output`);
