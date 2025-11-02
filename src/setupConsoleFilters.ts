const shouldFilterTroikaDebugMessage = (args: unknown[]): boolean => {
  return (
    typeof args[0] === "string" &&
    args[0] === "unsupported GPOS table LookupType" &&
    args.length >= 4 &&
    typeof args[1] === "number" &&
    typeof args[2] === "string" &&
    args[2] === "format"
  );
};

(() => {
  if (import.meta.env.PROD) {
    return;
  }

  const originalDebug = console.debug;

  console.debug = (...args: unknown[]) => {
    if (shouldFilterTroikaDebugMessage(args)) {
      return;
    }

    originalDebug(...args);
  };
})();
