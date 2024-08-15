import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useFetcher, useNavigation, useParams } from "@remix-run/react";
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useRef, useState } from "react";
import { setBusy } from "~/.server/serverBusy";
import { GET_DOCUMENT_PATH, GET_FILE_PATH } from "~/.server/variables";
import printPaper from "~/.server/printPaper";
import { sendMessage } from "./sse.label_printer";

import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { Plus } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const homeDirectory = os.homedir();
const relativeDirPath = "Templates/Submitted";
const dirpath = homeDirectory + "/Templates/Submitted";

// Action to handle form submission
export async function action({ request, params }: ActionFunctionArgs) {
  const filepath = params.filepath;
  console.log("DOCUMENTO::", filepath);
  if (!filepath) return "FALTA PARAM FILEPATH";

  setBusy(true);
  // Get the form data from the request
  let response = {};
  const body = await request.formData();
  const qty = body.get("qty") || 1;

  sendMessage("Imprimiendo documento");
  response = await printPaper(filepath, qty);

  // wait for 3 seconds to avoid client sending another request
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("Promise resolved");
    }, 5000);
  });
  sendMessage(`Listo`);
  return json({ ...response });
}

export async function loader() {
  const files = await fs.readdir(dirpath, "utf-8");
  // const filteredFiles: string[] = data.filter((file) => file.endsWith(".pdf"));

  // return filteredFiles;

  const filesWithStats = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dirpath, file);
      const stats = await fs.stat(filePath);
      return { file, createdAt: stats.birthtime };
    })
  );

  const sortedFiles = filesWithStats
    .filter((file) => file.file.endsWith(".pdf"))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  // .map((file) => file.file);

  return sortedFiles;
}

export default function Index() {
  "use client";
  const fileInputRef = useRef();
  const [qty, setQty] = useState(1); // Initial value is 1
  const [selectedFile, setSelectedFile] = useState("-");
  const navigation = useNavigation();
  const files: { file: string; createdAt: Date }[] = useLoaderData();
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async () => {
    if (formRef.current) {
      // formRef.current.submit();
      // fetcher.submit("/upload_file");
      // ref.current.click();
      fetcher.submit(formRef.current, { action: "/upload_file" });
    }
    setSelectedFile(fileInputRef.current?.files?.[0]?.name || "-");
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve("Promise resolved");
      }, 1000);
    });
    fileInputRef.current ? (fileInputRef.current.value = "") : null;
  };
  const canPrint = navigation.state === "idle" && selectedFile !== "-";
  const filepath = `${relativeDirPath}/${selectedFile}`;

  if (canPrint) {
    null;
  }

  return (
    <div className="flex p-6 w-full gap-2">
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>

          <CardContent className="gap-2 flex flex-col">
            <div>
              <Form method="POST" action="">
                <div className="flex items-center gap-4 justify-center">
                  {/* <Label className="w-64 ">{selectedFile}</Label> */}

                  <Button className="flex-grow h-10" type="submit" disabled={!canPrint}>
                    {canPrint ? `Imprimir ${selectedFile}  [x${qty}] ` : "Sin selección..."}
                  </Button>
                  <div className="flex gap-2 items-center">
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
                      {/* <input type="text" value={selectedFile} name="documento" hidden={true} onChange={() => null} /> */}
                      <input type="text" value={filepath} name="filepath" hidden={true} onChange={() => null} />

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
                      <Button
                        variant={"default"}
                        type="button"
                        onClick={() => {
                          setQty(qty - 1);
                        }}
                        className="h-10"
                      >
                        -
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </CardContent>
          <Separator></Separator>
          <CardContent className="pt-4 gap-2 flex flex-col">
            <div>
              <div className="flex flex-col gap-2">
                {files.map((file) => {
                  const f = file.file;
                  const createdAt = `hace ${formatDistanceToNow(file.createdAt, { locale: es })}`;

                  return (
                    <Button
                      variant={selectedFile === f ? "secondary" : "outline"}
                      size={"sm"}
                      key={f}
                      className="flex text-left border rounded-md p-1 hover:border-2 aria-selected:border-2 justify-between px-4"
                      onClick={() => (selectedFile !== f ? setSelectedFile(f) : setSelectedFile("-"))}
                      aria-selected={selectedFile === f}
                    >
                      <Label>{f}</Label>
                      <Label>{createdAt}</Label>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <Separator></Separator>
          <CardFooter className="pt-4">
            <fetcher.Form ref={formRef} action="/upload_file" method="POST" encType="multipart/form-data">
              <div className="flex flex-col w-full gap-2">
                <CardTitle>Subir archivo (PDF)</CardTitle>

                <Input
                  ref={fileInputRef}
                  className="flex-grow"
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                >
                  {/* {canPrint ? "Subir" : "Ocupado..."} */}
                </Input>
                {/* <Button ref={ref} className="flex-grow" type="submit" disabled={!canPrint}>
                  {canPrint ? "Subir" : "Ocupado..."}
                </Button> */}
              </div>
            </fetcher.Form>
          </CardFooter>
        </Card>
      </div>

      {/* <div className="w-full">
        <Form method="POST" action="">
          <Card className="aria-selected:border-black" aria-selected={selectedFile !== "-"}>
            <CardHeader>
              <CardTitle>Imprimir documento</CardTitle>
              <CardDescription>{selectedFile}</CardDescription>
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
                  <Button
                    variant={"default"}
                    type="button"
                    onClick={() => {
                      setQty(qty - 1);
                    }}
                    className="h-10"
                  >
                    -
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="flex-grow" type="submit" disabled={!canPrint}>
                {canPrint ? `Imprimir ${selectedFile}` : "Sin selección..."}
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </div> */}
    </div>
  );
}

// function Submitter() {
//   "use client";
//   const ref = useRef();
//   const fileInputRef = useRef();
//   const [qty, setQty] = useState(1); // Initial value is 1
//   const [selectedFile, setSelectedFile] = useState("-");
//   const { documento } = useParams();
//   const navigation = useNavigation();
//   const fetcher = useFetcher();

//   const formRef = useRef<HTMLFormElement>(null);

//   const handleFileChange = async () => {
//     if (formRef.current) {
//       // formRef.current.submit();
//       // fetcher.submit("/upload_file");
//       // ref.current.click();
//       fetcher.submit(formRef.current, { action: "/upload_file" });
//     }
//     setSelectedFile(fileInputRef.current?.files?.[0]?.name || "-");
//     await new Promise((resolve) => {
//       setTimeout(() => {
//         resolve("Promise resolved");
//       }, 1000);
//     });
//     fileInputRef.current ? (fileInputRef.current.value = "") : null;
//   };
//   const canPrint = navigation.state === "idle" && selectedFile !== "-";

//   if (canPrint) {
//     null;
//   }

//   return (
//     <div className="w-full">
//       <fetcher.Form ref={formRef} action="/upload_file" method="POST" encType="multipart/form-data">
//         <Card>
//           <CardFooter>
//             <div className="flex flex-col w-full gap-2">
//               <CardTitle>Subir archivo (PDF)</CardTitle>

//               <Input
//                 ref={fileInputRef}
//                 className="flex-grow"
//                 type="file"
//                 name="file"
//                 accept=".pdf"
//                 onChange={handleFileChange}
//               >
//                 {/* {canPrint ? "Subir" : "Ocupado..."} */}
//               </Input>
//               {/* <Button ref={ref} className="flex-grow" type="submit" disabled={!canPrint}>
//                   {canPrint ? "Subir" : "Ocupado..."}
//                 </Button> */}
//             </div>
//           </CardFooter>
//         </Card>
//       </fetcher.Form>
//     </div>
//   );
// }
