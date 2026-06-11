"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettingsPopover } from "context/SettingsPopoverContext";
const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {};
  if (!queryString) return params;

  queryString.split("&").forEach((param) => {
    if (!param) return;
    const [key, value] = param.split("=");
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
      try {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      } catch (error) {
        console.warn("Failed to decode URL parameter:", param);
      }
    }
  });
  return params;
};

const HashBasedRedirectHandler: React.FC = () => {
  const router = useRouter();
  const { openSettingsPopover } = useSettingsPopover();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;

      if (hash.startsWith("#/settings/email-confirmation")) {
        const queryString = hash.split("?")[1];
        if (queryString) {
          const params = parseQueryString(queryString);
          const address = params["address"];
          const token = params["token"];

          if (address && token) {
            const newPath = `/confirm-email?address=${encodeURIComponent(address)}&token=${encodeURIComponent(token)}`;
            router.replace(newPath);
          }
        }
      } else if (hash.startsWith("#/settings/notifications")) {
        openSettingsPopover();
        // Strip the hash so the popover state stays authoritative and the deep
        // link doesn't re-open it on later renders.
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [router, openSettingsPopover]);

  return null;
};

export default HashBasedRedirectHandler;
