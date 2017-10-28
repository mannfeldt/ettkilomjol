import React, { Component } from 'react';
import './time.css';
import TimerIcon from 'material-ui/svg-icons/image/timer';

class Time extends Component {
    constructor(props) {
        super(props);
    }

    timeString() {
        //let hours = Math.floor(this.props.time / 60)
        //let minutes = this.props.time % 60;
        //if (hours > 0) {
        //    return hours + " h " + minutes + " m";
        //}
        //else {
        //    return minutes + " m";
        //}
        //}

    }
    render() {
        function clockTime(props) {
            if (props.time) {
                return <div><TimerIcon /> {props.time}</div>
            }
            else {
                return <div>test</div>
            }
        }

        return (

            <div className={this.props.time ? '' : 'hidden'}> <TimerIcon /> { this.props.time } </div>

        );
    }
}
export default Time;
