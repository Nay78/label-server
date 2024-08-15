import {
  ActionFunctionArgs,
  json,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import os from "os";
import fs from "fs";

// function that receives a file and puts it in home dir
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const file: File = body.get("file") as File;
  console.log("FILE:", file);

  const homeDirectory = os.homedir();
  const filePath = homeDirectory + "/Templates/Submitted";
  console.log("X", JSON.stringify(file));

  console.log(file);
  const path = `${filePath}/${file.name}`;
  const data = await file.arrayBuffer();
  fs.writeFile(path, new Int8Array(data), (err) => {});

  //   return formData
  return true;

  //   return json({ message: "File uploaded" });
}
