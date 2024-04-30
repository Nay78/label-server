let serverBusy = false;
let timeoutId: NodeJS.Timeout | null = null;
const timeout = 60 * 1000;

export function setBusy(busy: boolean, AVOID_TIMEOUT = false) {
  //   if (busy === serverBusy) {
  //     return;
  //   }
  console.log("SERVER BUSY", busy);
  serverBusy = busy;

  // Clear any existing timeout
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  // If the server is busy, schedule a function to set serverBusy to false after 1 minute
  if (!AVOID_TIMEOUT && busy) {
    timeoutId = setTimeout(() => {
      serverBusy = false;
    }, timeout);
  }
}

export function isBusy() {
  return serverBusy;
}
