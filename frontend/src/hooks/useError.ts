import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
const useError = () => {
  const toast = useToast();
  useEffect(() => {
    const cb = (e: ErrorEvent) => {
      toast({
        title: "Error",
        description: JSON.stringify(e.reason),
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    };

    window.addEventListener("error", cb);
    window.addEventListener("unhandledrejection", cb);
    return () => {
      window.removeEventListener("error", cb);
      window.removeEventListener("unhandledrejection", cb);
    };
  }, []);
};

export default useError;
