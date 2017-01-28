import React, { Component } from 'react';
import Autocomplete from 'react-toolbox/lib/autocomplete';

const countriesArray = ['Spain', 'England', 'USA', 'Thailand', 'Tongo', 'Slovenia'];

const countriesObject = {'ES-es': 'Spain', 'TH-th': 'Thailand', 'EN-gb': 'England', 'EN-en': 'USA'};

 class searchbar extends React.Component {
  state = {
    simple: 'Spain',
    multiple: ['ES-es', 'TH-th']
  };

  handleSimpleChange = (value) => {
    this.setState({simple: value});
  };

  handleMultipleChange = (value) => {
    this.setState({multiple: value});
  };

  render () {
    return (
      <div>
        <Autocomplete
          direction="down"
          onChange={this.handleMultipleChange}
          label="Choose countries"
          source={countriesObject}
          value={this.state.multiple}
        />

        <Autocomplete
          direction="down"
          label="Choose a country"
          hint="You can only choose one..."
          multiple={false}
          onChange={this.handleSimpleChange}
          source={countriesArray}
          value={this.state.simple}
        />
      </div>
    );
  }
}
export default searchbar;
