import { __cf } from "virtual:vite-loader-effect";

/** @param {string} prop */
export function property(prop) {
  if (prop.toLowerCase() == "classname") return "class";
  return prop;
}

/** @param {HTMLElement} element */
export function style(element, style) {
  for (const property in style) {
    let cssProp = property.replace(/[A-Z][a-z]*/g, str => '-' + str.toLowerCase() + '-')
      .replace('--', '-') // remove double hyphens
      .replace(/(^-)|(-$)/g, ''); // remove hyphens at the beginning and the end
    if (typeof style[property] == "string" || typeof style[property] == "number") element.style[cssProp] = style[property];
    else if (typeof style[property] == "function") __cf(() => element.style[cssProp] = style[property]());
  }
  return element;
}

/** @param {HTMLElement} element */
export function props(element, props, skip = [], include = []) {
  const useSkip = skip && skip.length != 0;
  const useInclude = include && include.length != 0 && !useSkip;
  if (!element || !props) return;
  for (const prop in props) {
    if (useSkip && (skip.includes(prop) || skip.includes(property(prop)))) continue;
    else if (useInclude && !(include.includes(prop) || include.includes(property(prop)))) continue;

    if (prop == "style") style(element, props[prop]);
    else element.setAttribute(property(prop), props[prop]);
  }
}