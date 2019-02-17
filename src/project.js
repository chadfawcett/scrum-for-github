import { updateEstimate } from './fetchIssues'
import { columnObserver, issueDetailsPaneObserver } from './observers'

const columns = document.querySelectorAll('.project-column')
columns.forEach(column =>
  columnObserver.observe(
    document.getElementById(`column-cards-${column.dataset.id}`),
    { childList: true }
  )
)

const issueDetailsPane = document.querySelector('.js-project-card-details')
issueDetailsPaneObserver.observe(issueDetailsPane, { childList: true })

issueDetailsPane.addEventListener('focusout', async e => {
  if (e.target.id === 'sidebar-points-label') {
    updateEstimate(e.target.dataset.issueId, e.target.value)
  }
})
