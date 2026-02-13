import UAParser from "ua-parser-js";

const parser = new UAParser(
  typeof navigator === "undefined" ? "" : navigator.userAgent,
);
const device = parser.getDevice();
const os = parser.getOS();

export const IS_MOBILE = device.type === "mobile" || device.type === "tablet";
export const IS_IOS = os.name === "iOS";
