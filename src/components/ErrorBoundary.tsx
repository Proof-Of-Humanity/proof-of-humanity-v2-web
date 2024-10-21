import { Component } from 'react';

interface ErrorBoundaryInterface {
  fallback: React.ReactNode;
  children: React.ReactNode;
  resetSwitch?: any;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryInterface, ErrorBoundaryState> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryInterface, prevState: ErrorBoundaryState) {
    const { error } = this.state;
    const { resetSwitch } = this.props;

    if (error !== null && prevState.error !== null && prevProps.resetSwitch !== resetSwitch) {
      this.setState({ error: null });
    }
  }

  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
