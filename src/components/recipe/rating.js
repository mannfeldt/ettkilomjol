import React, { Component } from 'react';
import StarRatings from 'react-star-ratings';

class Rating extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.value !== this.props.value) {
            return true;
        }
        if (nextProps.votes !== this.props.votes) {
            return true;
        }
        return false;
    }
    render() {
        let votes = "";
        if (this.props.votes > 1) {
            votes = this.props.votes + " röster";
        } else if (this.props.votes > 0) {
            votes = "1 röst";
        }
        return (
            <div>
                <div className="rating-wrapper">
                    <StarRatings
                        rating={Number(this.props.value)}
                        starDimension="1rem"
                        starSpacing ="2px"
                        starRatedColor="#3f51b5"
                        starEmptyColor="rgb(201, 206, 234)"
                    />
                </div>
                <div className="rating-votes">{votes}</div>
            </div>
        );
    }
}
export default Rating;