import { execPromise } from "./utils";
import { PAPER_PRINTER_NAME } from "./variables";

export default async function printPaper(filepath: string, qty: number | string) {
  const command = `lp -d ${PAPER_PRINTER_NAME} -n ${qty} ${filepath}`;
  const response = await execPromise(command);
  console.log("printPaper command executed", command, response);
  return response;
}
