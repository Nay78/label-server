import path from "path";
import os from "os";
import { getPrinterStatus } from "../sse.status";
import { execPromise } from "~/.server/utils";

export let printing = false;

const BROTHER_QL_PATH = import.meta.env.VITE_BROTHER_QL_PATH;
const PRINTER_ADDRESS = import.meta.env.VITE_PRINTER_ADDRESS;
// const printer_ip = String(PRINTER_ADDRESS).split(":")[0];

// async function waitForReady(polling=500) {
//   const status = await loader();

//   if (status !== "READY") {
//     return;
//   }
// }

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForReady(polling = 500) {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      const status = getPrinterStatus();

      if (status === "ERROR") {
        await sleep(1000);
      } else if (status === "READY") {
        clearInterval(intervalId);
        resolve(void 0);
      }
    }, polling);
  });
}

export async function loader() {
  return { printing };
}

export async function printLabel(filename: string, qty: number) {
  console.log("print_label called");

  if (printing) {
    return { printing, output: "Already printing" };
  }
  printing = true;
  // const filename = body.get("filename");
  // const qty = body.get("qty");
  const wait = 2;
  const filepath = path.join(os.homedir(), "Templates", "Output", `${filename}.png`);

  const command = `${BROTHER_QL_PATH} --backend network --model QL-810W --printer tcp://${PRINTER_ADDRESS} print --label 62 -d ${filepath}`;
  // const command = `python label.py print --brother ${file}`;
  console.log("command", command);

  for (let i = 0; i < qty; i++) {
    await waitForReady();
    const result = await execPromise(command);
    await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    console.log(result);
  }

  printing = false;
  return { command, printing, output: "success" };
}

export async function action({ request }: ActionArgs) {
  console.log("print_label called");
  const body = await request.formData();

  if (body.get("status")) {
    return printing;
  }

  if (printing) {
    return { printing, output: "Already printing" };
  }
  if (!body.get("qty")) {
    return { printing, output: "No quantity specified" };
  }
  printing = true;
  const filename = body.get("filename");
  const qty = body.get("qty");
  const wait = 2;
  const filepath = path.join(os.homedir(), "Templates", "Output", `${filename}.png`);

  const command = `${BROTHER_QL_PATH} --backend network --model QL-810W --printer tcp://${PRINTER_ADDRESS} print --label 62 -d ${filepath}`;
  // const command = `python label.py print --brother ${file}`;
  console.log("command", command);

  for (let i = 0; i < qty; i++) {
    await waitForReady();
    const result = await execPromise(command);
    await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    console.log(result);
  }

  printing = false;
  return { command, printing, output: "success" };
}
