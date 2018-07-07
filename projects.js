function ensureIssueCardLabelsExist(issueCard) {
  let labels = issueCard.querySelector('.labels')
  if (!labels) {
    labels = document.createElement('span')
    labels.className = 'labels d-block pb-1 pr-6'
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

function updateIssueCardPoints(issueCard, issuePoints) {
  const pointsLabel = ensureIssueCardLabelsExist(issueCard)
  pointsLabel.innerText = issuePoints
}

function updateColumnPoints(column, columnPoints) {
  const pointsLabel = ensureColumnPointsLabelExists(column)
  pointsLabel.innerText = columnPoints
}

const columns = document.querySelectorAll('.project-column')

const columnObserver = new MutationObserver(mutations => {
  mutations.forEach(async ({ addedNodes, target: column }) => {
    if (addedNodes.length) {
      //  Note these are organized by the actual issue ids and not issue-card ids
      const issueCards = Array.from(column.querySelectorAll('.issue-card'))
      const issueIds = issueCards.map(i => i.dataset.contentId)
      const issuePointsById = await browser.storage.sync.get(issueIds)

      //  Update each card points value, and calculate column total
      const columnPoints = issueCards
        .map(issueCard => {
          const issuePoints = issuePointsById[issueCard.dataset.contentId]

          if (!issuePoints) return 0

          updateIssueCardPoints(issueCard, issuePoints)

          return issuePoints
        })
        .reduce((acc, val) => acc + val)

      updateColumnPoints(column, columnPoints)
    }
  })
})

columns.forEach(column =>
  columnObserver.observe(
    document.getElementById(`column-cards-${column.dataset.id}`),
    { childList: true }
  )
)
