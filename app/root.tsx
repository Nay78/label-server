import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

import type { LinksFunction } from "@remix-run/node";
import stylesheet from "~/globals.css?url";
import Footer from "./components/footer";
import { fetchAndExtractPrintingStatus } from "./lib/printerUtils";
import { useSSE, SSEProvider } from "react-hooks-sse";
import FooterLabel from "./components/FooterLabel";
import { EventSourceProvider } from "remix-utils/sse/react";

const map = new Map();

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <EventSourceProvider value={map}>{children}</EventSourceProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// export async function getBrotherPrinterStatus(): Promise<"READY" | "PRINTING" | "BUSY" | "ERROR"> {
//   if (!isDev) {
//     const url = `http://${PRINTER_IP}/general/monitor.html`;
//     return await fetchAndExtractPrintingStatus(url);
//   } else {
//     return await fetch("http://192.168.1.200:2999/status");
//   }
// }

// export async function loader() {
//   return await getBrotherPrinterStatus();
// }

export default function App() {
  // const data2 = useEventSource("/sse/status", { event: "status" });

  // const data = useLoaderData();
  // const data2 = useRouteLoaderData("create_label.$file");
  // const { revalidate } = useRevalidator();
  // const x = useSSE("/sse/status", "ERROR", {});
  // console.log("data2", data2);
  // console.log("data2", x);

  // console.log("data2", data2);

  // useEffect(() => {
  //   const id = setInterval(revalidate, 3000);
  //   return () => clearInterval(id);
  // }, [revalidate]);

  // console.log(data);
  return (
    <>
      {/* <h1>{data2}</h1> */}
      <Outlet />
      <footer className="w-full py-6 border-t space-y-3">
        <FooterLabel></FooterLabel>
        <Footer printer_status="READY" nombre="Papel" texto=""></Footer>
      </footer>
    </>
  );
}
