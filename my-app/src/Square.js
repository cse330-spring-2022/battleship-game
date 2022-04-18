import React from 'react';
class Square extends React.Component {

  render() {
    const isLabel = this.props.isLabel;
    
    if(isLabel == "false"){
      return (
        <button className="square">
          {this.props.value}
        </button>
      );
    }
    else {
      return (
        <div className="label">
          {this.props.value}
        </div>
      );
    }
  }
}

export default Square;