import { Plugin } from "vite";

declare interface options {
  /**
   * The import code to inject when loading an asset with dynamic properties,
   * leave empty to not use reactive values.
   *
   * It should look like this
   * ```
   *  import { createEffect } from "reactivity-library"
   * ```
   * Where `createEffect` needs to be the same as `effectFactory`, this can be anything.
   * And `reactivity-library` should be the library you're using, for example `@honeyjs/core`
   *
   * If you're not using reactivity, you should leave this empty or null
   */
  effect: string | undefined;
  /**
   * The function to use when resolving an effect
   * @default "createEffect"
   */
  effectFactory: string;
  /**
   * The default type to use when there is no query specified.
   * ```
   *  import Logo from "./assets/logo";
   * ```
   * results in this when the defaultQuery is html
   * ```
   *  import Logo from "./assets/logo?html"
   * ```
   */
  defaultQuery: query;

  /**
   * Ignore this value if you've already specified this in the esbuild section of the config file
   *
   * This value should be similar to this
   * ```
   *  import { h, Fragment } from "jsx-library"
   * ```
   * Where `h` and `Fragment` need to match the `jsxFactory` and the `jsxFragment` options.
   * And "jsx-libary" is the libary you're using, for example `@honeyjs/core`
   */
  jsxInject: string | undefined;
  /**
   * Speficies which h function to use
   * @default "h"
   */
  jsxFactory: string | undefined;
  /**
   * Specifies which Fragment function to use
   * @default "Fragment"
   */
  jsxFragment: string | undefined;
}

declare type query = "html" | "h" | "url";

export default function (options?: options): Plugin;
