import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useNavigation, useParams } from "@remix-run/react";
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { setBusy } from "~/.server/serverBusy";
import { GET_DOCUMENT_PATH } from "~/.server/variables";
import printPaper from "~/.server/printPaper";
import { sendMessage } from "./sse.label_printer";

// Action to handle form submission
export async function action({ request, params }: ActionFunctionArgs) {
  const documento = params.documento;
  console.log("DOCUMENTO::", documento);
  if (!documento) return "NO EXISTE DOCUMENTO";

  setBusy(true);
  // Get the form data from the request
  let response = {};
  const body = await request.formData();
  const qty = body.get("qty") || 1;

  // const COMMAND = `lp -d ${PAPER_PRINTER_NAME} -n ${qty} ${SEGUIMIENTO_GENERICA_PATH}`;
  sendMessage("Imprimiendo documento");
  response = await printPaper(GET_DOCUMENT_PATH(documento), qty);

  // response = await execPromise(COMMAND);

  // wait for 3 seconds to avoid client sending another request
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("Promise resolved");
    }, 5000);
  });
  sendMessage(`Listo`);
  return json({ ...response });
}

export default function Index() {
  "use client";
  const [qty, setQty] = useState(1); // Initial value is 1
  const { documento } = useParams();
  const navigation = useNavigation();

  if (!documento) return "NO EXISTE DOCUMENTO";
  // const documentoFmt = documento.replaceAll("_", " ")
  const canPrint = navigation.state === "idle";

  return (
    <div className="flex flex-col p-6">
      <Form method="POST">
        <Card>
          <CardHeader>
            <CardTitle>Imprimir documento</CardTitle>
            <CardDescription>{documento}</CardDescription>
          </CardHeader>
          <CardContent className="gap-2 flex flex-col">
            <div>
              <Label>Cantidad</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Cantidad de hojas"
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
                    setQty(qty + 1);
                  }}
                  className="h-10"
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="flex-grow" type="submit" disabled={!canPrint}>
              {canPrint ? "Imprimir" : "Ocupado..."}
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
