import { exec } from "child_process";

export function execPromise(command: string) {
  console.log("Executing command", command);
  return new Promise<boolean>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // console.error(`Error executing script: ${error.message}`);
        console.log(`Command exec ERROR: ${command} \n\nstdout: ${stdout} \n\nstderr: ${stderr}`);

        // resolve({ error: "Error executing script", message: error.message });
        resolve(false);
      }

      console.log(`Command exec SUCCESS: ${command} \n\nstdout: ${stdout}`);
      // resolve({ output: stdout });
      resolve(true);
    });
  });
}
