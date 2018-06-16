import React, { Component } from 'react';
import './ingredientProgress.css';
import IconButton from 'material-ui/IconButton';
import ShoppingBasketIcon from 'material-ui/svg-icons/action/shopping-basket';
import LinearProgress from 'material-ui/LinearProgress';
import FlatButton from 'material-ui/FlatButton';


class IngredientProgress extends Component {
  constructor(props) {
    super(props);
  }

  handleTouchTap = (event) => {
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    //här måste vi ändra så att dubbletter av ingredient namn inte räjnas dubbel träff
    let progress = this.props.matchedIngredients.length / (this.props.matchedIngredients.length + this.props.missingIngredients.length) * 100;
    return (<div>
<LinearProgress mode="determinate" value={progress} onClick={this.props.toggleIngredientlist}/>
<FlatButton onClick={this.props.toggleIngredientlist}
            target="_blank"
            label="Se ingredienser"
            className="recipecard-expand-btn"
            primary={true}
            icon={<ShoppingBasketIcon/>}
          />
    </div>);
  }
}
export default IngredientProgress;