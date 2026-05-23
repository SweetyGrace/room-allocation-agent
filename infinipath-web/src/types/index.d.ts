declare module "*.jpg";
declare module "*.svg";
declare module "*.png";
declare module "*.webp";
declare module '*.scss' {
    const content: { bannerImage[className: string]: string };
    export default content;
  }