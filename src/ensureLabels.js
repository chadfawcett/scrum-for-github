export function ensureIssueCardLabelsExist(issueCard) {
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

export function ensureColumnPointsLabelExists(column) {
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

export function ensureIssueDetailsPaneLabelExists(issueDetailsPane, issueId) {
  const sidebarLabels = issueDetailsPane.querySelector(
    '.discussion-sidebar-item.sidebar-labels'
  )
  //  If there are no labels, the sidebar hasn't finished loading
  if (!sidebarLabels) return

  let sidebarPoints = issueDetailsPane.querySelector(
    '.discussion-sidebar-item.sidebar-points'
  )
  if (!sidebarPoints) {
    sidebarPoints = document.createElement('div')
    sidebarPoints.className = sidebarLabels.className
    sidebarPoints.classList.replace('sidebar-labels', 'sidebar-points')

    sidebarPoints.innerHTML = `
      <summary class="text-bold discussion-sidebar-heading">
        Points
      </summary>
      <span class="css-truncate js-issue-assignees">
        Estimate: <input type="number" id="sidebar-points-label" data-issue-id="${issueId}">
      </span>
    `
    sidebarLabels.parentNode.insertBefore(
      sidebarPoints,
      sidebarLabels.nextSibling
    )
  }

  const pointsLabel = sidebarPoints.querySelector('#sidebar-points-label')

  return pointsLabel
}
