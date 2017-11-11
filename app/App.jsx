// @flow
import React from 'react';
import ReactDom from "react-dom";

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import AppBar from "material-ui/AppBar";
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import Header from './Header.jsx';
import MonitorsList from './MonitorsList.jsx';
import ActiveMonitor from "./ActiveMonitor.jsx";

import electron from 'electron';
const ipcRenderer = electron.ipcRenderer;
//const remote = electron.remote;

const style = {
  marginRight: 20,
};

class App extends React.Component {

  constructor() {
    super();

  }

  componentDidCatch(error, info) {
    // Display fallback UI
    //this.setState({ hasError: true });

    console.error(error);
  }


  fabClick = (event: object) => {

    ipcRenderer.send('async-message', 'FAB');

    //event.preventDefault()
  }

  render() {
    return (
            <MuiThemeProvider>
              <span>
                <AppBar title='Electra' iconClassNameRight='muidocs-icon-navigation-expand-more' />
                <GridList>
                  <Subheader>Monitored Projects</Subheader>
                  <MonitorsList />
                  <ActiveMonitor />
                </GridList>
                <FloatingActionButton onClick={this.fabClick} style={style}>
                    <ContentAdd />
                </FloatingActionButton>
              </span>
            </MuiThemeProvider>
            );
  }

};

export default App;
