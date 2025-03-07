/// <reference types="vite/client" />

import type { Route } from '@angular/router';

import { RouteExport, RouteMeta } from './models';
import { toRouteConfig } from './route-config';
import { toMarkdownModule } from './markdown-helpers';

const FILES = import.meta.glob<RouteExport>([
  '/app/routes/**/*.ts',
  '/src/app/routes/**/*.ts',
  '/src/app/pages/**/*.page.ts',
]);

const CONTENT_FILES = import.meta.glob<string>(
  ['/src/app/routes/**/*.md', '/src/app/pages/**/*.md'],
  {
    as: 'raw',
  }
);

/**
 * Function used to parse list of files and return
 * configuration of routes.
 *
 * @param files
 * @returns Array of routes
 */
export function getRoutes(
  files: Record<string, () => Promise<RouteExport | string>>
) {
  const ROUTES = Object.keys(files).sort((a, b) => a.length - b.length);

  const routeConfigs = ROUTES.reduce<Route[]>(
    (routes: Route[], key: string) => {
      const module: () => Promise<RouteExport> = key.endsWith('.md')
        ? toMarkdownModule(files[key] as () => Promise<string>)
        : (files[key] as () => Promise<RouteExport>);

      const segments = key
        .replace(
          /^\/(.*?)\/routes|^\/(.*?)\/pages|\/app\/routes|\.page|\.(js|ts|md)$/g,
          ''
        )
        .replace(/\[\.{3}.+\]/, '**')
        .replace(/\[([^\]]+)\]/g, ':$1')
        .split('/')
        .filter(Boolean);

      segments.reduce((parent, segment, index) => {
        const path = segment
          .replace(/index|^\(.*?\)$/g, '')
          .replace(/\./g, '/');
        const isIndex = !path;
        const isCatchall = path === '**';
        const pathMatch = isIndex ? 'full' : 'prefix';
        const root = index === 0;
        const leaf = index === segments.length - 1 && segments.length > 1;
        const node = !root && !leaf;
        const insert = /^\w|\//.test(path) && !isCatchall ? 'unshift' : 'push';

        if (root) {
          const dynamic = path.startsWith(':');
          if (dynamic) return parent;

          const last = segments.length === 1;
          if (last) {
            const newRoute = {
              path,
              pathMatch,
              _module: () => module(),
              loadChildren: () =>
                module().then((m) => [
                  {
                    path: '',
                    component: m.default,
                    ...toRouteConfig(m.routeMeta as RouteMeta | undefined),
                  },
                ]),
            };

            routes?.[insert](newRoute as Route);
            return parent;
          }
        }

        if (root || node) {
          const current = root ? routes : parent._children;
          const found = current?.find((route: any) => route.path === path);

          if (found) {
            if (!found._children) {
              found._children = [];
            }

            found.pathMatch = pathMatch;
          } else {
            current?.[insert]({
              path,
              pathMatch,
              _module: () => module(),
              loadChildren: () =>
                module().then((m) => [
                  {
                    path: '',
                    component: m.default,
                    ...toRouteConfig(m.routeMeta as RouteMeta | undefined),
                  },
                ]),
            });
          }

          return (
            found ||
            (current?.[insert === 'unshift' ? 0 : current.length - 1] as Route)
          );
        }

        if (leaf) {
          parent?._children?.[insert]({
            path,
            pathMatch,
            _module: () => module(),
            loadChildren: () =>
              module().then((m) => [
                {
                  path: '',
                  component: m.default,
                  ...toRouteConfig(m.routeMeta as RouteMeta | undefined),
                },
              ]),
          });
        }

        if (parent._children) {
          parent.loadComponent = () =>
            parent._module().then((m: RouteExport) => m.default);
          parent.loadChildren = () =>
            parent._module().then((m: RouteExport) => {
              return [
                {
                  path: '',
                  children: parent._children,
                  ...toRouteConfig(m.routeMeta as RouteMeta | undefined),
                },
              ];
            });
        }

        return parent;
      }, {} as Route & { _module: () => Promise<RouteExport>; _children: any[] });

      return routes;
    },
    []
  );

  return routeConfigs;
}

export const routes: Route[] = [...getRoutes({ ...FILES, ...CONTENT_FILES })];
