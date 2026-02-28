import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ConsoleLogCaptureProvider } from "./components/console-log-capture";

import "./index.css";

export default function App() {
  return (
    <Router root={(props) => <Suspense>{props.children}</Suspense>}>
      <FileRoutes />
      <ConsoleLogCaptureProvider />
    </Router>
  );
}
