import {
  ensureIssueCardLabelsExist,
  ensureColumnPointsLabelExists,
  ensureIssueDetailsPaneLabelExists
} from './ensureLabels'

//  Point estimation syntax
//  Match a positive number (integer or decimal) wrapped in square brackets
const estimatePattern = /\s?\[(?<estimateValue>(?:0|[1-9]\d*)?(?:\.\d+)?)\]\s?/

export const columnObserver = new MutationObserver(mutations => {
  console.log(mutations)
  mutations.forEach(async ({ addedNodes, target: column }) => {
    if (addedNodes.length) {
      //  Note these are organized by the actual issue ids and not issue-card ids
      const issueCards = Array.from(column.querySelectorAll('.issue-card'))

      //  Skip when there are no cards in the column
      if (!issueCards.length) return

      //  Update each card points value, and calculate column total
      const columnPoints = issueCards
        .map(issueCard => {
          const issueTitle = issueCard.querySelector(
            'a.js-project-card-issue-link'
          )
          if (!issueTitle) return 0

          const issuePointsMatch = estimatePattern.exec(issueTitle.innerHTML)
          const labelPoints = issueCard.querySelector('.sfg')
          if (!issuePointsMatch)
            return labelPoints ? parseFloat(labelPoints.innerText) : 0

          const [estimateMatch, estimateValue] = issuePointsMatch

          //  Update label value
          const pointsLabel = ensureIssueCardLabelsExist(issueCard)
          pointsLabel.innerText = estimateValue

          //  Remove estimate from issue title
          issueTitle.innerText = issueTitle.innerText
            .replace(estimateMatch, ' ')
            .trim()

          return parseFloat(estimateValue)
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
