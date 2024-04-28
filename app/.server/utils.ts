import { exec } from "child_process";

export function execPromise(command: string) {
  return new Promise<{ error?: string; message?: string; output?: string }>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        resolve({ error: "Error executing script", message: error.message });
        return;
      }

      console.log(`Script output: ${stdout}`);
      resolve({ output: stdout });
    });
  });
}
