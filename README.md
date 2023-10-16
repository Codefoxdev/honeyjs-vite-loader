# Vite loader

`@honeyjs/vite-loader` is a usefull vite plugin that improves the developer experience when working with assets, see [usage](#usage) for info on how to use it.
Although this package doesn't require `@honeyjs/core`, it is still listed as it integrates with its reactivity system, feel free to contact me or create an issue on github if you also want it to integrate with other frameworks.

## configuration

```js
import { defineConfig } from "vite";
import loader from "@honeyjs/vite-loader";

export default defineConfig({
  plugins: [
    loader({
      /* options */
    }),
  ],
});
```

```ts
loader({
  defaultResult: "h" | "html", // Changes what the default import results in, h returns a normal h function and html returns a native html element, defaults to html
  useBase64: boolean, // Toggles the usage of base64 with images like png, defaults to true
  jsxInject: string, // Define what to inject when returning a h function, defaults to the esbuild.jsxInject parameter in the config file
  jsxFactory: string, // Defines the jsx factory function to use, defaults to the esbuild.jsxFactory parameter in the config file
  jsxFragment: string, // Defines the jsx fragment function to use, defaults to the esbuild.jsxFragment parameter in the config file
});
```

The `defaultResult` is by default html, which means importing an assets like this

```jsx
import Logo from "../assets/logo.png";
```

is the same as this

```jsx
import Logo from "../assets/logo.png?html";
```

The reason why `useBase64` defaults to true is because this has the advantage that it will be loaded instantly,
although this does result in a larger import size, it will still seem faster to the end-user.

For more info about the jsx related parameters, refer to [vite's jsx documentation](https://vitejs.dev/guide/features.html#jsx).

## usage

When using vite's builtin assets loader, you get the url to the loaded assets, which you than can use in your jsx, like this:

```jsx
import logoSrc from "../assets/logo.png";

export function Topbar() {
  return (
    <nav>
      <div class="logo">
        <img src={logoSrc} alt="Logo" />
      </div>
      <div class="center">
        <h1>App title</h1>
      </div>
    </nav>
  );
}
```

When the above image is loaded using the html option, it will look something like this.

```js
import { props as _p } from "@honeyjs/vite-loader/parsers";
export default function (p) {
  let e = document.createElement("img");
  e.src = `data:image/png;base64,...`;
  _p(e, p, ["children", "src"]);
  return e;
}
```

As you can see the image will be loaded as base64, this is default behaviour, but it can be changed in the [config](#config).
