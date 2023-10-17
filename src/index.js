import { readFileSync } from "node:fs";

// TODO: Add option to toggle the usage of base64
/**
 * @param {import("./types").options} options
 */
export default function (options = {}) {
  const extensions = ["svg", "png"];
  // TODO: Add seperate queries for file extensions, because you can't use base64 with svg, and raw with png
  const queries = ["raw", "h", "html", "base64"];

  const virtualId = "virtual:vite-loader-effect";
  const resolvedVirtualId = "\0" + "virtual:vite-loader-effect"

  /** @type {import("vite").ResolvedConfig | null} */
  let config = null;
  let opts = options ??= {};
  opts.defaultQuery ??= "html";
  opts.effectFactory ??= "createEffect";

  return {
    name: "@honeyjs/vite-loader",
    enforce: "pre",
    config: () => ({
      optimizeDeps: {
        exclude: ["virtual:vite-loader-effect"]
      },
    }),

    /**
     * @param {import("vite").ResolvedConfig} resolvedConfig 
     */
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      opts.jsxInject ??= config.esbuild.jsxInject;
      opts.jsxFactory ??= config.esbuild.jsxFactory;
      opts.jsxFragment ??= config.esbuild.jsxFragment;
      if (!opts.jsxInject || !opts.jsxFactory || !opts.jsxFragment) {
        config.logger.warn(`JSX parameters are incomplete, please check if you have speficied it in the config file`);
        opts.canUseJSX = false;
      } else opts.canUseJSX = true;
    },

    /**
     * @type {import("vite").ResolveFn}
     */
    async resolveId(id) {
      if (id == virtualId) return resolvedVirtualId;
    },

    /**
     * @param {string} src
     * @param {string} id
     */
    async load(id) {
      if (id == resolvedVirtualId) return virtualModule(opts);
      let [path, query] = id.split("?", 2);
      query ??= opts.defaultQuery;
      const type = path.split(".").pop();
      if (!extensions.includes(type) || query == "url") return;
      if (!queries.includes(query))
        return config.logger.warn(`The query: ${query}, wasn't recognized, file won't be loaded by @honeyjs/vite-loader`);

      if (!opts.canUseJSX && query == "h")
        return config.logger.warn(`Can't transform the file to return a h function, as not all jsx parameters are speficied, please check the config file`);

      // TODO: Handle error if file loading fails
      if (type == "svg") return transformSVG(readFileSync(path, { encoding: "utf-8" }), query, opts);
      if (type == "png") return transformPNG(readFileSync(path), query, opts);
    },
  };
}

/**
 * @param {string} src 
 * @param {string} query 
 */
function transformSVG(src, query) {
  if (query == "raw") {
    return "export default `" + src.replace(/(\r\n|\n|\r)/gm, "") + "`;";
  } else if (query == "html") {
    return "import { props as _p } from '@honeyjs/vite-loader/parsers';" + "\n"
      + "export default function(p){" + "\n"
      + "  let w=document.createElement('div');" + "\n"
      + "  w.innerHTML=`" + src.replace(/(\r\n|\n|\r)/gm, "") + "`;" + "\n"
      + "  let e = w.children[0];" + "\n"
      + "  _p(e, p, ['children','xmlns']);" + "\n"
      + "  return e;" + "\n"
      + "}";
  }
}

/**
 * @param {string} src 
 * @param {string} query 
 */
function transformPNG(src, query, options) {
  if (query == "base64") {
    const base64 = Buffer.from(src).toString("base64");
    return "export default `" + base64 + "`;";
  } else if (query == "html") {
    const base64 = `data:image/png;base64,${Buffer.from(src).toString("base64")}`;
    return "import { props as _p } from '@honeyjs/vite-loader/parsers';" + "\n"
      + "export default function(p){" + "\n"
      + "  let e=document.createElement('img');" + "\n"
      + "  e.src=`" + base64 + "`;" + "\n"
      + "  _p(e, p, ['children','src']);" + "\n"
      + "  return e;" + "\n"
      + "}";
  } else if (query == "h") {
    const base64 = `data:image/png;base64,${Buffer.from(src).toString("base64")}`;
    const h = options.jsxFactory;
    return options.jsxInject + "\n"
      + "export default function(p){" + "\n"
      + "  p.src=`" + base64 + "`;" + "\n"
      + `  return ${h}('img', p);` + "\n"
      + "}";
  }
}

/**
 * @param {import("./types").options} options
 */
function virtualModule(options) {
  if (options.effect) {
    return `${options.effect}; export const __cf = ${options.effectFactory}`;
  } else {
    return `export function __cf(callback) {
      callback();
    }`
  }
}