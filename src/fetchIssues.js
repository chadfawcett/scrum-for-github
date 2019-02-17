import { storage } from 'webextension-polyfill'

let ghAccessToken
let lastFetch = 0
let issuePromise
issuePromise = fetchIssues()

export async function fetchIssues() {
  //  Use cache if less than 10 seconds old
  const now = Date.now()
  if (now - lastFetch < 10000) {
    console.debug('using cached issues')
    return issuePromise
  }
  lastFetch = now
  console.debug('fetching issues')

  issuePromise = (async () => {
    const res = await github({
      query: `query($query: String!) {
        search(
          first: 100,
          type: ISSUE,
          query: $query
        ) {
          nodes {
            ... on Issue {
              id
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

export async function updateEstimate(issueId, estimate) {
  estimate = parseFloat(estimate)
  const issue = (await issuePromise)[issueId]

  //  No need to update if estimate did not change
  if (issue.estimate === estimate) return

  issue.estimate = estimate

  const issueInput = {
    id: issue.id,
    body: getUpdatedBody(issue)
  }

  await github({
    query: `mutation($issueInput: UpdateIssueInput!) {
      updateIssue(input: $issueInput) {
        issue {
          id
          body
          databaseId
        }
      }
    }`,
    variables: {
      issueInput
    }
  })

  console.debug(`Updated issue ${issue.id}`)
}

async function github(request) {
  if (!ghAccessToken)
    ghAccessToken = (await storage.local.get(['ghAccessToken'])).ghAccessToken

  if (!ghAccessToken)
    throw new Error('You must set your personal access token for GitHub')

  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `token ${ghAccessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.starfire-preview+json'
    },
    body: JSON.stringify(request)
  })
}

//  Example issue metadata: <!-- scrum = {"estimate":1.5} -->
const metadataPattern = /<!-- scrum = (.*) -->/
function parseEstimate(issue) {
  if (!issue || !issue.body) return

  const match = issue.body.match(metadataPattern)

  if (!match) return

  issue.estimate = JSON.parse(match[1]).estimate
}

function getUpdatedBody(issue) {
  if (!issue || !issue.body || !issue.estimate) return issue

  const match = issue.body.match(metadataPattern)

  if (!match) return issue

  return issue.body.replace(
    match[1],
    JSON.stringify({
      estimate: issue.estimate
    })
  )
}
