import React, { Component } from 'react';
import './grocerylist.css'
import GrocerylistCard from './grocerylistCard';
import TextField from '@material-ui/core/TextField';
import GrocerylistDetails from './grocerylistDetails';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import { fire } from '../../../base';
import Utils from '../../../util';



class MyGrocerylists extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentList: null,
            showNewListDialog: false,
            newName: '',
            showCreatingProgress: false,
            errorText: '',
            listToDelete: null,
        };
        this.setCurrentList = this.setCurrentList.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.createList = this.createList.bind(this);
        this.validateName = this.validateName.bind(this);
        this.deleteList = this.deleteList.bind(this);
        this.resetCurrentList = this.resetCurrentList.bind(this);
        this.undoDeletion = this.undoDeletion.bind(this);


    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };
    setCurrentList(list) {
        this.setState({
            currentList: list
        })
    }
    deleteList(list) {
        this.setState({
            listToDelete: list,
        });
        let deletetion = {};
        deletetion[list.name] = null;
        let that = this;
        fire.database().ref('users/' + fire.auth().currentUser.uid + '/grocerylists').update(deletetion, function (error) {
            if (error) {
                console.log('Error has occured during saving process');
            }
            else {
                console.log("Data hss been dleted succesfully");
                that.props.setSnackbar('grocerylist_delete', that.undoDeletion);

            }
        })

    }
    resetCurrentList() {
        this.setState({
            currentList: null
        });
    }
    getError() {
        return this.state.errorText;
    }
    openDialog() {
        if (fire.auth().currentUser.isAnonymous) {
            this.props.setSnackbar('login_required');
        } else {

            let newName = 'Att handla ' + Utils.getDayAndMonthString(new Date());
            for (let i = 0; i < this.props.grocerylists.length; i++) {
                if (newName === this.props.grocerylists[i].name) {
                    newName = "";
                }
            }

            this.setState({
                showNewListDialog: true,
                newName: newName
            })
        }
    }
    closeDialog = () => {
        this.setState({
            showNewListDialog: false,
            newName: '',
            errorText: '',
        });
    };
    validateName(name) {
        if (name.trim().length < 1) {
            this.setState({
                errorText: 'Namnet måste vara minst 1 tecken',
            });
            return false;
        }
        if (name.trim().length > 64) {
            this.setState({
                errorText: 'Namnet får max vara 64 tecken',
            });
            return false;
        }
        for (let i = 0; i < this.props.grocerylists.length; i++) {
            if (name === this.props.grocerylists[i].name) {
                this.setState({
                    errorText: 'Du har redan en inköpslista med det namnet',
                });
                return false;
            }
        }
        return true;
    }
    createList() {
        let grocerylist = {
            name: this.state.newName,
            created: Date.now(),
        };
        if (!this.validateName(grocerylist.name)) {
            return;
        }

        let that = this;
        fire.database().ref('users/' + fire.auth().currentUser.uid + '/grocerylists/' + grocerylist.name).set(grocerylist, function (error) {
            if (error) {
                console.log('Error has occured during saving process');
                that.setState({
                    errorText: 'Error: ' + error,
                });
            }
            else {
                console.log("Data hss been saved succesfully");
                that.setState({
                    showCreatingProgress: false,
                    showNewListDialog: false,
                    currentList: grocerylist,
                    errorText: '',
                });



            }
        })
    }

    undoDeletion() {
        console.log("UNDO DELTET")
        fire.database().ref('users/' + fire.auth().currentUser.uid + '/grocerylists/' + this.state.listToDelete.name).set(this.state.listToDelete);
    }

    render() {

        if (this.state.currentList) {
            let activeGrocerylist = {};
            if (this.state.currentList) {
                for (let i = 0; i < this.props.grocerylists.length; i++) {
                    let tmp = this.props.grocerylists[i];
                    if (tmp.name === this.state.currentList.name) {
                        activeGrocerylist = this.props.grocerylists[i];
                    }
                }
            }
            return (<div className="container my_recipes-container">
                <div className="row">
                    <div className="col-xs-12">
                        <GrocerylistDetails return={this.resetCurrentList} grocerylist={activeGrocerylist} foods={this.props.foods} units={this.props.units} recipes={this.props.recipes} />
                    </div>
                </div>
            </div>);
        } else {
            return (<div className="container my_recipes-container">
                <div className="row">
                    <div className="col-xs-12">
                        <h2>Mina inköpslistor</h2>
                        <Button onClick={this.openDialog} color="primary" variant="contained">Ny lista</Button>

                    </div>
                    {this.props.grocerylists.map((grocerylist, index) =>
                        <GrocerylistCard key={grocerylist.name} ref="child" setCurrentList={this.setCurrentList}
                            grocerylist={grocerylist} transitionDelay={index} setSnackbar={this.props.setSnackbar} deleteList={this.deleteList} />
                    )}
                </div>
                <Dialog
                    open={this.state.showNewListDialog}
                    onClose={this.props.closeDialog}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="simple-dialog-title">Ny inköpslista</DialogTitle>
                    <DialogContent className="dialog-content">
                        <DialogContentText>
                            {this.state.helptext}
                        </DialogContentText>
                        <TextField className="contact-field"
                            label="Namn"
                            name="name"
                            value={this.state.newName}
                            onChange={this.handleChange('newName')}
                            margin="normal"
                        />
                        <DialogContentText>
                            {this.getError()}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDialog} color="secondary" variant="contained">stäng</Button>
                        <Button onClick={this.createList} color="primary" variant="contained">skapa</Button>
                    </DialogActions>
                </Dialog>
            </div>);
        }
    }
}
export default MyGrocerylists;