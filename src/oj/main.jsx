import { createRoot } from 'react-dom/client'
import OjApp from './OjApp'

const root = document.getElementById('oj-root')
if (root) {
  createRoot(root).render(<OjApp />)
}
