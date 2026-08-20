import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught BioComposable React Error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full bg-[#18181B] border border-[#EF4444]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 my-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-base font-bold text-[#FAFAFA]">Application Component Error</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              BioComposable caught a visual rendering error. The full-stack backend engine remains operational.
            </p>
          </div>
          {this.state.error && (
            <pre className="bg-[#09090B] border border-[#27272A] text-[#EF4444] text-[10px] font-mono p-3 rounded-xl max-w-lg overflow-x-auto text-left">
              <code>{this.state.error.message}</code>
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#22D3EE]" />
            Reload Component Engine
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
