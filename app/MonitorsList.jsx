// @flow weak

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles, createStyleSheet } from 'material-ui/styles';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import FileFolder from 'material-ui/svg-icons/file/folder';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Avatar from 'material-ui/Avatar';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';

const styleSheet = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    background: theme.palette.background.paper,
  }
});

class MonitorsList extends React.Component {

  constructor(props) {
    super(props);

    const { classes } = props;

    //console.log(props);
  }

  componentWillUpdate(nextProps, nextState) {
    if( nextProps.lastSubscription === '' ) {
      return false;
    } else {
        this.props.monitors.forEach( (monitor, index) => {
          if( monitor.subscriptionName === nextProps.lastSubscription )
              this.props.monitors[index].notifications++;
        });

        return true;
    }
  }

  onClickProject = (event: object) => {
    console.log(event.currentTarget.dataset.id);

    this.props.dispatch({
      type: 'ACTIVE_MONITOR',
      data: event.currentTarget.dataset.id
    });
  }

  render() {
    return (<div>
              <List>
                {this.props.monitors.map( (monitor, index) => {
                    return <ListItem primaryText={monitor.name}
                                     leftAvatar={<Avatar icon={<FileFolder />} />}
                                     data-id={monitor.id}
                                     key={index}
                                     onClick={this.onClickProject}>
                                     <Badge badgeContent={monitor.notifications}
                                            secondary={true}>
                                       <IconButton tooltip="Notifications">
                                         <NotificationsIcon />
                                       </IconButton>
                                     </Badge>
                           </ListItem>
                })}
            </List>
          </div>);
  }

};

// ProjectList.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

const mapStateToProps = state => {

  return {
    monitors: (state) ? state.monitors : '',
    lastSubscription: state.lastSubscription,
    lastSubscriptionTime: state.lastSubscriptionTime
  };
};

//var StyledList = withStyles(styleSheet)(MonitorsList);
export default connect(mapStateToProps)(MonitorsList);
