import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-mist p-6">
        <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <h1 className="text-xl font-bold text-ink">Smart School Manager</h1>
          <p className="mt-2 text-sm text-slate-600">
            The app could not load this page. Refresh the browser, or sign in again from the login page.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-white">
            {this.state.error.message}
          </pre>
          <a
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-school-blue px-4 text-sm font-semibold text-white"
            href="/login"
          >
            Open login
          </a>
        </section>
      </main>
    );
  }
}
