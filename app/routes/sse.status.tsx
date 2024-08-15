// app/routes/sse.time.ts
import { eventStream } from "remix-utils/sse/server";
import { fetchAndExtractPrintingStatus } from "~/lib/printerUtils";
import { EventEmitter } from "events";
import { isBusy } from "~/.server/serverBusy";
import { LoaderFunctionArgs } from "@remix-run/node";

// import { eventStream } from "remix-utils";
// import "dotenv/config";
// const isDev = import.meta.env.ENVIRONMENT === "DEV";

const PRINTER_IP = import.meta.env.VITE_PRINTER_IP;
const URL = PRINTER_IP ? `http://${PRINTER_IP}/general/monitor.html` : undefined;
const POLLING = Number(import.meta.env.VITE_POLLING) || 1000;

const printerStatusEmitter = new EventEmitter();
printerStatusEmitter.on("statusChanged", () => {
  console.log(
    "printerStatusEmitter statusChanged",
    "Listeners",
    printerStatusEmitter.listenerCount("statusChanged"),
    "status",
    last_result
  );
});

let timestamp = Date.now() - POLLING;
let last_result: "READY" | "PRINTING" | "BUSY" | "ERROR" | "SERVER_ERROR";
printerStatusEmitter;
export async function getBrotherPrinterStatus(): Promise<"READY" | "PRINTING" | "BUSY" | "ERROR" | "SERVER_ERROR"> {
  if (last_result && Date.now() - timestamp < POLLING) {
    return last_result;
  }
  // let result;
  try {
    const result = await fetchAndExtractPrintingStatus(URL);
    timestamp = Date.now();
    return result;
  } catch (error) {
    timestamp = Date.now();
    console.error("Error fetching printer status", error);
    return "SERVER_ERROR";
  }
}

export function getPrinterStatus() {
  return last_result;
}

async function checkPrinterStatus() {
  const status = await getBrotherPrinterStatus();

  if (status !== last_result) {
    last_result = status;
    printerStatusEmitter.emit("statusChanged", status);

    // if (isPrinting()) {
    //   printerStatusEmitter.emit("statusChanged", "PRINTING");
    // } else {
    //   printerStatusEmitter.emit("statusChanged", status);
    // }
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    const statusChangedHandler = async (status: string) => {
      if (status === "READY" && isBusy()) {
        return send({ event: "status", data: "PRINTING" });
      }
      const payload = { event: "status", data: status };
      // console.log("SEND", payload);
      send(payload);
    };

    // Assuming printerStatusEmitter is an event emitter that emits 'statusChanged' events
    printerStatusEmitter.on("statusChanged", statusChangedHandler);
    send({ event: "status", data: last_result }); // starting value

    return function clear() {
      printerStatusEmitter.off("statusChanged", statusChangedHandler);
    };
  });
}

setInterval(checkPrinterStatus, POLLING);
