import { columnObserver } from './observers'

const columns = document.querySelectorAll('.project-column')
columns.forEach(column =>
  columnObserver.observe(
    document.getElementById(`column-cards-${column.dataset.id}`),
    { childList: true }
  )
)
