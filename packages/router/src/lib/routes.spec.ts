import { Route } from '@angular/router';
import { of } from 'rxjs';
import { RouteExport, RouteMeta } from './models';
import { getRoutes } from './routes';
import { ROUTE_META_TAGS_KEY } from './meta-tags';

type Files = Record<string, () => Promise<RouteExport>>;
type ModuleRoute = Route & {
  _module?: () => Promise<RouteExport>;
  _children?: ModuleRoute[];
};

class RouteComponent {}

describe('routes', () => {
  describe('a static route', () => {
    const files: Files = {
      '/app/routes/about.ts': () =>
        Promise.resolve<RouteExport>({
          default: RouteComponent,
          routeMeta: {
            title: 'About',
          },
        }),
    };

    const routes = getRoutes(files);
    const route: ModuleRoute = routes[0];

    it('should have a path', () => {
      expect(route.path).toBe('about');
    });

    it('should have a pathMatch set to prefix', () => {
      expect(route.pathMatch).toBe('prefix');
    });

    it('should have a _module property', () => {
      expect(route._module).toBeDefined();

      expect(typeof route._module).toBe('function');
    });

    it('should have a loadChildren property', () => {
      expect(route.loadChildren).toBeDefined();

      expect(typeof route.loadChildren).toBe('function');
    });

    it('should return an array of one route config from the loadChildren property', async () => {
      expect(route.loadChildren).toBeDefined();

      const routes = (await route.loadChildren()) as Route[];

      expect(routes.length).toBe(1);

      const innerRoute = routes.shift();

      expect(innerRoute.path).toBe('');
      expect(innerRoute.component).toBe(RouteComponent);
    });

    it('should contain the route meta properties in the inner route', async () => {
      expect(route.loadChildren).toBeDefined();

      const routes = (await route.loadChildren()) as Route[];

      expect(routes.length).toBe(1);

      const innerRoute = routes.shift();

      expect(innerRoute.title).toBe('About');
    });
  });

  describe('a dynamic route', () => {
    const files: Files = {
      '/app/routes/blog.[slug].ts': () =>
        Promise.resolve({
          default: RouteComponent,
        }),
    };

    const routes = getRoutes(files);
    const route: ModuleRoute = routes[0];

    it('should have a path', () => {
      expect(route.path).toBe('blog/:slug');
    });

    it('should have a pathMatch set to prefix', () => {
      expect(route.pathMatch).toBe('prefix');
    });

    it('should have a _module property', () => {
      expect(route._module).toBeDefined();

      expect(typeof route._module).toBe('function');
    });

    it('should have a loadChildren property', () => {
      expect(route.loadChildren).toBeDefined();

      expect(typeof route.loadChildren).toBe('function');
    });

    it('should return an array of one route config from the loadChildren property', async () => {
      expect(route.loadChildren).toBeDefined();

      const routes = (await route.loadChildren()) as Route[];

      expect(routes.length).toBe(1);

      const innerRoute = routes.shift();

      expect(innerRoute.path).toBe('');
      expect(innerRoute.component).toBe(RouteComponent);
    });
  });

  describe('a nested dynamic route', () => {
    const files: Files = {
      '/app/routes/categories.[categoryId].products.[productId].ts': () =>
        Promise.resolve({ default: RouteComponent }),
    };

    const routes = getRoutes(files);
    const route: ModuleRoute = routes[0];

    it('should have a path', () => {
      expect(route.path).toBe('categories/:categoryId/products/:productId');
    });

    it('should have a pathMatch set to prefix', () => {
      expect(route.pathMatch).toBe('prefix');
    });

    it('should have a _module property', () => {
      expect(route._module).toBeDefined();

      expect(typeof route._module).toBe('function');
    });

    it('should have a loadChildren property', () => {
      expect(route.loadChildren).toBeDefined();

      expect(typeof route.loadChildren).toBe('function');
    });

    it('should return an array of one route config from the loadChildren property', async () => {
      expect(route.loadChildren).toBeDefined();

      const routes = (await route.loadChildren()) as Route[];

      expect(routes.length).toBe(1);

      const innerRoute = routes.shift();

      expect(innerRoute.path).toBe('');
      expect(innerRoute.component).toBe(RouteComponent);
    });
  });

  describe('an index route', () => {
    const files: Files = {
      '/app/routes/index.ts': () =>
        Promise.resolve({ default: RouteComponent }),
    };

    const routes = getRoutes(files);
    const route: ModuleRoute = routes[0];

    it('should have a path', () => {
      expect(route.path).toBeDefined();
    });

    it('should have a pathMatch set to full', () => {
      expect(route.pathMatch).toBe('full');
    });

    it('should have a _module property', () => {
      expect(route._module).toBeDefined();

      expect(typeof route._module).toBe('function');
    });

    it('should have a loadChildren property', () => {
      expect(route.loadChildren).toBeDefined();

      expect(typeof route.loadChildren).toBe('function');
    });

    it('should return an array of one route config from the loadChildren property', async () => {
      expect(route.loadChildren).toBeDefined();

      const routes = (await route.loadChildren()) as Route[];

      expect(routes.length).toBe(1);

      const innerRoute = routes.shift();

      expect(innerRoute.path).toBe('');
      expect(innerRoute.component).toBe(RouteComponent);
    });
  });

  describe('a named index route', () => {
    const files: Files = {
      '/app/routes/(home).ts': () =>
        Promise.resolve({ default: RouteComponent }),
    };

    const routes = getRoutes(files);
    const route: ModuleRoute = routes[0];

    it('should have a path', () => {
      expect(route.path).toBeDefined();
    });

    it('should have a pathMatch set to full', () => {
      expect(route.pathMatch).toBe('full');
    });

    it('should have a _module property', () => {
      expect(route._module).toBeDefined();

      expect(typeof route._module).toBe('function');
    });

    it('should have a loadChildren property', () => {
      expect(route.loadChildren).toBeDefined();

      expect(typeof route.loadChildren).toBe('function');
    });

    it('should return an array of one route config from the loadChildren property', async () => {
      expect(route.loadChildren).toBeDefined();

      const routes = (await route.loadChildren()) as Route[];

      expect(routes.length).toBe(1);

      const innerRoute = routes.shift();

      expect(innerRoute.path).toBe('');
      expect(innerRoute.component).toBe(RouteComponent);
    });
  });

  describe('a parent/child route', () => {
    const files: Files = {
      '/app/routes/products.ts': () =>
        Promise.resolve({ default: RouteComponent }),
      '/app/routes/products/[productId].ts': () =>
        Promise.resolve({ default: RouteComponent }),
    };

    const routes = getRoutes(files);
    const route: ModuleRoute = routes[0];

    describe('parent route', () => {
      it('should have a path', () => {
        expect(route.path).toBe('products');
      });

      it('should have a pathMatch set to prefix', () => {
        expect(route.pathMatch).toBe('prefix');
      });

      it('should have a _module property', () => {
        expect(route._module).toBeDefined();

        expect(typeof route._module).toBe('function');
      });

      it('should have a _children property containing routes', () => {
        expect(route._children).toBeDefined();

        expect(route._children.length).toBe(1);
      });

      it('should have a loadChildren property', () => {
        expect(route.loadChildren).toBeDefined();

        expect(typeof route.loadChildren).toBe('function');
      });

      it('should return an array of one route config from the loadChildren property', async () => {
        expect(route.loadChildren).toBeDefined();

        const routes = (await route.loadChildren()) as Route[];

        expect(routes.length).toBe(1);

        const innerRoute = routes.shift();

        expect(innerRoute.path).toBe('');
      });
    });

    describe('child route', () => {
      it('should come from the parent route', async () => {
        const routes = (await route.loadChildren()) as Route[];
        const innerRoute = routes.shift();

        expect(innerRoute.path).toBe('');
        expect(innerRoute.children).toBeDefined();

        const innerChildRoute = innerRoute.children.shift() as ModuleRoute;

        expect(innerChildRoute.path).toBe(':productId');
        expect(innerChildRoute.pathMatch).toBe('prefix');
        expect(innerChildRoute._module).toBeDefined();
        expect(innerChildRoute.loadChildren).toBeDefined();
      });
    });
  });

  describe('a catchall route', () => {
    const files: Files = {
      '/app/routes/[...not-found].ts': () =>
        Promise.resolve({
          default: RouteComponent,
        }),
    };

    const routes = getRoutes(files);
    const route: ModuleRoute = routes[0];

    it('should have a path', () => {
      expect(route.path).toBe('**');
    });

    it('should have a pathMatch set to prefix', () => {
      expect(route.pathMatch).toBe('prefix');
    });

    it('should have a _module property', () => {
      expect(route._module).toBeDefined();

      expect(typeof route._module).toBe('function');
    });

    it('should have a loadChildren property', () => {
      expect(route.loadChildren).toBeDefined();

      expect(typeof route.loadChildren).toBe('function');
    });

    it('should return an array of one route config from the loadChildren property', async () => {
      expect(route.loadChildren).toBeDefined();

      const routes = (await route.loadChildren()) as Route[];

      expect(routes.length).toBe(1);

      const innerRoute = routes.shift();

      expect(innerRoute.path).toBe('');
      expect(innerRoute.component).toBe(RouteComponent);
    });
  });

  describe('a route with meta tags', () => {
    async function setup(routeMeta: RouteMeta) {
      const files: Files = {
        '/app/routes/index.ts': () =>
          Promise.resolve({ default: RouteComponent, routeMeta }),
      };
      const moduleRoute = getRoutes(files)[0] as ModuleRoute;
      const resolvedRoutes = (await moduleRoute.loadChildren?.()) as Route[];

      return { resolvedRoute: resolvedRoutes[0] };
    }

    it('should add meta tags to data dictionary when they are defined as array', async () => {
      const routeMeta: RouteMeta = {
        data: { foo: 'bar' },
        resolve: { x: () => of('y') },
        meta: [
          { charset: 'utf-8' },
          {
            name: 'description',
            content: 'Books Description',
          },
        ],
      };
      const { resolvedRoute } = await setup(routeMeta);

      expect(resolvedRoute.data).toEqual({
        ...routeMeta.data,
        [ROUTE_META_TAGS_KEY]: routeMeta.meta,
      });
      // routeMeta.data should not be mutated
      expect(routeMeta.data).not.toBe(resolvedRoute.data);
      // routeMeta.resolve should not be changed
      expect(resolvedRoute.resolve).toBe(routeMeta.resolve);
    });

    it('should add meta tags to resolve dictionary when they are defined as resolver', async () => {
      const routeMeta: RouteMeta = {
        resolve: { foo: () => of('bar') },
        data: { x: 1, y: 2 },
        meta: () =>
          of([
            { charset: 'utf-8' },
            {
              name: 'description',
              content: 'Books Description',
            },
          ]),
      };
      const { resolvedRoute } = await setup(routeMeta);

      expect(resolvedRoute.resolve).toEqual({
        ...routeMeta.resolve,
        [ROUTE_META_TAGS_KEY]: routeMeta.meta,
      });
      // routeMeta.resolve should not be mutated
      expect(routeMeta.resolve).not.toBe(resolvedRoute.resolve);
      // routeMeta.data should not be changed
      expect(resolvedRoute.data).toBe(routeMeta.data);
    });
  });
});
