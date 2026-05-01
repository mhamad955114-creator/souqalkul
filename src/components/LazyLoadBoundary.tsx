import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  retrying: boolean;
}

/**
 * Recovers from failed dynamic chunk loads (common on flaky mobile networks
 * or after a new deployment invalidates old chunk hashes).
 */
class LazyLoadBoundary extends Component<Props, State> {
  state: State = { hasError: false, retrying: false };

  static getDerivedStateFromError(error: Error): State {
    const msg = String(error?.message || error || "");
    const isChunkError =
      /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
        msg
      );
    return { hasError: true, retrying: isChunkError };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Lazy load error:", error, info);
  }

  componentDidUpdate(_prev: Props, prevState: State) {
    if (!prevState.hasError && this.state.hasError && this.state.retrying) {
      // Auto-recover from chunk load errors by reloading once
      const reloadKey = "__lazy_reload_attempt";
      const attempted = sessionStorage.getItem(reloadKey);
      if (!attempted) {
        sessionStorage.setItem(reloadKey, "1");
        setTimeout(() => window.location.reload(), 400);
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem("__lazy_reload_attempt");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-card">
              <h2 className="text-lg font-bold">تعذر تحميل الصفحة</h2>
              <p className="text-sm text-muted-foreground">
                تحقق من اتصالك بالإنترنت ثم أعد المحاولة.
              </p>
              <button
                onClick={this.handleReload}
                className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-semibold hover:opacity-90 transition-opacity"
              >
                إعادة التحميل
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default LazyLoadBoundary;
