// react-markdown@8 and other pre-React-19 libraries reference the global JSX
// namespace (e.g. JSX.IntrinsicElements) which @types/react@19 removed.
// This shim re-exports React.JSX into the global namespace so those type
// definitions continue to resolve without needing to upgrade every package.
import type React from "react";

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type IntrinsicElements = React.JSX.IntrinsicElements;
  }
}

export {};
