import { json } from "@remix-run/node";
import { Form, useNavigation, useParams } from "@remix-run/react";
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useLayoutEffect, useState } from "react";
import { execPromise } from "~/.server/utils";
import { useEventSource } from "remix-utils/sse/react";
import { sendMessage } from "../sse.label_printer";
import { setBusy } from "~/.server/serverBusy";
import { printLabel } from "~/.server/printLabel";

let LATEST_COMMAND = "";

export async function loader({ params }) {
  // let { searchParams } = new URL(request.url);

  // const status = await fetch("http://192.168.1.200:2999/status");
  // console.log("params", params);

  return { params };
  // return { status };
}

// Action to handle form submission
export async function action({ request }: ActionArgs) {
  setBusy(true);
  // Get the form data from the request
  let response = {};
  const body = await request.formData();

  // const data = {
  //   name: body.get("file"),
  //   date: body.get("date"),
  //   qty: body.get("qty"),
  // };

  const formDate = body.get("date");
  // const date = new Date(body.get("date"));
  // const today = new Date();
  // const offset = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  const formFile = body.get("file");

  const command = `python 'app/.server/label.py' create --date ${formDate} ${formFile}`;
  const xcommand = formDate + command;
  if (xcommand === LATEST_COMMAND) {
    console.log("Command already executed", command);
    // return json({ command, ...response });
  } else {
    LATEST_COMMAND = xcommand;
    sendMessage(`Creando Etiqueta: ${formFile} ${formDate}`);
    response = await execPromise(command);
    // console.log("Command executed", command, response);
  }

  // await new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve("Promise resolved");
  //   }, 3000); // 10 seconds
  // });

  // print labels
  const qty = body.get("qty");
  const printFilename = `${formFile}_${formDate}`;
  printLabel(printFilename, qty);

  // wait for 3 seconds to avoid client sending another request
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("Promise resolved");
    }, 3000);
  });
  return json({ command, ...response });
}

export default function Index() {
  // const data = useLoaderData<typeof loader>();
  // const form = useForm();
  const data = useEventSource("/sse/status", { event: "status" }) || "READY";
  // const lblprinter = useEventSource("/sse/label_printer", { event: "message" });
  const [qty, setQty] = useState(1); // Initial value is 1
  // const [savedQty, setSavedQty] = useState(1);
  // const x = useLocalStorage("qty", 1);
  const today = new Date().toISOString().split("T")[0];
  const { file } = useParams();
  const navigation = useNavigation();

  // synchronize initially
  useLayoutEffect(() => {
    const x = window.localStorage.getItem("qty") || 1;
    setQty(Number(x));
  }, []);

  console.log({ nav: navigation.state, data });

  const canPrint = navigation.state === "idle" && data === "READY";

  // console.log("data", searchParams);
  // console.log("f", f);
  // if (!canPrint) {
  //   return <div>OCUPADO</div>;
  // }

  return (
    <div className="flex flex-col p-6">
      <Form method="POST">
        <Card>
          <CardHeader>
            <CardTitle>Imprimir etiqueta</CardTitle>
            <CardDescription>{`Formato "${file}"`}</CardDescription>
          </CardHeader>
          <CardContent className="gap-2 flex flex-col">
            <div>
              <Label>Cantidad</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Cantidad de etiquetas"
                  name="qty"
                  value={qty}
                  onChange={(e) => {
                    setQty(e.target.value);
                    window.localStorage.setItem("qty", e.target.value);
                  }}
                />
                <Button
                  variant={"default"}
                  type="button"
                  onClick={() => {
                    setQty(qty + 10);
                  }}
                  className="h-10"
                >
                  +10
                </Button>
              </div>
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" placeholder="Fecha" name="date" defaultValue={today} />
            </div>
            {/* <input hidden type="text" name="file" defaultValue={String(searchParams.get("file"))}></input> */}
            <input hidden type="text" name="file" defaultValue={file}></input>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!canPrint}>
              Imprimir
            </Button>
            {!canPrint && <Label className="p-2">Ocupado...</Label>}
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
