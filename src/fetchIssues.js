import { storage } from 'webextension-polyfill'

let ghAccessToken
let lastFetch = 0
let issuePromise = fetchIssues()

export default async function fetchIssues() {
  //  Use cache if less than 10 seconds old
  const now = Date.now()
  if (now - lastFetch < 10000) {
    console.debug('using cached issues')
    return issuePromise
  }
  lastFetch = now
  console.debug('fetching issues')

  if (!ghAccessToken)
    ghAccessToken = (await storage.local.get(['ghAccessToken'])).ghAccessToken

  if (!ghAccessToken)
    throw new Error('You must set your personal access token for GitHub')

  issuePromise = (async () => {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `token ${ghAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `query($query: String!) {
          search(
            first: 100,
            type: ISSUE,
            query: $query
          ) {
            nodes {
              ... on Issue {
                body
                databaseId
              }
            }
          }
        }`,
        variables: {
          query: 'project:chadfawcett/1'
        }
      })
    })

    const issues = (await res.json()).data.search.nodes

    //  Parse and add estimate to issues
    issues.forEach(parseEstimate)

    const issuesByDatabaseId = issues.reduce(
      (byId, issue) => ({ ...byId, [issue.databaseId]: issue }),
      {}
    )

    return issuesByDatabaseId
  })()

  return issuePromise
}

//  Example issue metadata: <!-- scrum = {"estimate":1.5} -->
const metadataPattern = /<!-- scrum = (.*) -->/
const parseEstimate = issue => {
  if (!issue || !issue.body) return

  const match = issue.body.match(metadataPattern)

  if (!match) return

  issue.estimate = JSON.parse(match[1]).estimate
}
