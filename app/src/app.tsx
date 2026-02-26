import type { Component } from "solid-js";
import { VStack } from "../styled-system/jsx";

import "./index.css";
import { Button } from "./components/ui/button";
import { Send } from "lucide-solid";
import { AbsoluteCenter } from "./components/ui/absolute-center";
import { ConsoleLogCaptureProvider } from "./components/console-log-capture";

const App: Component = () => {
  return (
    <>
      <AbsoluteCenter axis="both">
        <VStack gap="8">
          <div>Hello 🐼!</div>

          <Button variant="outline" size="sm">
            <Send />
            Click me
          </Button>
        </VStack>
      </AbsoluteCenter>
      <ConsoleLogCaptureProvider />
    </>
  );
};

export default App;
