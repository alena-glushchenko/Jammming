import React from 'react';
import logo from './logo.svg';
import './App.css';

interface AppProps {
  color?: string
}

function App(props: AppProps) {
  const [color, setColor] = React.useState(props.color);

  React.useEffect(() => {
    setTimeout(() => {
      setColor("orange");
    }, 5000);
  }, []);

  React.useEffect(() => {
    if (color !== "green") {
      setTimeout(() => {
        setColor("yellow");
      }, 5000);
    }
  }, [color]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>
          Our color is {color}
        </p>
      </header>
    </div>
  );
}

export default App;
