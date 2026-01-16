// ** Dependencies
import React, { ReactElement as JSX } from "react";

function LoadingPage(): JSX {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p className="text-4xl font-bold">Loading...</p>
    </main>
  );
}

export default LoadingPage;