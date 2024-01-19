declare module "*.css" {
    const content: Record<string, string>;
    export default content;
}

declare module '*.svg' {
    const value: any;
    export = value;
}