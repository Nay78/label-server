import path from "path";
import os from "os";
import { execPromise } from "~/.server/utils";
import { getPrinterStatus } from "~/routes/sse.status";
import { sendMessage } from "~/routes/sse.label_printer";
import { isBusy, setBusy } from "./serverBusy";

export let printing = false;
let printerError = false;
let isCancelled = false;

const BROTHER_QL_PATH = import.meta.env.VITE_BROTHER_QL_PATH;
const PRINTER_ADDRESS = import.meta.env.VITE_PRINTER_ADDRESS;

export function cancelPrint() {
  console.log("cancelPrint called");
  if (!printing) {
    return false;
  }
  isCancelled = true;
  return true;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onPrinterError() {
  setBusy(true, true);
  sendMessage("CAMBIAR ROLLO DE PAPEL");
  printerError = true;
}

function releasePrinterError() {
  printerError = false;
  setBusy(true);
}

async function waitForReady(polling = 500) {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      const status = getPrinterStatus();

      if (status === "ERROR") {
        if (!printerError) {
          onPrinterError();
        }
        await sleep(100);
      } else if (status === "READY") {
        clearInterval(intervalId);
        releasePrinterError();
        resolve(void 0);
      }
    }, polling);
  });
}

function onCancel() {
  sendMessage("Impresión cancelada");
  isCancelled = false;
  printing = false;
  setBusy(false);
  return { printing: false, output: "cancelled" };
}

export async function printLabel(filename: string, qty: number) {
  if (isCancelled) {
    return onCancel();
  }
  console.log("print_label called");

  if (printing) {
    return { printing: true, output: "Already printing" };
  }
  printing = true;
  setBusy(true);
  // const filename = body.get("filename");
  // const qty = body.get("qty");
  const wait = 2;
  const filepath = path.join(os.homedir(), "Templates", "Output", `${filename}.png`);

  const command = `${BROTHER_QL_PATH} --backend network --model QL-810W --printer tcp://${PRINTER_ADDRESS} print --label 62 -d ${filepath}`;
  console.log("command", command);

  for (let i = 0; i < qty; i++) {
    const msg = `Imprimiendo: ${i + 1}/${qty}`;
    sendMessage(msg);
    await waitForReady();
    if (isCancelled) {
      return onCancel();
    }
    const result = await execPromise(command);
    await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    console.log(result);
  }

  printing = false;
  setBusy(false);
  return { command, printing: false, output: "success" };
}
