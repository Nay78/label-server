import path from "path";
import os from "os";

export const SEGUIMIENTO_CONFIGURABLE_PATH = path.join(
  os.homedir(),
  "Templates",
  "Hojas",
  `SEGUIMIENTO_CONFIGURABLE.pdf`
);

export const SEGUIMIENTO_GENERICA_PATH = path.join(os.homedir(), "Templates", "Hojas", `SEGUIMIENTO_GENERICA.pdf`);

export const PAPER_PRINTER_NAME = "Brother_HL-1200_series";
export const OUTPUT_FOLDER = path.join(os.homedir(), "Templates", `Output`);
