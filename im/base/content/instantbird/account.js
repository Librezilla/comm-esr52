const Ci = Components.interfaces;

var account = {
  onload: function account_onload() {
    var protoList = document.getElementById("protolist");
    this.pcs = Components.classes["@instantbird.org/purple/core;1"]
                         .getService(Ci.purpleICoreService);
    var protocols = this.pcs.getProtocols();
    while (protocols.hasMoreElements()) {
      var proto = protocols.getNext().QueryInterface(Ci.purpleIProtocol);
      var id = proto.id;
      var item = protoList.appendItem(proto.name, id, id);
      item.setAttribute("image", "chrome://instantbird/skin/prpl/" + id + ".png");
      item.setAttribute("class", "menuitem-iconic");
    }
    protoList.selectedIndex = 0;
  },

  select: function account_select() {
    var protoList = document.getElementById("protolist");
    var id = protoList.selectedItem.value;
    this.proto = this.pcs.getProtocolById(id);
    document.getElementById("passwordBox").hidden = this.proto.noPassword;
    document.getElementById("newMailNotification").hidden =
      !this.proto.newMailNotification;

    this.populateProtoSpecificBox();
  },

  createTextbox: function account_createTextbox(aType, aValue, aLabel, aName) {
    var box = document.createElement("vbox");

    var label = document.createElement("label");
    label.setAttribute("value", aLabel);
    label.setAttribute("control", aName);
    box.appendChild(label);

    var textbox = document.createElement("textbox");
    if (aType)
      textbox.setAttribute("type", aType);
    textbox.setAttribute("value", aValue);
    textbox.setAttribute("id", aName);

    box.appendChild(textbox);
    return box;
  },

  populateProtoSpecificBox: function account_populate() {
    var gbox = document.getElementById("protoSpecific");
    var bundle = document.getElementById("prplbundle");
    var id = this.proto.id;
    var child;
    while (child = gbox.firstChild)
      gbox.removeChild(child);
    var opts = this.proto.getOptions();
    while (opts.hasMoreElements()) {
      var opt = opts.getNext()
                    .QueryInterface(Ci.purpleIPref);
      var text = bundle.getString(id + "." + opt.name);
      var name = id + "-" + opt.name;
      switch (opt.type) {
      case opt.typeBool:
	var chk = document.createElement("checkbox");
	chk.check = opt.getBool();
	chk.setAttribute("label", text);
	chk.setAttribute("id", name);
	gbox.appendChild(chk);
	break;
      case opt.typeInt:
	gbox.appendChild(this.createTextbox("number", opt.getInt(),
					    text, name));
	break;
      case opt.typeString:
	var str = "";
	try {
	  str = opt.getString();
	} catch(e) { }
	gbox.appendChild(this.createTextbox(null, str, text, name));
	break;
      default:
	throw "unknown preference type " + opt.type;
      }
    }
  },

  getValue: function account_getValue(aId) {
    var elt = document.getElementById(aId);
    return elt.value;
  },

  create: function account_create() {
    var acc = this.pcs.createAccount(this.getValue("name"), this.proto);
    acc.password = this.getValue("password");
    
    var opts = this.proto.getOptions();
    while (opts.hasMoreElements()) {
      var opt = opts.getNext()
                    .QueryInterface(Ci.purpleIPref);
      var name = this.proto.id + "-" + opt.name;
      var val = this.getValue(name);
      switch (opt.type) {
      case opt.typeBool:
	if (val != opt.getBool())
	  acc.setBool(opt.name, val);
	break;
      case opt.typeInt:
	if (val != opt.getInt())
	  acc.setInt(opt.name, val);
	break;
      case opt.typeString:
	var str = "";
	try {
	  str = opt.getString();
	} catch(e) { }
	if (val != str)
	  acc.setString(opt.name, val);
	break;
      default:
	throw "unknown preference type " + opt.type;
      }
    }
   
    acc.connect();
  }
};
