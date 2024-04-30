import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function Index() {
  return (
    <div className="grid grid-cols-2 items-center justify-center gap-2 p-2">
      <Button asChild className="">
        <Link to="/create_label">Crear Etiqueta</Link>
      </Button>
      <Button asChild disabled>
        <Link to="/hoja_seguimiento">Hoja seguimiento</Link>
      </Button>
      {/* {templateFiles.map(({ filename, name }) => (
        <Button key={name} asChild>
          <Link to={`./cantidad?file=${filename}`}>{name}</Link>
        </Button>
      ))} */}
    </div>
  );
}
