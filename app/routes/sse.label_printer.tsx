import { eventStream } from "remix-utils/sse/server";
import { EventEmitter } from "events";

const msgEmitter = new EventEmitter();
msgEmitter.on("message", (msg) => {
  console.log("msgEmitter", msg);
});

function datenow() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed in JavaScript
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
// printerStatusEmitter.emit("statusChanged", "READY");
let lastMessage: string;

export function sendMessage(msg: string) {
  lastMessage = `${datenow()} ${msg}`;
  msgEmitter.emit("message", lastMessage);
}

export async function loader({ request }) {
  console.log("request", request);
  return eventStream(request.signal, function setup(send) {
    const statusChangedHandler = async (msg: string) => {
      const payload = { event: "message", data: msg };
      send(payload);
    };

    // Assuming printerStatusEmitter is an event emitter that emits 'statusChanged' events
    msgEmitter.on("message", statusChangedHandler);
    send({ event: "message", data: lastMessage }); // starting value

    return function clear() {
      msgEmitter.off("message", statusChangedHandler);
    };
  });
}

sendMessage("Ready");
