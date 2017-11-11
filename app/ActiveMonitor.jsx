import React from 'react';
import { connect } from 'react-redux';

import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';

class ActiveMonitor extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      hasError: false
    }

  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }


  render() {

    const monitorId = parseInt(this.props.activeMonitorId, 10);
    const isInitialized = monitorId != 0;

    if( !isInitialized ) {

        return (<h1>Welcome to Electra Monitor</h1>);

    } else {

        return (<Tabs>
                  <Tab label='Status'>
                    <h3>Healthy</h3>
                  </Tab>
                  <Tab label='Settings'>
                    <strong>{this.props.activeMonitorId}</strong>
                    <TextField hintText={this.props.monitors[monitorId-1].folder}/>
                  </Tab>
                </Tabs>
              );
    }
  }

};

const mapStateToProps = state => {

  return {
    activeMonitorId: (state) ? state.activeMonitorId : 0,
    monitors: (state) ? state.monitors : []
  };
};

export default connect(mapStateToProps)(ActiveMonitor);
