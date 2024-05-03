/**
 * v0 by Vercel.
 * @see https://v0.dev/t/1XybCnQlLeH
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import { Link } from "@remix-run/react";

export default function Component() {
  return (
    <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <Link className="flex items-center space-x-2 h-full w-20" to={".."}>
        <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <span className="font-medium text-gray-700 dark:text-gray-300">Atras</span>
      </Link>
      {/* <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Page Title</h1> */}
      <img src={"./KFS_LOGO.jpg"} alt="" className="h-12" />

      {/* <div className="w-5 h-5" /> */}
    </header>
  );
}

function ArrowLeftIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
