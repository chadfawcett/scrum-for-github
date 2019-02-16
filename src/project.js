import { columnObserver, issueDetailsPaneObserver } from './observers'

const columns = document.querySelectorAll('.project-column')
columns.forEach(column =>
  columnObserver.observe(
    document.getElementById(`column-cards-${column.dataset.id}`),
    { childList: true }
  )
)

const issueDetailsPane = document.querySelector('.js-project-card-details')
issueDetailsPaneObserver.observe(issueDetailsPane, {
  childList: true,
  subtree: false
})
