# Scrum for GitHub

A Chrome extension...

## Authentication

Currently you must manually supply a [GitHub access token](https://github.com/settings/tokens) with `repo` permissions.

1.  On a GitHub Project page, open the Chrome DevTools _Console_ tab and select
    _Scrum for GitHub_ from the _JavaScripts Context_ dropdown.
1.  Then run the following, making sure to supply your personal access token.

```js
chrome.storage.local.set({'ghAccessToken', '<your-personal-access-token>'})
```

![instructions](/docs/auth-instructions.png)
