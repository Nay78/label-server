import { json } from "@remix-run/node";
import { cancelPrint } from "~/.server/printLabel";

export async function loader() {
  return cancelPrint();
}

// Action to handle form submission
// export async function action({ request }: ActionArgs) {
//   await cancelPrint();
//   return json({ command, ...response });
// }
