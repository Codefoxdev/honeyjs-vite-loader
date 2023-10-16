import { readFileSync } from "node:fs";

// TODO: Add option to toggle the usage of base64
/**
 * @param {object} options
 * @param {"h" | "html"} options.defaultResult Changes what the default import results in, h returns a normal h function and html returns a native html element, defaults to html
 * @param {string} options.jsxInject The import code to inject into the src, defaults to vite's value
 * @param {string} options.jsxFactory The jsxfactory code to use, defaults to vite's value
 * @param {string} options.jsxFragment The jsx fragment code to use, defaults to vite's value
 */
export default function (options = {}) {
  const extensions = ["svg", "png"];
  // TODO: Add seperate queries for file extensions, because you can't use base64 with svg, and raw with png
  const queries = ["raw", "h", "html", "base64"];

  /** @type {import("vite").ResolvedConfig | null} */
  let config = null;
  let opts = options ??= {};

  return {
    name: "@honeyjs/vite-loader",
    enforce: "pre",

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
     * @param {string} src
     * @param {string} id
     */
    async load(id) {
      let [path, query] = id.split("?", 2);
      query ??= opts.defaultResult;
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