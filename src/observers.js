import fetchIssues from './fetchIssues'
import {
  ensureIssueCardLabelsExist,
  ensureColumnPointsLabelExists
} from './ensureLabels'

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
