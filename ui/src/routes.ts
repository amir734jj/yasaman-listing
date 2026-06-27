/**
 * Central route table. Use these instead of hard-coded path strings so call sites get
 * autocomplete and are checked at compile time (e.g. `paths.profile` instead of `'/profile'`).
 *
 * For routes with params, build the URL with `compilePath`:
 *   compilePath(paths.listingById, { id }) -> '/listings/123'
 */
export const paths = {
  root: '/',
  about: '/about',
  login: '/login',
  register: '/register',
  profile: '/profile',
  create: '/create',
  listings: '/listings',
  listingById: '/listings/:id',
  editListing: '/listings/:id/edit',
  adminUsers: '/admin/users',
  any: '*',
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];

/** Substitutes `:name` params in a route pattern, URL-encoding each value. */
export function compilePath(route: string, params: Record<string, string | number>): string {
  return route.replace(/:([A-Za-z0-9_]+)/g, (_match, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing route param "${key}" for "${route}"`);
    }
    return encodeURIComponent(String(value));
  });
}
