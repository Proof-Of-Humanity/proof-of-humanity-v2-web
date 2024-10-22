export const camelToTitle = (
  strIn: string,
  revocation?: boolean,
  expired?: boolean,
) => {
  let str: string = strIn;
  switch (strIn) {
    case "vouching":
      str = strIn;
      break;
    case "withdrawn":
      str = strIn;
      break;
    case "transferred":
      str = strIn;
      break;
    case "transferring":
      str = expired ? "incomplete" : "update";
      break;
    case "resolving":
      str = strIn;
      str = revocation ? "revocation" : "claim";
      break;
    case "disputed":
      str = "disputed";
      break;
    case "resolved":
      str = strIn;
      str = revocation ? "revoked" : expired ? "expired" : "included";
      break;
  }
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
