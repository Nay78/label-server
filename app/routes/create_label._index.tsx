import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import fs from "fs/promises";
import { Button } from "~/components/ui/button";
import os from "os";

export async function loader() {
  const homeDirectory = os.homedir();
  console.log(homeDirectory);
  const filePath = homeDirectory + "/Templates";
  const data = await fs.readdir(filePath, "utf-8");
  const filteredFiles: string[] = data.filter((file) => file.endsWith(".odt"));
  const templateFiles: { filename: string; name: string }[] = filteredFiles.map((file) => ({
    filename: file,
    name: file.replace(".odt", "").replaceAll("_", " "),
  }));

  // const data = await response.text();
  // Process the data as needed
  console.log(templateFiles);
  return { templateFiles };
}

export default function Index() {
  const { templateFiles } = useLoaderData<typeof loader>();
  console.log(templateFiles);

  return (
    <div className="grid grid-cols-2 items-center justify-center gap-2 p-2">
      {templateFiles.map(({ filename, name }) => (
        <Button key={name} asChild>
          <Link to={`./${filename}`}>{name}</Link>
        </Button>
      ))}
    </div>
  );
}
