# Bundled npm installer

`npm-8.19.4.tgz` is the immutable npm 8.19.4 registry artifact used only by the private WorkflowScript Environment Service.

- Upstream: `https://registry.npmjs.org/npm/-/npm-8.19.4.tgz`
- Integrity: `sha512-3HANl8i9DKnUA89P4KEgVNN28EjSeDCmvEqbzOAuxCFDzdBZzjUl99zgnGpOUumvW5lvJo2HKcjrsc+tfyv1Hw==`
- License: Artistic-2.0
- Node engines: `^12.13.0 || ^14.15.0 || >=16.0.0`

The archive is extracted into the product-owned project runtime directory after its digest is verified. It is never exposed as an Agent tool and never resolves packages from a user-selected registry.
