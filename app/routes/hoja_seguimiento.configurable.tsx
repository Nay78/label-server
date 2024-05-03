import { json } from "@remix-run/node";
import { Form, useNavigation, useParams } from "@remix-run/react";
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useLayoutEffect, useState } from "react";
import { execPromise } from "~/.server/utils";
import { sendMessage } from "./sse.label_printer";
import path from "path";
import { OUTPUT_FOLDER, SEGUIMIENTO_CONFIGURABLE_PATH } from "~/.server/variables";
import printPaper from "~/.server/printPaper";

// Action to handle form submission
export async function action({ request }: ActionArgs) {
  // setBusy(true);
  // Get the form data from the request
  let response = {};
  const body = await request.formData();
  const formDate = body.get("date");

  const reemplazos = {
    fecha: formDate,
    rodado: body.get("seguimientoRodado"),
    carola: body.get("seguimientoCarola"),
    total: body.get("total"),
  };

  const output_path = path.join(OUTPUT_FOLDER, `SEGUIMIENTO_${formDate}.pdf`);

  const command = `python 'app/.server/label.py' create_format --format pdf ${SEGUIMIENTO_CONFIGURABLE_PATH} ${output_path} ${JSON.stringify(
    reemplazos
  )}`;
  console.log("crear hoja seguimiento configurable:", command);
  sendMessage(`Creando hoja de seguimiento ${formDate}`);
  response = await execPromise(command);

  sendMessage(`Imprimiendo hoja de seguimiento ${formDate}`);
  response = await printPaper(output_path, 1);

  // await new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve("Promise resolved");
  //   }, 3000); // 10 seconds
  // });

  // print labels

  // wait for 3 seconds to avoid client sending another request
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("Promise resolved");
    }, 3000);
  });
  return json({ command, ...response });
}

export default function Index() {
  const [seguimientoRodado, setSeguimientoRodado] = useState(1); // Initial value is 1
  const [seguimientoCarola, setSeguimientoCarola] = useState(1); // Initial value is 1
  // const [savedQty, setSavedQty] = useState(1);
  // const x = useLocalStorage("qty", 1);
  const today = new Date().toISOString().split("T")[0];
  const { file } = useParams();
  const navigation = useNavigation();

  // synchronize initially
  useLayoutEffect(() => {
    // const x = window.localStorage.getItem("seguimientoTotal") || 1;
    // setSeguimientoTotal(Number(x));
    const y = window.localStorage.getItem("seguimientoRodado") || 1;
    setSeguimientoRodado(Number(y));
    const z = window.localStorage.getItem("seguimientoCarola") || 1;
    setSeguimientoCarola(Number(z));
  }, []);

  const canPrint = navigation.state === "idle";
  const total = Number(seguimientoCarola) + Number(seguimientoRodado);

  // const maxRodado = seguimientoTotal - seguimientoCarola[0];
  // const maxCarola = seguimientoTotal - seguimientoRodado[0];

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
            <CardTitle>Imprimir hoja de seguimiento</CardTitle>
            <CardDescription>{"Hoja de seguimiento configurable"}</CardDescription>
          </CardHeader>
          <CardContent className="gap-2 flex flex-col">
            <div>
              <Label>Total</Label>
              <div className="flex gap-1">
                <Input disabled type="number" name="total" value={total} />
              </div>
            </div>
            <div>
              <Label>Seguimiento Rodado</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="seguimientoRodado"
                  name="seguimientoRodado"
                  value={seguimientoRodado}
                  onChange={(e) => {
                    setSeguimientoRodado(e.target.value);
                    window.localStorage.setItem("seguimientoRodado", e.target.value);
                  }}
                />
              </div>
            </div>
            <div>
              <Label>Seguimiento Carola</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="seguimientoCarola"
                  name="seguimientoCarola"
                  value={seguimientoCarola}
                  onChange={(e) => {
                    setSeguimientoCarola(e.target.value);
                    window.localStorage.setItem("seguimientoCarola", e.target.value);
                  }}
                />
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
