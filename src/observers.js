import fetchIssues from './fetchIssues'
import {
  ensureIssueCardLabelsExist,
  ensureColumnPointsLabelExists,
  ensureIssueDetailsPaneLabelExists
} from './ensureLabels'

//  Point estimation syntax
//  Match a positive number (integer or decimal) wrapped in square brackets
const estimatePattern = /\s?\[(?<estimateValue>(?:0|[1-9]\d*)?(?:\.\d+)?)\]\s?/

const issuesPromise = fetchIssues()

export const columnObserver = new MutationObserver(async mutations => {
  const issues = await issuesPromise

  mutations.forEach(async ({ addedNodes, target: column }) => {
    const issueCards = Array.from(addedNodes).filter(
      node => node.dataset && node.dataset.cardType.includes('issue')
    )

    if (issueCards.length) {
      //  Update each card points value, while calculating column total
      const columnPoints = issueCards
        .map(issueCard => {
          //  Find the matching issue data
          const issue = issues[issueCard.dataset.contentId]

          if (!issue || !issue.estimate) return 0

          //  Update label value
          const pointsLabel = ensureIssueCardLabelsExist(issueCard)
          pointsLabel.innerText = issue.estimate

          return parseFloat(issue.estimate)
        })
        .reduce((acc, val) => acc + val)

      //  Update column points
      const pointsLabel = ensureColumnPointsLabelExists(column)
      pointsLabel.innerText = columnPoints
    }
  })
})

export const issueDetailsPaneObserver = new MutationObserver(mutations => {
  console.log(mutations)
  const { target: issueDetailsPane } = mutations[mutations.length - 1]

  const issueTitle = issueDetailsPane.querySelector('a > span.js-issue-title')
  if (!issueTitle) return

  const issuePointsMatch = estimatePattern.exec(issueTitle.innerText)
  if (!issuePointsMatch) return

  const [estimateMatch, estimateValue] = issuePointsMatch

  //  Update label value
  const pointsLabel = ensureIssueDetailsPaneLabelExists(issueDetailsPane)
  pointsLabel.innerText = estimateValue

  //  Remove estimate from issue title
  issueTitle.innerText = issueTitle.innerText.replace(estimateMatch, ' ').trim()
})
