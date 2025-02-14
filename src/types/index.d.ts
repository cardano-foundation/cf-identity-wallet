declare module "*.jpg";
declare module "*.png";
declare module "*.svg";
declare module "*.gif";
declare module "*.yaml" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}
