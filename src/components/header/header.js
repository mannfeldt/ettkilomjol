import React, { Component } from 'react';
import './header.css';
import { Link } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import LoggedInIcon from '@material-ui/icons/PersonOutline';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PropTypes from 'prop-types';
import LoginIcon from '@material-ui/icons/LockOutlined';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import firebase from 'firebase/app';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Avatar from '@material-ui/core/Avatar';
import FavoriteIcon from '@material-ui/icons/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import SearchIcon from '@material-ui/icons/Search';
import { fire } from '../../base';
import headerImg from './header.jpg';

MyLoginComponent.propTypes = {
  logincall: PropTypes.func.isRequired,
  showLoginPage: PropTypes.bool.isRequired,
};
function MyLoginComponent({ logincall, showLoginPage }) {
  if (fire.auth().currentUser.isAnonymous) {
    return (
      <Button onClick={logincall} size="small" className="login-btn">
        <LoginIcon />
        {showLoginPage ? 'Avbryt' : 'Logga in'}
      </Button>
    );
  }
  if (fire.auth().currentUser.photoURL) {
    return (<Avatar className="appbar-login-avatar" src={fire.auth().currentUser.photoURL} alt="user avatar" tile="test" />);
  }
  return (
    <div>
      <LoggedInIcon className="toolbar-more-icon" />
      {' '}
      <span className="username-label">
        {' '}
        {fire.auth().currentUser.displayName}
      </span>
    </div>
  );
}

MenuItemList.propTypes = {
  onClose: PropTypes.func.isRequired,
  loginAction: PropTypes.func.isRequired,
  logoutAction: PropTypes.func.isRequired,
};
function MenuItemList({ onClose, loginAction, logoutAction }) {
  const items = [];
  const loggedIn = fire.auth().currentUser && !fire.auth().currentUser.isAnonymous;
  items.push(<Link key={items.length} className="hide-mobile" to="/"><MenuItem onClick={onClose}>Sök recept</MenuItem></Link>);
  if (loggedIn) {
    items.push(<Link key={items.length} className="hide-mobile" to="/favorites"><MenuItem onClick={onClose}>Mina favoriter</MenuItem></Link>);
    items.push(<Link key={items.length} className="hide-mobile" to="/grocerylists"><MenuItem onClick={onClose}>Mina inköpslistor</MenuItem></Link>);
  }
  items.push(<Link key={items.length} to="/stats"><MenuItem onClick={onClose}>Siffror</MenuItem></Link>);
  items.push(<Link key={items.length} className="hide-desktop" to="/faq"><MenuItem onClick={onClose}>FAQ</MenuItem></Link>);
  items.push(<MenuItem key={items.length} className="hide-desktop" onClick={() => { window.location.href = 'https://github.com/emilmannfeldt/ettkilomjol'; }}>Github</MenuItem>);
  items.push(<MenuItem key={items.length} className="hide-desktop" onClick={() => { window.location.href = 'https://www.linkedin.com/in/mannfeldt/'; }}>LinkedIn</MenuItem>);
  if (loggedIn) {
    items.push(<MenuItem key={items.length} onClick={logoutAction}>Logga ut</MenuItem>);
  } else {
    items.push(<MenuItem key={items.length} onClick={loginAction}>Logga in</MenuItem>);
  }
  return (
    <div className="header-menulist">
      {items}
    </div>
  );
}

class Header extends Component {
  uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => {
        this.setState({
          showLoginPage: false,
        });
        return false;
      },
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      showLoginPage: false,
      anchorEl: null,
    };
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  openMenu = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  logout(e) {
    e.preventDefault();
    this.setState({
      showLoginPage: false,
    });
    fire.auth().signOut();
  }

  login(e) {
    const { showLoginPage } = this.state;
    e.preventDefault();
    this.setState({
      showLoginPage: !showLoginPage,
    });
  }


  handleClose() {
    this.setState({
      anchorEl: null,
    });
  }


  render() {
    const { showLoginPage, anchorEl } = this.state;
    let backgroundImage = (
      <div className="headerImageContainer">
        <img src={headerImg} id="headerimage" alt="bakgrundsbild" />
      </div>
    );
    if (window.location.href.endsWith('/stats')) {
      backgroundImage = null;
    }
    let titleText = 'Ett Kilo Mjöl';
    if (fire.options.projectId === 'ettkilomjol-dev') {
      titleText = 'Ett Kilo Mjöl DEV';
    }
    const route = window.location.href.substr(window.location.href.indexOf('/#/') + 2);

    return (
      <div id="header">
        {backgroundImage}
        <AppBar position="fixed">
          <Toolbar className="toolbar">
            <div className="appbar-container--left">
              <Link className="appbar-title text-big" to="/">
                {titleText}
              </Link>
              <span className="hide-mobile">
                <Link to="/">
                  <Button className={route === '/' ? 'appbar-nav-button selected-route' : 'appbar-nav-button'}>
                    <SearchIcon />
                    Sök recept
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button className={route === '/favorites' ? 'appbar-nav-button selected-route' : 'appbar-nav-button'}>
                    <FavoriteIcon />
                    Favoriter
                  </Button>
                </Link>
                <Link to="/grocerylists">
                  <Button className={route === '/grocerylists' ? 'appbar-nav-button selected-route' : 'appbar-nav-button'}>
                    <ShoppingCartOutlinedIcon />
                    Inköpslistor
                  </Button>
                </Link>
              </span>
            </div>
            <div className="appbar-container--right">
              <MyLoginComponent logincall={this.login} showLoginPage={showLoginPage} />
              <IconButton onClick={this.openMenu}>
                <MoreVertIcon />
              </IconButton>
              <Menu open={!!anchorEl} onClose={this.handleClose} anchorEl={anchorEl}>
                <MenuItemList logoutAction={this.logout} loginAction={this.login} onClose={this.handleClose} />
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        {
          showLoginPage ? (
            <div className="login-form">
              <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={fire.auth()} />
            </div>
          ) : (null)
        }
      </div>
    );
  }
}
export default Header;
