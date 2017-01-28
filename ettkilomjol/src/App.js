import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import searchbar from './searchbar'
import * as firebase from 'firebase';
import injectTapEventPlugin from 'react-tap-event-plugin';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import Snackbar from 'material-ui/Snackbar';
import Chip from 'material-ui/Chip';






// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


  let config = {
    apiKey: "AIzaSyCgKVqOu_D9jemhDwm5PC3Tll50T15OOlM",
    authDomain: "ettkilomjol-10ed1.firebaseapp.com",
    databaseURL: "https://ettkilomjol-10ed1.firebaseio.com",
    storageBucket: "ettkilomjol-10ed1.appspot.com",
    messagingSenderId: "1028199106361"
  };
  firebase.initializeApp(config);

let foodBase = {};
let foods = [];

let createUser = function(email, password){
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage + errorCode + email + password);
      // ...
  });
}

let signIn = function(email, password) {
  firebase.auth.EmailAuthProvider.credential(email, password);
};

let signOut = function() {
  // Sign out of Firebase.
  firebase.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("welcome" + user);
    foodBase = firebase.database().ref("foods");
foodBase.orderByChild("uses").on("child_added", function(snapshot) {
  console.log(snapshot.key + " was " + snapshot.val().uses + " uses");
  foods.splice(0, 0, snapshot.val().name);
});
    // User is signed in.
  } else {
    // No user is signed in.
        console.log("bye" + user);
  }
});



class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      snackBarOpen: false,
      snackBarText: 'this is a snackbar',
      searchText: '',
      searchChips: ['test'],
    };
  }
 showSnackBar = (snack) => {
    this.setState({
      snackBarOpen: true,
      snackBarText: snack
    });
  }

  handleRequestClose = () => {
    this.setState({
      snackBarOpen: false,
    });
  }

 signInEmail(event) {
   event.preventDefault();
   let email =this.refs.email.value;
   let password = this.refs.password.value;
  firebase.auth.EmailAuthProvider.credential(email, password);
   // showSnackBar('signed in!');

}

  createUser(event){
        event.preventDefault();
    console.log(this);
    let email =this.refs.email.value;
    let password = this.refs.password.value;
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      //showSnackBar(errorMessage);
      console.log(errorMessage + errorCode + email + password);
      // ...
  });
  //('user created!');
}

  handleUpdateInput = (searchText) => {
    this.setState({
      searchText: searchText,
    });
  };

  handleNewRequest = (searchText) => {
    let foundFood = false;
   for (var i=foods.length-1; i>=0; i--) {
    if (foods[i] === searchText) {
        foods.splice(i, 1);
        foundFood=true;
    }
  }
  if(!foundFood){
        this.setState({
      searchText: ''     
    });
        //visa snackbar att det inte finns en sådan ingrediens
    return;
  }
   this.chipData = this.state.searchChips;
    this.chipData.push(searchText);

    this.setState({
      searchText: '',
      searchChips: this.chipData
    });
  };


  handleRequestDelete = (key) => {
    this.chipData = this.state.searchChips;
    for (var i=this.chipData.length-1; i>=0; i--) {
    if (this.chipData[i] === key) {
        this.chipData.splice(i, 1);
    }
  }
  foods.push(key);
    this.setState({chipData: this.chipData});
  };


  renderChip(food) {
    return (<Chip
        key={food}
        onRequestDelete={() => this.handleRequestDelete(food)}
      >
        {food}
      </Chip>
    );
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
                {this.state.searchChips.map(this.renderChip, this)}

        <AutoComplete
          searchText={this.state.searchText}
          floatingLabelText="sök ingredienser"
          filter={AutoComplete.fuzzyFilter}
          onUpdateInput={this.handleUpdateInput}
          dataSource={foods}
          onNewRequest={this.handleNewRequest}
          maxSearchResults={5}
        />
        <form onSubmit={this.signInEmail.bind(this)}>
          <input type="email" placeholder="Email" ref="email"/>
          <input type="password" placeholder="Password" ref="password"/>
          <RaisedButton label="Sign in" primary={true} type="submit"/>
          <RaisedButton label="Create user" onTouchTap={this.createUser.bind(this)}/>

        </form>
        <Snackbar
          open={this.state.snackBarOpen}
          message={this.state.snackBarText}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}



export default App;
