import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootNode = document.getElementById("root")!;
const root = createRoot(rootNode);
root.render(
  <ChakraProvider>
    <App />
  </ChakraProvider>
);
