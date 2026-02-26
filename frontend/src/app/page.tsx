import IdentifyDemo from "../components/identify-demo";

export default function HomePage() {
  return (
    <main>
      <div className="shell">
        <p className="kicker">BiteSpeed Demo</p>
        <h1>Identity Reconciliation Playground</h1>
        <p className="subtitle">
          Use this Next.js frontend to submit checkout contact details and visualize
          how your backend reconciles identity clusters.
        </p>
        <IdentifyDemo />
      </div>
    </main>
  );
}
