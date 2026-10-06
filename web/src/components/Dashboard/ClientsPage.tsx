import { useClients } from "../../api/useClients";
import { ClientsDashboard } from "./ClientsDashboard";
import styles from "./Dashboard.module.css";

export function ClientsPage() {
  const { state, retry } = useClients();

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Clients</h1>
      {state.status === "loading" && (
        <div role="status" aria-live="polite" className={styles.loading}>
          <span className="sr-only">Loading clients…</span>
          <div className={styles.skeletonChart} aria-hidden="true" />
          <div className={styles.skeletonTable} aria-hidden="true" />
        </div>
      )}
      {state.status === "error" && (
        <div role="alert" className={styles.error}>
          <p>We couldn’t load the client data. {state.error.message}</p>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      )}
      {state.status === "success" && <ClientsDashboard data={state.data} />}
    </main>
  );
}
