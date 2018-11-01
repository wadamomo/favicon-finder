import React, { Component } from 'react';
import logo from './favicon-194x194.webp';
import './App.css';
import Favicon from './Favicon.jsx'

class App extends Component {
  constructor() {
    super()
    this.state = {
      search: "",
      url: "im a url",
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ search: e.target.value })
  }

  handleSubmit() {
    let url = this.stripUrl(this.state.search);

    fetch('http://localhost:3333/favicon', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ url })
    })
      .then(res => res.json())
      .then(data => {
        console.log('this is your favicon URL', data)
      })
      .catch(err => console.error(`Error in handleSubmit: ${err}`))
  }

  stripUrl(url) {
    let strippedUrl;
    if (
      url.includes('https://') ||
      url.includes('http://')
    ) strippedUrl = url;
    else strippedUrl = `https://${url}`;
    return strippedUrl;
  }

  render() {
    return (
      <div className="App">
        asdfasdfasdf
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div id="favicon">
            <input id="search" placeholder="Enter Search..." onChange={this.handleChange}></input>
            <button id="submit" onClick={this.handleSubmit}>Find Favicon</button>
            <Favicon url={this.state.url} />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
