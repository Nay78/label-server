// app/routes/sse.time.ts
import { eventStream } from "remix-utils/sse/server";
import { fetchAndExtractPrintingStatus } from "~/lib/printerUtils";
import { EventEmitter } from "events";

// import { eventStream } from "remix-utils";
// import "dotenv/config";

// const isDev = import.meta.env.ENVIRONMENT === "DEV";
const isDev = "false";
const PRINTER_IP = import.meta.env.VITE_PRINTER_IP;
const URL = `http://${PRINTER_IP}/general/monitor.html`;
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
// printerStatusEmitter.emit("statusChanged", "READY");
let timestamp = Date.now() - POLLING;
let last_result: "READY" | "PRINTING" | "BUSY" | "ERROR" = "ERROR";

export async function getBrotherPrinterStatus(): Promise<"READY" | "PRINTING" | "BUSY" | "ERROR" | "SERVER_ERROR"> {
  if (Date.now() - timestamp < POLLING) {
    return last_result;
  }
  if (isDev) {
    const response = await fetch("http://192.168.1.200:2999/status");
    last_result = await response.text();
    timestamp = Date.now();
    return last_result;
  } else {
    last_result = await fetchAndExtractPrintingStatus(URL);
    timestamp = Date.now();
    return last_result;
  }
}

export function getPrinterStatus() {
  return last_result;
}

async function checkPrinterStatus() {
  // let status;
  // try {
  //   status = await getBrotherPrinterStatus();
  //   console.log("getBrotherPrinterStatus", status);
  // } catch (error) {
  //   console.log("getBrotherPrinterStatus ERROR", error);
  //   status = "SERVER_ERROR";
  // }
  const status = await getBrotherPrinterStatus();
  // console.log("PRINTER STATUS", status);

  // If the status has changed since the last check, emit a 'statusChanged' event
  // printerStatusEmitter.emit("statusChanged", status);
  // printerStatusEmitter.emit("statusChanged", status);

  if (status !== last_result) {
    printerStatusEmitter.emit("statusChanged", status);
    last_result = status;
  }
}

// export async function loader({ request }: LoaderArgs) {
//   return eventStream(request.signal, function setup(send) {
//     const timer = setInterval(async () => {
//       send({ data: await getBrotherPrinterStatus() });
//     }, 2000);

//     return function clear() {
//       clearInterval(timer);
//     };
//   });
// }

export async function loader({ request }: LoaderArgs) {
  console.log("request", request);
  return eventStream(request.signal, function setup(send) {
    const statusChangedHandler = async () => {
      const payload = { event: "status", data: await getBrotherPrinterStatus() };
      console.log("SEND", payload);
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
