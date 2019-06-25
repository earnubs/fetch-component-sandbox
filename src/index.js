import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

// TODO { GET, POST, DELETE } ?

class Fetch extends React.Component {
  abortController = new window.AbortController();

  constructor(props) {
    super(props);

    // TODO retries

    this.state = {
      loading: false,
      error: false,
      data: null,
      status: null
    };
  }

  async componentDidMount() {
    const { resource, method = "GET", ...rest } = this.props;

    try {
      this.setState({ loading: true });
      const response = await fetch(resource, {
        signal: this.abortController.signal,
        method,
        ...rest
      });
      this.setState({ loading: false });

      if (response.ok) {
        // 2xx
        this.setState({ data: await response.json() });
      } else {
        const data = await response.json();

        this.setState({
          data,
          error: true,
          responseStatus: response.status
        });
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      // XXX maybe redundant considering following throw...
      this.setState({
        error: true,
        loading: false
      });

      // TODO log error

      throw err; // handle with ErrorBoundary
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  render() {
    if (
      this.props.badStatusHandler &&
      this.props.badStatusHandler[this.state.responseStatus]
    ) {
      return this.props.badStatusHandler[this.state.responseStatus];
    }

    return this.props.children({
      ...this.state
    });
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    //logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Fetch
          //resource="https://www.mocky.io/v2/5d10af1e30000060484ca14f" // 400
          resource="https://www.mocky.io/v2/5d113caf3100005f0008cc16" // 401
          //resource="https://www.mocky.io/v2/5d10adb2300000cd364ca13e" // 200
          badStatusHandler={{
            401: <div>Redirect/authenticate component...</div>
          }}
        >
          {({ loading, error, data }) => {
            if (loading) return <div>Loading...</div>;
            // example only, how you handle error messages is your business
            if (error) return <div>Error!</div>;
            /**
              return (
                <div>
                  We have errors:{" "}
                  {Object.keys(data).map(key => {
                    return (
                      <div key={key}>
                        {key}: {data[key].join(", ")}
                      </div>
                    );
                  })}
                </div>
              );
               */

            return data ? (
              data.map(trade => <div key={trade.id}>{trade.date_booked}</div>)
            ) : (
              <div>No data</div>
            );
          }}
        </Fetch>
      </ErrorBoundary>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
