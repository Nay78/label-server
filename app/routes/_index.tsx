import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Printer } from "lucide-react";

export const meta: MetaFunction = () => {
  return [{ title: "KFS Foods" }, { name: "Viejo perro", content: "Viejo perro" }];
};

export default function Index() {
  return (
    <div className="grid grid-cols-2 items-center justify-center gap-2 p-2">
      <Button asChild className="">
        <Link to="/create_label" className="bg-gradient-to-tr from-red-800 to-rose-950">
          Crear Etiqueta pan
        </Link>
      </Button>
      <Button asChild>
        <Link to="/hoja_seguimiento/configurable" className="bg-gradient-to-tr from-red-800 to-rose-950">
          Hoja seguimiento
        </Link>
      </Button>
      <Button asChild>
        <Link to="/imprimir_documento" className="bg-gradient-to-tr from-zinc-600 to-slate-950">
          Documentos
        </Link>
      </Button>
      <Button asChild>
        <Link to="/imprimir" className="gap-2 bg-gradient-to-tr from-zinc-600 to-slate-950">
          Imprimir papel
          <Printer />
        </Link>
      </Button>
      {/* {templateFiles.map(({ filename, name }) => (
        <Button key={name} asChild>
          <Link to={`./cantidad?file=${filename}`}>{name}</Link>
        </Button>
      ))} */}
    </div>
  );
}
