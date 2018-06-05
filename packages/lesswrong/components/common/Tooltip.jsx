import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component } from 'react';

class Tooltip extends Component {

  constructor() {
    super();
  }

  render () {
    const { children, tooltip } = this.props
    return (
      <span className="lw-tooltip-wrapper"
        onMouseOver={this.handleHoverOver}
        onMouseLeave={this.handleHoverExit}
      >
        { children }
        <div className="lw-tooltip">
          { tooltip }
        </div>
      </span>
    )
  }
}

registerComponent('Tooltip', Tooltip);
