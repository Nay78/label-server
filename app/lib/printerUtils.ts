import { DOMParser } from "xmldom";

export async function fetchAndExtractPrintingStatus(url: string): Promise<"READY" | "PRINTING" | "BUSY" | "ERROR"> {
  // Fetch the response
  const response = await fetch(url);

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  // Read the response text
  const responseText = await response.text();
  // console.log("Response text:", responseText);

  // Parse the XML response
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(responseText, "text/xml");

  // Check for parse errors
  const parseErrors = xmlDoc.getElementsByTagName("parsererror");
  if (parseErrors.length > 0) {
    throw new Error("XML parsing error: " + parseErrors[0].textContent);
  }

  const printingStatusElement = xmlDoc.getElementsByClassName("moni")[0];

  // Extract the status text
  if (printingStatusElement) {
    return printingStatusElement.textContent.trim();
  } else {
    throw new Error("Printing status not found in the response");
  }
}

// import { JSDOM } from "jsdom";

// export async function fetchAndExtractPrintingStatus(url: string): Promise<"READY" | "PRINTING" | "BUSY" | "ERROR"> {
//   // Fetch the response
//   const response = await fetch(url);

//   // Check if the request was successful
//   if (!response.ok) {
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }

//   // Read the response text
//   const responseText = await response.text();

//   // Parse the XML response
//   const dom = new JSDOM(responseText, { contentType: "text/xml" });
//   const xmlDoc = dom.window.document;

//   // Check for parse errors
//   const parseErrors = xmlDoc.getElementsByTagName("parsererror");
//   if (parseErrors.length > 0) {
//     throw new Error("XML parsing error: " + parseErrors[0].textContent);
//   }

//   const printingStatusElement = xmlDoc.getElementsByClassName("moni")[0];

//   // Extract the status text
//   if (printingStatusElement) {
//     return printingStatusElement.textContent.trim();
//   } else {
//     throw new Error("Printing status not found in the response");
//   }
// }
