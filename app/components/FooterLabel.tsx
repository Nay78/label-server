import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { useSSE } from "react-hooks-sse";
import { useEventSource } from "remix-utils/sse/react";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/z0d0JCoik7l
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
export default function FooterLabel() {
  const data = useEventSource("/sse/status", { event: "status" });
  const messages = useEventSource("/sse/label_printer", { event: "message" });

  const printer_status = data || "ERROR";
  // console.log("FooterLabel");
  // console.log("printer_status", data);

  let status_color = "text-gray-500";
  if (printer_status === "READY") {
    status_color = " text-green-500";
  } else if (printer_status === "ERROR") {
    status_color = " text-red-500";
  } else if (printer_status === "BUSY") {
    status_color = " text-yellow-500";
  }

  return (
    <div className="container flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <PrinterIcon className="w-4 h-4" />
        <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Etiquetas</div>
      </div>
      <Label>{messages}</Label>
      <div className="flex items-center gap-1">
        <CircleIcon className={`w-3 h-3 ${status_color}`} />
        <span className="text-sm font-medium">{printer_status}</span>
      </div>
    </div>
  );
}

function CircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function PrinterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </svg>
  );
}
