import { json } from "@remix-run/node";
import { Form, useNavigation, useParams, useRouteLoaderData } from "@remix-run/react";
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { printing } from "~/routes/print_label";
import { execPromise } from "~/.server/utils";

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
  console.log("printing (route.tsx)", printing);
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
  const formFie = body.get("file");

  const command = `python 'app/routes/create_label.$file/label.py' create --date-offset ${formDate} ${formFie}`;
  if (command === LATEST_COMMAND) {
    console.log("Command already executed", command);
    return json({ command, ...response });
  }
  LATEST_COMMAND = formDate + command;
  response = await execPromise(command);

  // await new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve("Promise resolved");
  //   }, 3000); // 10 seconds
  // });

  // print labels
  const qty = body.get("qty");
  const printFilename = `${formFie}_${formDate}`;
  const params = new URLSearchParams({ qty, filename: printFilename });
  fetch("/print_label?" + params.toString());

  // Redirect to the user page
  return json({ command, ...response });
}

export default function Index() {
  // const data = useLoaderData<typeof loader>();
  // const form = useForm();
  const [qty, setQty] = useState(1); // Initial value is 1
  const today = new Date().toISOString().split("T")[0];
  const f = useRouteLoaderData("root");
  const { file } = useParams();
  const navigation = useNavigation();

  const canPrint = navigation.state === "idle" && f === "READY" && qty > 0;

  // console.log("data", searchParams);
  // console.log("f", f);

  return (
    <div className="flex flex-col p-6">
      {/* <h1 className="bg-black text-white">{data.status}</h1> */}
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
                  }}
                />
                <Button
                  variant={"default"}
                  type="button"
                  onClick={() => {
                    setQty(119);
                  }}
                >
                  119
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
            <Button type="submit" disabled={navigation.state !== "idle"}>
              Imprimir
            </Button>
            {navigation.state !== "idle" && <Label className="p-2">Imprimiendo...</Label>}
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
