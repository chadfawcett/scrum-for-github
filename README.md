# Scrum for GitHub

A Chrome extension...

## Authentication

Currently you must manually supply a GitHub access token. In the Chrome DevTools _Console_ tab, select _Scrum for GitHub_. The run the following, being sure to supply your personal access token.

```js
chrome.storage.local.set('ghAccessToken', '<your-personal-access-token>')
```
