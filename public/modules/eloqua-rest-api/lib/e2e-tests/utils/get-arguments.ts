import {IEloquaCredentials} from "../../eloqua-credentials";

export default function getArguments(): IEloquaCredentials {
  const allArgs = parseArguments();
  return {
    password: allArgs["--elq-password"],
    siteName: allArgs["--elq-site-name"],
    userName: allArgs["--elq-user-name"],
  };
}

function parseArguments(): {[key: string]: string} {
  const result: {[key: string]: string} = {};
  process.argv.forEach((value) => {
    const keyValue = value.split("=");
    result[keyValue[0]] = keyValue.length > 1 ? keyValue[1] : keyValue[0];
  });
  return result;
}
