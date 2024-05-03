import { exec } from "child_process";

export function execPromise(command: string) {
  console.log("Executing command", command);
  return new Promise<{ error?: string; message?: string; output?: string }>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        resolve({ error: "Error executing script", message: error.message });
        return;
      }

      console.log(`Command exec SUCCESS: ${command} \nOUTPUT: ${stdout}`);
      resolve({ output: stdout });
    });
  });
}
