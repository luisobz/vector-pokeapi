export const ROUTES = {
    ROOT: "/",
    SEARCH: "/search",
    POKEMON_DETAIL: "/pokemon/:id",
} as const;

export type RouteKey = keyof typeof ROUTES;

type RouteParams = {
    ROOT: never;
    SEARCH: never;
    POKEMON_DETAIL: { id: number | string };
};

export function buildPath<T extends RouteKey>(
    route: T,
    ...[params]: RouteParams[T] extends never ? [] : [RouteParams[T]]
): string {
    let path: string = ROUTES[route];

    if (params) {
        Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
            path = path.replace(`:${key}`, String(value));
        });
    }

    return path;
}