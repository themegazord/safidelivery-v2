declare function route(name: string, params?: Record<string, unknown> | string | number, absolute?: boolean): string;

declare interface Window {
    route: typeof route;
}
