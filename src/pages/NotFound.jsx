import PageTransition from '../components/PageTransition'
import EmptyState from '../components/EmptyState'

export default function NotFound() {
  return <PageTransition><div className="container-page py-20"><EmptyState emoji="🍕" title="404 — Page not found" message="Looks like this page slipped off the plate." actionLabel="Back to home" /></div></PageTransition>
}
