import { fetchIssues } from './fetchIssues'
import {
  ensureIssueCardLabelsExist,
  ensureColumnPointsLabelExists,
  ensureIssueDetailsPaneLabelExists
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

export const issueDetailsPaneObserver = new MutationObserver(
  async mutations => {
    const issues = await issuesPromise

    //  Get issue id from close button
    const btn = document.getElementById('issue-state-button-wrapper')
    if (!btn) return
    const id = btn.dataset.channel.split(':')[1]

    const issue = issues[id]

    mutations
      .filter(m => m.addedNodes.length > 0)
      .forEach(({ target: issueDetailsPane }) => {
        if (!issueDetailsPane) return
        const pointsLabel = ensureIssueDetailsPaneLabelExists(
          issueDetailsPane,
          id
        )
        pointsLabel.value = parseFloat(issue.estimate)
      })
  }
)
