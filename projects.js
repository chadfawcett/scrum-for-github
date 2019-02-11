//  Point estimation syntax
//  Match a positive number (integer or decimal) wrapped in square brackets
const estimatePattern = /\s?\[(?<estimateValue>(?:0|[1-9]\d*)?(?:\.\d+)?)\]\s?/

function ensureIssueCardLabelsExist(issueCard) {
  let labels = issueCard.querySelector('.labels')
  if (!labels) {
    labels = document.createElement('span')
    labels.className = 'labels d-block pb-1 pr-6 sfg'
    issueCard
      .querySelector('.js-project-issue-details-container')
      .insertBefore(labels, issueCard.querySelector('.AvatarStack'))
  }

  let pointsLabel = labels.querySelector('.points-label')
  if (!pointsLabel) {
    //  Using a button makes sure it aligns properly with any other labels
    pointsLabel = document.createElement('button')
    pointsLabel.className =
      'points-label js-card-filter issue-card-label IssueLabel mt-1 ' +
      'v-align-middle css-truncate css-truncate-target'
    labels.insertBefore(pointsLabel, labels.firstChild)
  }

  return pointsLabel
}

function ensureColumnPointsLabelExists(column) {
  const columnHeader = document
    .getElementById(`column-${column.dataset.id}`)
    .querySelector('h4 .js-project-column-name').parentElement

  let pointsLabel = columnHeader.querySelector('.points-label')
  if (!pointsLabel) {
    pointsLabel = document.createElement('button')
    pointsLabel.className =
      'points-label points-label--title js-card-filter issue-card-label ' +
      'IssueLabel v-align-middle css-truncate css-truncate-target'
    columnHeader.appendChild(pointsLabel)
  }

  return pointsLabel
}

const columnObserver = new MutationObserver(mutations => {
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

const columns = document.querySelectorAll('.project-column')
columns.forEach(column =>
  columnObserver.observe(
    document.getElementById(`column-cards-${column.dataset.id}`),
    { childList: true }
  )
)

function ensureIssueDetailsPaneLabelExists(issueDetailsPane) {
  const issueHeader = issueDetailsPane.querySelector('a > span.js-issue-title')

  let pointsLabel = issueHeader.querySelector('.points-label')
  if (!pointsLabel) {
    pointsLabel = document.createElement('button')
    pointsLabel.className =
      'points-label points-label--title js-card-filter issue-card-label ' +
      'IssueLabel v-align-middle css-truncate css-truncate-target'
    issueHeader.parentNode.insertBefore(pointsLabel, issueHeader)
  }

  return pointsLabel
}

const issueDetailsPaneObserver = new MutationObserver(mutations => {
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

const issueDetailsPane = document.querySelector('.js-project-card-details')
issueDetailsPaneObserver.observe(issueDetailsPane, {
  childList: true,
  subtree: false
})
