import React from 'react';
class Square extends React.Component {

  render() {
    const isLabel = this.props.isLabel;
    
    if(isLabel === "false"){
      return (
        <button className="square" onClick={() => console.log(this.props.position)}>
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