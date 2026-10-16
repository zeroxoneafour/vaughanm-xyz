import { createContext } from 'svelte';

/**
 * Set by the /blog layout: the resolved URL of the post list as currently shown behind a post,
 * filters included. Posts close back to it.
 */
export const [getBlogListHref, setBlogListHref] = createContext<() => string>();
