import { JSX } from "react";
import { render } from "@react-email/render";

export function renderEmail(jsx: JSX.Element) {
  return render(jsx, { pretty: true }); // outputs a safe HTML string
}
