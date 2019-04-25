import React, { Component } from "react";

class App extends Component {
  state = {
    food_name: "",
    calories: 0,
    entries: [{ food_name: "Acarajé", calories: 300 }],
    calorie_limit: 1800
  };

  logCalories = e => {
    e.preventDefault();
    const { food_name, calories } = this.state;
    this.setState({
      entries: [...this.state.entries, { food_name, calories }],
      food_name: "",
      calories: 0
    });
  };

  caloriesLeft = () => {
    const totalEntered = this.state.entries.reduce(
      (a, b) => +a + +b.calories,
      0
    );
    return this.state.calorie_limit - totalEntered;
  };

  deleteEntry = entry => {
    console.log(entry);
    const new_entries = this.state.entries.filter(
      item => item.food_name !== entry.food_name
    );
    this.setState({ entries: new_entries });
  };

  render() {
    return (
      <div className="App">
        <nav>
          <div className="nav-wrapper">
            <a href="/" className="brand-logo">
              Awesome Calorie Tracker
            </a>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li>
                <a href="/">Logout</a>
              </li>
            </ul>
          </div>
        </nav>
        <div className="container">
          <div className="row">
            <form key="form" className="col s10">
              <div className="input-field col s4">
                <i className="material-icons prefix">fastfood</i>
                <input
                  id="food_name"
                  type="text"
                  className="validate"
                  value={this.state.food_name}
                  onChange={e => this.setState({ food_name: e.target.value })}
                />
                <label htmlFor="food_name">Food Name</label>
              </div>
              <div className="input-field col s4">
                <i className="material-icons prefix">equalizer</i>
                <input
                  id="calories"
                  type="text"
                  className="validate"
                  value={this.state.calories}
                  onChange={e => this.setState({ calories: e.target.value })}
                />
                <label htmlFor="calories">Calories</label>
              </div>
              <a
                href="/"
                className="btn-floating btn-large waves-effect waves-light"
                onClick={this.logCalories}
              >
                <i className="material-icons">add</i>
              </a>
            </form>
          </div>
          <div className="row">
            <ul className="collection with-header col s6 hoverable">
              <li className="collection-header">
                <h4>Today</h4>
              </li>
              {this.state.entries.map(entry => {
                return (
                  <li key={entry.food_name} className="collection-item">
                    <div>
                      {entry.food_name} - {entry.calories} Calories
                      <a
                        href="#!"
                        className="secondary-content"
                        onClick={() => this.deleteEntry(entry)}
                      >
                        <i className="material-icons">delete</i>
                      </a>
                    </div>
                  </li>
                );
              })}
              <li className="collection-header">
                <h6>
                  You have {this.caloriesLeft()} calories left for the day!
                </h6>
                * You have set your daily calorie limit to{" "}
                {this.state.calorie_limit}
                <a
                  href="#!"
                  onClick={() => this.setState({ limit_edit: true })}
                >
                  {" "}
                  edit{" "}
                </a>
              </li>
              {this.state.limit_edit && (
                <li className="collection-header">
                  <div className="input-field">
                    <input
                      id="calorie_limit"
                      type="text"
                      className="validate"
                      value={this.state.calorie_limit}
                      onChange={e =>
                        this.setState({ calorie_limit: e.target.value })
                      }
                    />
                    <button
                      onClick={() => this.setState({ limit_edit: false })}
                    >
                      Done
                    </button>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
