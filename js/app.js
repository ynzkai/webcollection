//----------------------------------------------------------
var Portal = React.createClass({
  getDefaultProps: function() {
    return {};
  },
  getInitialState: function() {
    return {
             addClicked: false,
             editMode: false,
             showEditBox: false,
             selCategory: 1,
             item: null,
             links: [],
             categories: []
           };
  },
  componentDidMount: function() {
    this.serverRequest = $.get('getdata.php', function (result) {
	  this.setState({
        links: result.links, 
        categories: result.categories
	  });
    }.bind(this));
  },
  componentWillUnmount: function() {
    this.serverRequest.abort();
  },
  handleChange: function(id) {
    this.setState({selCategory: id});
  },
  handleAddButtonClick: function() {
    this.setState({addClicked: true});
  },
  handleEditButtonClick: function() {
    this.setState({editMode: !this.state.editMode});
  },
  handleClosePop: function() {
    this.setState({addClicked: false, showEditBox: false});
  },
  handleShowEdit: function(item) {
    this.setState({showEditBox: true, item: item});
  },
  handleDeleteLink: function(item) {
	var i;
    for(i=0; i<this.state.links.length; i++) {
      if(item.id == this.state.links[i].id) {
        this.state.links.splice(i,1);

		// do something on server...
		/* why $.ajax can't pass data to server?!
		$.ajax({
		  url: 'postdata.php',
		  type: 'POST',
		  ///////////////////
		  dataType: 'json',
		  data: {id: item.id},
		  ///////////////////
		  contentType: "application/json; charset=utf-8",
		  cache: false,
		  success: function(data) {
			this.setState({links: data});
		  }.bind(this),
		  error: function(xhr, status, err) {
			//console.error(this.props.url, status, err.toString());
			alert(err.toString());
		  }.bind(this)
		});
		*/
		$.post('postdata.php', {flag: "DEL", id: item.id}, 
          function(data){
			this.setState({links: data});
        }.bind(this), 'json').fail(function() {
			alert('delete link error');
		});
        break;
      }
    }
  },
  handleAddOrEditLink: function(item) {
    var i, isNewRecord = true;
    var length = this.state.links.length;
    for(i=0; i<length; i++) {
      if(item.id == this.state.links[i].id) {
        this.state.links[i] = item;
        isNewRecord = false;
        // do something on server...
		$.post('postdata.php', {flag: "EDIT", id: item.id, cid: item.cid, name: item.name, link: item.link}, 
          function(data){
			this.setState({links: data});
        }.bind(this), 'json').fail(function() {
			alert('edit link error');
		});

        break;
      }
    }
    if(isNewRecord) {
      item.id = length + 1;
      this.state.links.unshift(item);
      // do something on server...
	  console.log(item);
	  $.post('postdata.php', {flag: "ADD", cid: item.cid, name: item.name, link: item.link}, 
        function(data){
	  	this.setState({links: data});
      }.bind(this), 'json').fail(function() {
	  	alert('edit link error');
	  });

    }
    this.setState({addClicked: false, showEditBox: false});
  },
  render: function() {
    var activeEditButtonColor;
    if(this.state.editMode) {
      activeEditButtonColor = "#66b";
    }

    var addClicked = null;
    if(this.state.addClicked) {
      addClicked = <ItemForm handleAddOrEditLink={this.handleAddOrEditLink} item={{cid:0, name:"", link:""}} categories={this.state.categories} handleClosePop={this.handleClosePop}/>;
    }

    var showEditBox = null;
    if(this.state.showEditBox) {
      showEditBox = <ItemForm handleAddOrEditLink={this.handleAddOrEditLink} item={this.state.item} categories={this.state.categories} handleClosePop={this.handleClosePop} />;
    }

    return <div className="portal">
             <div className="sidebar">
               <Catalog categories={this.state.categories} selCategory={this.state.selCategory} handleChange={this.handleChange} />
               <div className="buttons">
                 <span onClick={this.handleAddButtonClick} title="Title">+</span>
                 <span onClick={this.handleEditButtonClick} title="Edit" style={{color: activeEditButtonColor}}>=</span>
               </div>
               <div className="foot">
                 <p>Designed by zhangkai</p>
                 <p>2016-08-26</p>
               </div>
             </div>

             <div className="content">
               <p className="title">MY WEB SITES COLLECTION</p>
               <LinkList handleDelete={this.handleDeleteLink}
                         handleShowEdit={this.handleShowEdit}
                         handleDeleteLink={this.handleDeleteLink}
                         links={this.state.links}
                         editMode={this.state.editMode}
                         selCategory={this.state.selCategory} />
             </div>

             { this.state.addClicked ? addClicked : "" }
             { this.state.showEditBox ? showEditBox : "" }
           </div>

  }
});

//----------------------------------------------------------
var ItemForm = React.createClass({
  getDefaultProps: function() {
  },
  getInitialState: function() {
    return {
             cid: this.props.item.cid || 1,
             id: this.props.item.id || -1,
             name: this.props.item.name || "",
             link: this.props.item.link || ""
           };
  },
  handleCancel: function(e) {
    if(e.target.id == "wrapper") {
      this.props.handleClosePop();
    }
  },
  handleChange: function(e) {
    if(e.target.id == "cid") {
      this.setState({cid: e.target.value});
    } else if(e.target.id == "id") {
      this.setState({id: e.target.value});
    } else if(e.target.id == "name") {
      this.setState({name: e.target.value});
    } else if(e.target.id == "link") {
      this.setState({link: e.target.value});
    }
  },
  handleSubmit: function(e) {
    var name = this.refs.name.value;
    var link = this.refs.link.value;
    if(name == "") {
      this.refs.name.style.backgroundColor = "#fdd";
      this.refs.name.value = "";
    } else {
      this.refs.name.style.backgroundColor = "transparent";
    }
    if(link == "") {
      this.refs.link.style.backgroundColor = "#fdd";
      this.refs.link.value = "";
    } else {
      this.refs.link.style.backgroundColor = "transparent";
    }
    if(name == "" || link == "") {
    } else {
      this.props.handleAddOrEditLink(this.state);
    }
    e.preventDefault();
  },
  render: function() {
    var categories = this.props.categories.map(function(item, index) {
      return <option key={index} value={item.id}>{item.name}</option>
    }.bind(this));
    return <div id="wrapper" className="pop-wrapper" onClick={this.handleCancel}>
             <form onSubmit={this.handleSubmit}>
               <select id="cid" defaultValue={this.state.cid} onChange={this.handleChange}>{categories}</select>
               <input id="id" type="hidden" value={this.props.id} />
               <input id="name" ref="name" type="text" placeholder="Name" defaultValue={this.state.name} onChange={this.handleChange} />
               <input id="link" ref="link" type="text" placeholder="Link" defaultValue={this.state.link} onChange={this.handleChange} />
               <input type="submit" value="click here to submit" />
             </form>
           </div>
  }
});

//----------------------------------------------------------
var Catalog = React.createClass({
  render: function() {
    var categories = this.props.categories.map(function(item, index) {
      return <Category key={index} active={this.props.selCategory} handleChange={this.props.handleChange} item={item} />
    }.bind(this));

    return <div className="catalog">
             <h3 className="head">catalogs</h3>
             {categories}
           </div>
  }
});

var Category = React.createClass({
  handleClick: function() {
    this.props.handleChange(this.props.item.id);
  },
  render: function() {
    return <div className={"category " + (this.props.active == this.props.item.id ? "selected" : "unselected")} onClick={this.handleClick}>
             {this.props.item.name}
           </div>
  }
});

//----------------------------------------------------------
var LinkList = React.createClass({
  getDefaultProps: function() {
    return { };
  },
  handleDeleteLink: function(item) {
    this.props.handleDeleteLink(item);
  },
  render: function() {
    var links = [];
    this.props.links.map(function(item, index) {
      if(item.cid == this.props.selCategory) {
        links.push(<Link handleDelete={this.handleDeleteLink}
                         handleShowEdit={this.props.handleShowEdit}
                         editMode={this.props.editMode}
                         key={index}
                         item={item} />);
      }
    }.bind(this));

    return <div className="links">
             { links }
           </div>
  }
});

var Link = React.createClass({
  handleEdit: function() {
    this.props.handleShowEdit(this.props.item);
  },
  handleDelete: function() {
    this.props.handleDelete(this.props.item);
  },
  render: function() {
    var link;
    if(this.props.editMode) {
       link = <div className="link">
                <div className="inner">
                  <a href={this.props.item.link} target="blank">{this.props.item.name}</a>
                  <div className="buttons">
                    <div className="wrapper">
                      <span onClick={this.handleEdit} title="Edit">&notin;</span>
                      <span onClick={this.handleDelete} title="Delete">&times;</span>
                    </div>
                  </div>
                </div>
              </div>
    } else {
      link = <div className="link">
               <div className="inner">
                 <a href={this.props.item.link} target="blank">{this.props.item.name}</a>
               </div>
             </div>
    }
    return link;
  }
});

ReactDOM.render(
  <Portal />,
  document.getElementById("wrapper")
);

