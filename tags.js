var log = log || {debug:function() {}};

//(function($) {


	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed.
	 */
	// Inspired by base2 and Prototype
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
     
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
   
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };

  'use strict';
  
/** Implement the core functionality of the Tags Framework.
 *
 * <p>The Tags namespace provides the capability to define Tag classes using
 *    Tags.define() and instantiate Tags classes using Tags.create().</p>
 *
 * <p>Tag classes mimic XML. They have a 'tag' attribute which holds
 *    the tag name and a 'content' attribute which holds nested content.</p>
 *
 * @namespace Tags
 */
  var Tags = {
  
    defaultClass: null,
    classMap: {'CLASS':Class},
    sequentialNumber: 0,
    parseTime: 0,
    workTime: 0,
    tagsById: {},
    
  nextInSequence: function() {
    this.sequentialNumber++;
    return this.sequentialNumber;
  },
  
/**
 * Define a new Tag Class and register it.
 *
 * <p>The proto parameter must have a 'tag' attribute that specifies the name of the
 *    class to be used by Tags.create() to find this class for instantiation.
 *    The proto.extend attribute indicates the class to
 *    be extended (or none if not provided).</p>
 *  
 * <p>Additional attributes of the 'proto' parameter will be added to the prototype
 *    of the class being defined.</p>
 *  
 * <p>Typical use of Tags.define() is to extend View to create a custom tag. Here
 *    is a simple example of that.</p>
 *
 * <pre class='code'>
 *
 *  Tags.define({
 *    tag: 'mytag',
 *    extend: 'view',
 *
 *    renderText: function() {
 *      if (this.message) this.content = this.message;
 *      return this.renderAsDiv();
 *    }
 *  });
 * </pre>
 *
 * @param {Object} proto The config object that contains the tag name of the Tag class being defined and additional prototype information for the class.
 *  
 */    
  define: function(proto) {
    var extended = null;
    if (proto.extend) extended = Tags.classMap[proto.extend.toUpperCase()];
    extended = extended || Tags.defaultClass;
    var cls = extended.extend(proto);
    if (proto.tag) Tags.classMap[proto.tag.toUpperCase()] = cls;
//      log.debug("Tags.extend classMap="+JSON.stringify(Tags.classMap));
    return cls;  
  },
      
  /** Convenience function for determining if a value is a Tag, possibly of a specified type.
   *
   *  Use this to select just the Tag objects or Tag objects of a specific type, from an array 
   *  of content. 
   *
   *  @param {any} val The value to be tested
   *  @param {string} [tagName] The value candidate 'tag' attribute must match
   */
  isTag: function(val, tagName) {
    if (!val) return false;
    if (typeof val != 'object' || !val._isTag) return false;
    if (!tagName) return true;
    if ($.isArray(tagName)) {
      for (var n=0; n<tagName.length; n++) if (tagName[n] == val.tag) return true;
      return false;
    }
    return val.tag == tagName;
  },

  /** Find a Tag object by its id attribute.
   *
   * <p>This is used primarily by the View class. The view.activate() method
   *    automatically adds unique view.id attributes and saves the corresponding
   *    Tag object to be found by this method.</p>
   *
   * @param {string} id The id of the Tag object to be found
   * @return {Object} the Tag object associated with the id
   */  
  findTag: function(id) {
    return Tags.tagsById[id];
  },

  /** Create a new instance of a Tag class.
   *
   *  <p>Instantiation information
   *     is provided by the config parameter. It must, at least have a 'tag'
   *     attribute which is used to select the Tag class to be used.</p>
   *
   *  <p>It is possible that the value of the 'tag' attribute does not map
   *     to any Tag class. In that case, a default class will be used which 
   *     can be specified with the optional 'defaultClass'
   *     parameter. If not provided, the built-in View class will be used. This
   *     behavior is used to allow the View class to be used to represent
   *     arbitrarily complex HTML structures.</p>
   *
   *  <p>The create() method can be used to instantiate a complete Tag object
   *     structure corresponding to an XML structure. 
   *     It is called recursively to process the
   *     nested content contained in the config.content attribute.</p>
   *     The config parameter
   *     describes Tag object structure to be instantiated using XML 
   *     or Javascript as described below.</p>
   *
   *  <p>The config parameter:</p>
   *  <ul>
   *    <li>Tag Object
   *      <p>If the config parameter is already a Tag object, return it 
   *         without further processing. A Tag object is recognized by 
   *         having an '_isTag' attribute which is set by Tags.create().</p>
   *    </li>
   *    <li>Plain Object
   *      <p>config.tag will indicate the Class to be instantiated</p>
   *      <p>config.content is the nested content</p>
   *      <p>other config attributes become attributes of the instantiated object</p>
   *    </li>
   *    <li>XML-Node
   *      <p>the tag name indicates the Class to be instantiated</p>
   *      <p>nested content of the XML becomes the nested content of the instantiated object</p>
   *      <p>other attributes of the XML become attributes of the instantiated object</p>
   *    </li>
   *    <li>String that starts with '&lt;'
   *      <p>it is interpreted as XML, parsed and processed as an XML-Node</p>
   *    </li>
   *    <li>String|number|boolean
   *      <p>evaluates to the value of config as a string</p>
   *    </li>
   *  </ul>
   *
   *  <p>The create() function calls itself recursively to process nested content.</p>
   *  
   *  <p>This method pretty much does what you expect it to do. Here
   *     is an example ...</p>
   *
   *  <pre class='code'>
   *    var tag = Tags.create(
   *         "&lt;div class='emphatic'>"
   *       +   "Hello "
   *       +   "&lt;span style='color:red;'&gt;World&lt;/span&gt;&lt;"
   *       + "/div&gt;");
   *  </pre>
   *
   *  <p>To do the same thing with Javascript ...</p>
   *
   *  <pre class='code'>
   *    var tag = Tags.create(
   *       {tag:'div', class:'emphatic', content: [
   *         'Hello '
   *         {tag:'span', style:'color:red;', content:'World'
   *       }]);
   *  </pre>
   *
   *  <p>The create() function calls itself recursively to process nested content. That is why
   *     it needs to be able to handle non-XML strings, numbers and booleans.</p>
   *
   *  @param {(Object|XML-Node|string|number|boolean|null)} config The specifier of what is to be created
   *  @param {string} [defaultClass] the tag name of the Tag class to be used if config.tag does not map to know Tag class
   */        
  create: function(config) {
    var xmldoc, tag, Cls, child, n;
    var startTime = new Date().getTime();
    if (!config) return null;
    if (typeof config == 'string') {
//        log.debug("BUILD text="+config);
      var trimmed = $.trim(config);
      if (trimmed.length > 0 && trimmed.charAt(0) == '<') {
        var xmlnode = $.parseXML(trimmed).documentElement;
        var time = new Date().getTime();
        Tags.parseTime += time - startTime;
        startTime = time;
        window.theXmlnode = xmlnode;
//          log.debug("xmlnode.nodeType="+xmlnode.nodeType);
        tag = Tags.create(xmlnode);
//          log.debug("BUILD tag="+tag.tag);
        Tags.workTime += new Date().getTime() - startTime;
        return tag;
      } else {
        return config;
      }
    } else if (config.nodeType == 1) {
      // XML Node element
      var attrs = {tag:config.nodeName};
//        log.debug("BUILD-XML nodeName="+config.nodeName);
      var nodeAttrs = config.attributes;
      for (var m=0; m<nodeAttrs.length; m++) {
        var attr = nodeAttrs[m];
        attrs[attr.name] = attr.value;
      }
//        log.debug("BUILD-XML attrs="+JSON.stringify(attrs));
      Cls = Tags.classMap[attrs.tag.toUpperCase()] || Tags.defaultClass;
      tag = new Cls(attrs);
//        log.debug("BUILD-XML tag="+Tags.showTag(tag));
      tag._isTag = true;
      var children = config.childNodes;
      if (children) {
        tag.content = [];
        var val;
        for (n=0; n<children.length; n++) {
          var childNode = children[n];
          switch (childNode.nodeType) {
          case 1:  // ELEMENT_NODE
            child = Tags.create(childNode);
            if (Tags.isTag(child)) child.parent = tag;
            tag.content.push(child);
            break;
          case 3:  // TEXT_NODE
            val = childNode.nodeValue;
            tag.content.push(val);
            break;
          case 4:  // CDATA_SECTION_NODE
            val = childNode.nodeValue;
            tag.content.push(val);
            break;
          }
        }
      }
      Tags.workTime += new Date().getTime() - startTime;
      return tag;
    } else if ((typeof config) != 'object' || config._isTag) {
      return config;
    } else {
      // Javascript Object
      Cls = Tags.classMap[config.tag.toUpperCase()] || Tags.defaultClass;
      tag = new Cls(config);
      tag._isTag = true;
      if (config.content) {
        if (typeof config.content == 'object') {
          for (n in config.content) {
            child = Tags.create(config.content[n]);
            if (Tags.isTag(child)) child.parent = tag;
            config.content[n] = child;
          }
        } else {
          child = Tags.create(config.content);
          if (Tags.isTag(child)) child.parent = tag;
          tag.content = child;
        }
      }
      Tags.workTime += new Date().getTime() - startTime;
      return tag;
    }
  }, // Tags.create()
  
  // The remaining methods are general purpose utilities
  
  asArray: function(x) {
    var xx = x != false ? (x || []) : x;
    return typeof xx == 'object' ? xx : [xx];
  }
  
}; //Tags

window.Tags = Tags;
  
/** A built-in Class for representing HTML with custom tags.
 *
 * <p>Use the XML representation of &lt;view&gt; tags inside &lt;style&gt; tags
 *    or use Tags.create() to instantiate View objects.</p>
 *
 * <p>This is the heart of the Tags Framework. Instantiate this
 *    to create structures that shadow the corresponding HTML
 *    structures.</p>
 *
 * <p>To use the View class, use a 'tag' attribute that is the name
 *    of any HTML tag or the tag name of a custom tag which is a class
 *    that extends View and implements a custom tag.</p>
 *
 * <p>The life cycle of a View object involves:</p>
 * <ul>
 *  <li>Instantiate - Use XML or Tags.create()</li>
 *  <li>Render - Invoke view.render() - Optional for static HTML</li>
 *  <li>Attach to the DOM - Use jQuery on the result from view.render() (unless it is static HTML)</li>
 *  <li>Activate - Attach event handlers - optional if no event handlers needed</li>
 * </ul>
 *
 * @class
 */
var View = Tags.define({
  tag:'view',
  extend:'class',

  /** Function to initialize the instance from the config value.
   *  This is called automatically by the Tags Framework infrastructure.
   *
   * @memberof View
   * @instance
   * @param {object} config Contains key:value pairs used to init the instance
   */
  init:function(config) {
    for (var key in config) {
      this[key] = config[key];
    }
    this.on = this.on || {};   
  },
  
  /** Return a jQuery object that is a DOM element for the HTML represented by this object
   *
   * <p>This invokes renderText internally. If you need to override the render
   *    functionality it is best to override the renderText() method rather than
   *    this one.</p>
   *
   * <p>This method recursively renders nested content. Invoke it as this._super()
   *    from the overriding method to painlessly render nested content.</p>
   *
   * @memberof View
   * @instance
   * @return {jQuery} A DOM element for the rendered HTML
   */ 
  render: function() {
    this.$el = $(this.renderText());
    return this.$el;
  },
  
  /** Return a string that is the XML represented by this object.
   *
   *  <p>Custom tags that inherit from View should override this.</p>
   *
   * <p>This method recursively calls itself to render nested content. Invoke it as this._super()
   *    from the overriding method to painlessly render nested content.</p>
   *
   * @memberof View
   * @instance
   * @return {string} Text of the rendered HTML
   */
  renderText: function() {
    return this.renderAs(this.htmlTag || this.tag);
  },

  /** Convenience method used by renderText() to render HTML for a specific tag name.
   *
   * <p>Typical use of this function would be inside a function overriding renderText().
   *    It would perform custom processing on attributes and content and then invoke
   *    Tags.renderAs() to do all the actual rendering work.</p>
   *
   * @memberof View
   * @instance
   * @param {string} tag The tag name of the HTML tag to be rendered
   * @return {string} Text of the rendered HTML
   */
  renderAs: function(tag) {
    var context = this.renderOpen(tag);
    this.renderBody(context);
    this.renderClose(context);
    return context.buf;
  },
  
  renderOpen: function(tag) {
    var context = {buf:"<",first:true,tag:tag};    
    context.buf += tag;
    if (!this.id) {
      this.id = "tag-"+Tags.nextInSequence();
//        log.debug("renderOpen id="+this.id+" seq="+Tags.sequentialNumber);
    }
    for (var key in this) {
      if (!key) continue;
      var ch = key.charAt(0);
      if ((ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) continue;
      if (key === 'tag' || key === 'extend') continue;
      var val = this[key];
      if (val === null) continue;
      var type = typeof val;
      if (type == 'string' || type == 'number' || type == 'boolean') {
        context.buf += " "+key+"='"+val+"'";
//          log.debug(" VAL["+key+"]="+val);
      }
    }
    return context;
  },
  
  renderBody: function(context) {
    if (this.content) {
	    var content = Tags.asArray(this.content);
	    for (var n in content) {
	      this.addContentItem(context,content[n]);
	    }
	  }
  },
  
  renderClose: function(context) {
    if (context.first) {
      context.buf += "/>";
    } else {
      context.buf += "</"+context.tag+">";
    }
  },
  
  addContentItem: function(context, item) {
    if (context.first) {
      context.first = false;
      context.buf += ">";
    }
    if (Tags.isTag(item)) {
      context.buf += item.renderText();
    } else if (typeof item == 'object') {
    } else {
      context.buf += item;
    }
  },
  
  /** Add content to the View object.
   *
   * <p>Apply Tags.create() to the contentToAdd parameter and add the
   *    result to the content attribute of this object.
   *
   * <p>If contentToAdd is a non-array object, the content attribute is
   *    expected to be an object. If the content attribute is null or
   *    undefined, that is OK, because then it will be turned into {}.
   *    The key:value pairs in contentToAdd will be added to the content object.
   *    Each value is processed with Tags.create() and that is the value
   *    added to content.</p>
   *
   * <p>Otherwise the content attribute is expected to be an array
   *    or something we can turn into an array. String, number or boolean value x
   *    will be turned into [x]. Null or undefined will be turned into [].
   *    Then the contentToAdd value will be processed with Tags.create() and
   *    that value pushed onto the content attribute or
   *    if contentToAdd is an array, each of its members will be evaluated
   *    with Tags.create() and pushed onto content.
   *
   * @memberof View
   * @instance
   * @param {any} contentToAdd The content to be added to the 'content' attribute
   */
  addContent: function(contentToAdd) {
    if ($.isArray(contentToAdd)) {
      this.content = this.content || [];
      if (!$.isArray(this.content)) this.content = [this.content];
      for (var n=0; n<contentToAdd.length; n++) {
        this.content.push(Tags.create(contentToAdd[n]));
      }
    } else if (typeof contentToAdd == 'object') {
      this.content = this.content || {};
      for (var key in contentToAdd) {
        this.content[key] = Tags.create(contentToAdd[key]);
      }
    } else if (contentToAdd) {
      if ($.isArray(this.content)) {
        this.content.push(Tags.create(contentToAdd));
      } else if (this.content) {
        this.content = [this.content,Tags.create(contentToAdd)];
      } else {
        this.content = Tags.create(contentToAdd);
      }
    }
  },
  
  /** Determine if the component has the value in its list of classes.
   *
   * @memberof View  
   * @instance
   * @param {string} theClass... the class to be tested
   * @return {boolean} True if the class is present, otherwise false
   */
  hasClass: function(theClass) {
    var classList = this['class'].split(' ');
    for (var n=0; n<classList.length; n++) if (classList[n] == theClass) return true;
    return false;
  },
      
  /** Convenience method to add a string to the 'class' attribute of this object.
   *
   *  <p>This treats the 'class' attribute like a Set of strings where members are
   *     in a space separated list. This will add one or more members to that set,
   *     avoiding duplicate entries.</p>
   *
   *  <p>This can be called either before or after a DOM element has been created.
   *     for this object. If one has been created, it will be in this.$el. If
   *     this.$el exists, then the updated class value will be applied to it.
   *     Otherwise, the updated class value will be available to be applied to
   *     the DOM element when it is created.</p>
   *
   * @memberof View
   * @instance
   * @param {string} class... A variable argument list of classes
   */
  addClass: function() {
    var n;
//      log.debug("addClass args.len="+arguments.length);
    var originalClass = this['class'];
    var classes = {};
    if (this['class']) {
      var classList = this['class'].split(' ');
      for (n=0; n<classList.length; n++) classes[classList[n]] = true;
    }
    if (arguments.length > 0) {
      for (n=0; n<arguments.length; n++) {
        classes[arguments[n]] = true;
      }
    }
    var classText = "";
    for (var key in classes) {
      if (classText) classText += ' ';
      classText += key;
    }
    this['class'] = classText;
    if (this.$el) this.$el.attr('class',classText);
//      log.debug("addClass "+originalClass+" --> "+this['class']);
  },
   
  /** Convenience method to remove a string to the 'class' attribute of this object.
   *
   *  <p>This treats the 'class' attribute like a Set of strings where members are
   *     in a space separated list. This will remove one or more members from that set.
   *     strings matching the string values in the class parameters will be removed</p>
   *
   *  <p>This can be called either before or after a DOM element has been created.
   *     for this object. If one has been created, it will be in this.$el. If
   *     this.$el exists, then the updated class value will be applied to it.
   *     Otherwise, the updated class value will be available to be applied to
   *     the DOM element when it is created.</p>
   *
   * @memberof View
   * @instance
   * @param {string} class... A variable argument list of classes
   */
  removeClass: function() {
    var n;
//      log.debug("removeClass args.len="+arguments.length);
    var originalClass = this['class'];
    var classes = {};
    if (this['class']) {
      var classList = this['class'].split(' ');
      for (n=0; n<classList.length; n++) classes[classList[n]] = true;
    }
    if (arguments.length > 0) {
      for (n=0; n<arguments.length; n++) {
        classes[arguments[n]] = false;
      }
    }
    var classText = "";
    for (var key in classes) {
      if (!classes[key]) continue;
      if (classText) classText += ' ';
      classText += key;
    }
    this['class'] = classText;
    if (this.$el) this.$el.attr('class',classText);
//      log.debug("removeClass "+originalClass+" --> "+this['class']);
  },
   
  walk: function(callback) {
    for (var n in this.content) {
      var item = this.content[n];
      if (!Tags.isTag(item)) continue;
      callback(item);
      item.walk(callback);
    }
  },
  
  /** Apply event handlers and take other actions that need to be delayed until the View is added to the DOM.
   *
   * <p>An overridden activate() method is a good place to define and attach event handlers. This
   *    View object provides a convenient place to save information used by handlers.</p>
   *
   * <p>Invoke this function of the View class using this._super() in order to make sure
   *    that activate() is called on nested content.</p>
   *
   * <p>A side effect of this function is to make sure that this.$el is set. It will normally
   *    be set by the render() method, but if render() is not called (i.e., it is being used
   *    with static HTML), then activate() will attempt to set this.$el and thus associate
   *    the object with the static HTML by first checking for the this.el attribute. If found,
   *    it will be used as a jQuery selector to find the DOM object to use. If not found, it
   *    will check for the this.id attribute. If found, it will be assumed to be the same as
   *    the ID attribute of the DOM element and used to locate the DOM element by ID.</p>
   *
   * <p>This function processes the this.on attribute as a plain object containing
   *    eventName:eventHandler pairs to be attached. The eventName can be any legal event
   *    name.</p>
   *
   * @memberof View
   * @instance
   */
  activate: function() {
//      log.debug("ACTIVATE1 haveEl="+!!this.$el+" id="+this.id);
    if (!this.$el && this.id) this.$el = $(this.el || "#"+this.id);
//      log.debug("ACTIVATE2 haveEl="+!!this.$el+" id="+this.id);
    if (this.on) {
      for (var key in this.on) {
//          log.debug("ON key="+key);
        this.$el.on(key,this.on[key]);
      }
    }
    if (!this.id) {
      this.id = 'tag-'+Tags.nextInSequence();
      this.$el.attr('id',this.id);
    }
    Tags.tagsById[this.id] = this;
    if (this.content) {
      for (var n in this.content) {
        var item = this.content[n];
        if (Tags.isTag(item)) item.activate();
      }
    }
  }
  
});

Tags.defaultClass = View;

// Apply any custom-tags found in script tags with type='text/custom-tag'  

$(document).ready(function() {
  log.debug("READY");
  log.debug("TAGS ready script.len="+$("script").length);
  log.debug("TAGS ready LEN="+$("script[type='text/custom-tags']").length);
  $("script[type='text/custom-tags']").each(function() {
    var scriptTag = $(this);
    var lastTag = scriptTag;
    var wrapper = Tags.create("<wrapper>"+scriptTag.html()+"</wrapper>");
    log.debug("SCRIPT ...");
    for (var n=0; n<wrapper.content.length; n++) {
      var tag = wrapper.content[n];
      if (Tags.isTag(tag)) {
        log.debug("RENDERING ... id="+(tag.id || "NONE"));
        lastTag.after(tag.render());
        tag.activate();
        log.debug("ACTIVATED id="+(tag.id || "NONE"));
        lastTag = tag.$el;
      }
    }
  });
//  log.debug("PARSE TIME="+Tags.parseTime+" WORK TIME="+Tags.workTime);
});

//})(jQuery);
  