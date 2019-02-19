# Scrum for GitHub

A Chrome extension...

## Authentication

Currently you must manually supply a GitHub access token.

1.  In the Chrome DevTools _Console_ tab, select _Scrum for GitHub_ from the
    _JavaScripts Context_ dropdown.
1.  Then run the following, being sure to supply your personal access token.

```js
chrome.storage.local.set('ghAccessToken', '<your-personal-access-token>')
```

![instructions](/docs/auth-instructions.png)
