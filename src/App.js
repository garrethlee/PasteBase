import './App.css';
import React, { useState } from 'react';
/*global chrome*/

function createUniqueId() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (var i = 0; i < 7; i++) result += chars[Math.floor(Math.random()*chars.length)]
  return result;
}

class OpenNew extends React.Component {

  handleClick() {
    document.querySelector('.overlay').style.display = "block";
  }
  render() {
    return(
      <button onClick={this.handleClick} title="Add a new entry" className="create" id='button'>+</button>
    );
  }
}

class CreateNew extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      title:"",
      content:"",
      id:createUniqueId(),
      error:""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleExit = this.handleExit.bind(this);
  }

  createNotification(){
    chrome.notifications.create({
      title:"PasteBase",
      message: `Copied: ${this.state.title}`,
      iconUrl: "/public/assets/32.png",
      type:"basic"
    })
  }

  handleChange(e){
    console.log(e.target.name);

    if (e.target.name === "title"){
      this.setState({title:e.target.value});
    }
    if (e.target.name === "content"){
      this.setState({content:e.target.value});
    }
  }

  handleExit(){
    this.setState({error:""});
    document.querySelector('.overlay').style.display='none';
  }
  
  handleSubmit(e) {
    let entries = JSON.parse(localStorage.getItem('lst'));
    if (this.state.title === "" || this.state.content === "") {
      this.setState({error:"Error: Please make sure all fields are filled"});
      e.preventDefault();
    }
    else {
      entries.push({
        title:this.state.title,
        content:this.state.content,
        id:this.state.id
      });
      localStorage.setItem('lst', JSON.stringify(entries));
      this.createNotification();
      this.handleExit();
    }
  }




  render() {
    return(
      <div>
        <form className="new-entry" onSubmit={this.handleSubmit}>
          <input type='text' autofocus name='title' id='search' placeholder='Enter Title...' onChange={this.handleChange}></input>
          <br/>
          <input type='text' name='content' id='search' placeholder='Enter Content...' onChange={this.handleChange}></input>
          <br/>
          <button id='button' type='submit'>Save</button>
          <p id='error-msg'>{this.state.error}</p>
        </form>
        <button id='exit' onClick={this.handleExit}>X</button>
      </div>
    );
  }
  
}

class Entry extends React.Component {

  constructor(props){
    super(props);
    this.state={
      readMore:true,
      deleted:false,
    }
    this.readMore = this.readMore.bind(this);
    this.empty = this.empty.bind(this);
  }

  copy(e){
    const copied = e.target.getAttribute('name');
    navigator.clipboard.writeText(copied);
    document.querySelector('.footer').style.visibility = 'visible';
    document.querySelector('.footer').style.opacity = 1;
  }

  empty(e){
    const idToRemove = e.target.getAttribute('name');
    const entries = JSON.parse(localStorage.getItem('lst'));
    console.log(entries);
    let index = -1;
    for (var i = 0; i < entries.length; i++){
      if (entries[i].id === idToRemove){
        index = i;
        break;
      }
    }
    this.setState({deleted:true});
    entries.splice(index, 1);
    localStorage.setItem('lst', JSON.stringify(entries));
  }

  readMore(){
    this.setState({readMore: !this.state.readMore});  
  }

  render() {
    if (!this.state.deleted){
    return (
      <div className='container' >
        <div id='text' onClick={this.copy}>
            <h3 className ='title' >{this.props.title}</h3>
            <p className ='content'>{this.state.readMore ? this.props.content.slice(0,20) : this.props.content}   {this.props.content.length > 20 ? <a href='#' id='readmore' onClick={this.readMore}>(...)</a> : ""} </p>
        </div>
        <div id='icons'>
            <button title="Copy text" id='button-link' onClick = {this.copy}><i name={this.props.content} id='icon' className ="fas fa-copy fa-lg"></i></button>
            <button title="Delete entry" id='button-link' onClick = {this.empty}><i id='icon' name={this.props.id} className ="fas fa-trash fa-lg"></i></button>
        </div>
      </div>
    );
  }
  return (null);
}
}




function App() {

  const [query, setQuery] = useState("");

  if (!localStorage.getItem('lst')) {
    localStorage.setItem('lst','[]');
  }

  let entries = JSON.parse(localStorage.getItem('lst'));

  console.log(entries);

  return (
    <div className="App">
      <div className="header">
      <input id='search' type='text' placeholder='Search...' onChange={(e) => setQuery(e.target.value)}></input><OpenNew className="button" />
      </div>
      <div className="overlay">
        <CreateNew className="button" />
      </div> 
      <div className="containers">
        {entries.filter(entry => (entry.title.toLowerCase().includes(query.toLowerCase()) || entry.content.toLowerCase().includes(query.toLowerCase()))).map((entry, key) => 
        <Entry title={entry.title} content={entry.content} id={entry.id} key={key} query={query} />)}
      </div>
      <div className = "footer">
        <strong>Copied!</strong>
        <button className='exit-footer' onClick={() => {
          document.querySelector('.footer').style.visibility = 'hidden';
          document.querySelector('.footer').style.opacity = 0;
          }}> x </button>
      </div>
    </div>
  );
}

export default App;