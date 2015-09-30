# sandblaster.js
[![GitHub Latest Release](https://badge.fury.io/gh/JamesMGreene%2Fsandblaster.png)](https://github.com/JamesMGreene/sandblaster) [![Build Status](https://secure.travis-ci.org/JamesMGreene/sandblaster.png?branch=master)](https://travis-ci.org/JamesMGreene/sandblaster) [![Dependency Status](https://david-dm.org/JamesMGreene/sandblaster.png?theme=shields.io)](https://david-dm.org/JamesMGreene/sandblaster) [![Dev Dependency Status](https://david-dm.org/JamesMGreene/sandblaster/dev-status.png?theme=shields.io)](https://david-dm.org/JamesMGreene/sandblaster#info=devDependencies)

A client-side JavaScript library to detect if your code is running inside of a `sandbox`ed `iframe`... and, if desired, might just be able to change that fact!



## Background

### What is a `sandbox`ed `iframe`?

The `sandbox` attribute of the `iframe` element (new in HTML5, supported in IE10+ and all other evergreen browsers) provides web developers with a way tighten the restrictions on framed content beyond what [Content Security Policy (CSP)](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) provides for un`sandbox`ed cross-origin `iframe`s.  With the `sandbox` attribute, you can instruct the browser to load a specific frame's content in a low-privilege environment, starting with the least privilege possible and then whitelisting the necessary subset of capabilities.

It is also very important to note, however, that the `sandbox` attribute takes away some privileges from the framed content that **CANNOT** be whitelisted "back in". For example, any framed page running in a sandbox absolutely _cannot_ run native plugins (e.g. Flash, Silverlight, Java, etc.). This decision was made because native plugins run unmanaged code that the browser cannot offer any further security verifications on, and are frequently sourced from third parties.

#### See Also

 - [HTML5 Rocks :metal: article on `sandbox`ed `iframe`s](http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/)
 - [HTML spec: `iframe` `sandbox` attribute](https://html.spec.whatwg.org/multipage/embedded-content.html#attr-iframe-sandbox)
 - [HTML spec: Browser sandboxing](http://www.w3.org/TR/html/browsers.html#sandboxing)
 - [HTML5 Rocks :metal: article on Content Security Policy (CSP)](http://www.html5rocks.com/en/tutorials/security/content-security-policy/)



## Getting Started

### Install

Sandblaster.js is published to NPM for ease of installation:

```shell
npm install sandblaster
```

Please keep in mind, however, that it _only_ works in browser contexts, not in Node.js.


### Load

Then, load up the "sandblaster.js" script on your HTML page:

```html
<script src="node_modules/sandblaster/dist/sandblaster.min.js"></script>
```



## Usage

### Analysis

Detect and analyze, as best as possible, the state of the current `window` as it relates to being within a frame, `sandbox`ed, and/or cross-origin:

```js
var result = sandblaster.detect();
```

For full details on this analysis result object, see [The Analysis Result](#the-analysis-result) below.


### Action

#### Rebellion: Un`sandbox`ing

If it is possible for your `window` state, you can also attempt to remove the `sandbox`ing:

```js
var succeeded = sandblaster.unsandbox();  // {true|false}
```

**NOTE:** Executing this function will also return `true` if the `window` is _not_ within a frame at all. The basic concept of its return value is that it should be `true` if the `window` is _not_ `sandbox`ed at the end of the call.


#### Submission: Re`sandbox`ing & `sandbox`ing

If you un`sandbox`ed the `window` and later decide you want to re`sandbox` it exactly as it was before:

```js
var succeeded = sandblaster.resandbox();  // {true|false}
```


Or, if the existing `window` state will allow it, you can also add and/or update the `sandbox` configuration to whatever acceptable value you want:

```js
var succeeded = sandblaster.sandbox({
  scripts: true,
  sameDomain: true,
  forms: false,
  pointerLock: false,
  popups: false,
  topNavigation: false
});
```

If the `window` is already in a `sandbox`ed `iframe`, any non-Boolean values in the allowances object will defer to their current value in the DOM.


#### Resetting: Reloading the `iframe`

If it is possible for your `window` state, you can also attempt to reload the `iframe` with its current attributes:

```js
var succeeded = sandblaster.reload();  // {true|false}
```

This is useful for those who want to make native plugins work after removing sandboxing (e.g. on JSFiddle, CodePen, etc.):

```js
var result = sandblaster.detect();
if (result.sandboxed && sandblaster.unsandbox()) {
  sandblaster.reload();
}
```

**NOTE:** If this function succeeds, your following code may never get a chance to execute as the framed page will begin reloading.


## The Anaylsis Result

A live visualization of every known possible analysis result can be seen at [jamesmgreene.github.io/sandblaster/test-iframes.html](http://jamesmgreene.github.io/sandblaster/test-iframes.html).

The result object structure is as follows:

```js
var result = sandblaster.detect();

/*

// `null` == uncertain
// `undefined` == not applicable

result = {
  framed: true|false,
  crossOrigin: true|false|null|undefined,
  sandboxed: true|false|null|undefined,
  sandboxAllowances: undefined|{
    forms: true|false|null,
    modals: true|false|null,
    pointerLock: true|false|null,
    popups: true|false|null,
    popupsToEscapeSandbox: true|false|null,
    sameOrigin: true|false|null,
    scripts: true|false|null,
    topNavigation: true|false|null
  },
  unsandboxable: true|false|undefined,
  resandboxable: true|false|undefined,
  sandboxable: true|false|undefined,
  errors: [
    // Any Errors that occurred during all of the various security probing. Just because there
    // were Errors does NOT mean that something actually went wrong unexpectedly.
    // Errors are provided as plain objects with `name`, `message`, and `stack` properties.
  ]
};

*/
```
