// Minimal types to satisfy TypeScript when importing subpaths
// The implementation is transpiled by Next via `transpilePackages`.
declare module "@iofbim/design-system/components/*" {
  const Component: any;
  export default Component;
}

declare module "@iofbim/design-system/tokens.css";
