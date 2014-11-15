##Tags Framework

The Tags framework supports the Model-View-Controller design style by
extending HTML in a natural way without resorting to templates. Here are
the high points of the Tags framework.
   
  * Implements a Type system using prototypes with inheritance chains.
  
  * Implements a super() method which allows an
    overridden method to be invoked from an overriding method in the
    Type structure.
  
  * Allows arbitrarily complex object structures to be instantiated from XML or Javascript descriptions.
  
  * Implements a built-in 'view' Type for rendering and manipulating standard HTML and custom tags.
  
  * Allows View objects represented in XML to be coded in-line where they look and act
    like ordinary HTML, but with the ability to intermingle custom tags. 
    
  * Alternatively, allows View objects to be represented in Javascript for convenient handling of dynamic HTML.
  
  * Provides a namespace for referencing objects by their 'id' attribute and
    provides the ability to reference objects from other objects
    without having to use jQuery selectors or complex hierarchy traversals.
  
  * Implements Inversion of Control (IoC).

The Tags framework supports the Model-View-Controller (MVC) style of programming.

The View is represented by objects of the built-in 'view' Type. There is no explicit
Type for Model objects, but they can be represented by any Javascript object. Likewise,
there is no explicit Type for Controller objects, but Controller functionality can
be embedded in a 'view' object or in some other custom Type. 

A Web Application using the Tags framework will typically consist of three parts -
a standard CSS file, an initial HTML file (often called index.html) and one
or more Javascript files containing the application code.

The initial HTML file will have a SCRIPT tag of type 'text/tags' containing
XML representation of standard HTML tags and custom tags. These are automatically
processed using the Tags framework and used to render HTML.

The Javascript files contain application code defining how custom tags are
rendered and activated.
   
See the [Form-to-Table example](examples/form-to-table/index.html) ( 
[HTML](showsource.html?source=examples/form-to-table/index.html), 
[Javascript](showsource.html?source=examples/form-to-table/app.js) and 
[CSS](showsource.html?source=examples/form-to-table/app.css) )
for a quick exposure to how the Tags framework is used.
This introductory example shows how custom tags can be used as components to provide a short-hand
notation for more complex HTML sequences. It shows how rendering code and event handlers can be
packaged up into a single component. It shows how a Model object is attached to a container component
and propogated to the contained control components. It shows how the contained components can extract data
from the Model based on the 'name' attribute of the control component.

       
See the [Annotated Source](showsource.html?source=tags.js) for the Tags Framework API.

###Inheritance Chains

Use Tags.define() to define a new type. Tags.define() takes a plain object as argument 
which is copied to the constructor
prototype. It must have a 'tag' attribute and its value is what determines the type used 
to instantiate the object with Tags.create().

The Tags.define() argument can have an 'extend' attribute which determines which
type will be extended.

###Supports Call to Super Method

Any method that overrides a method of an extended type can
call the overridden method from the overriding method using this.super(). This
is accomplished with no additional overhead in defining the object type.
The initial call to the this.super() method requires a search of the
object structure to find the super method, but it is cached for any
subsequent super calls from the same method.

###Complex Object Instantiation

The Tags.create() method supports instantiation of complex arguments. Its input
can be either an XML DOM element or a string starting with an '&lt;' character
which is interpreted as XML or a plain Javascript object which mimics XML semantics.
Its input can also be a simple type such as boolean, number, null or string not starting
with '&lt;', but in this case it simply returns the value passed to it.

An XML tag name or Javascript object 'tag' attribute is used to indicate the
type to be instantiated. The XML content or the value of the object 'content'
attribute will hold nested content which is interpreted using recursive calls to
Tags.create().

###View Objects

The 'view' type is built into the Tags framework. Each view object represents a
standard HTML element or an object that can be represented by an HTML element.
It implements a view.render() method
to render an HTML DOM object and return it as a jQuery value. It implements a view.activate()
method which can be overridden to implement event handlers or accomplish any other
tasks that need to be deferred until after the element is rendered into a DOM object.
It also implements a view.update() method which can be overridden to take action
after the state of the system has changed.

###Automatic Handling of Static Tags

The Tags framework provides the ability to instantiate HTML from either XML or
Javascript descriptions. XML descriptions have the familiar look of HTML, but with
extended and user extendable capabilities. By simply enclosing XML inside of a SCRIPT
tag and by giving that SCRIPT tag a type attribute of 'text/tags', the Tags framework
will interpret the XML as input to Tags.create() and if it is a 'view' type object,
view.render() and view.activate() methods will be invoked at the appropriate time to
render HTML immediately after the location of the containing SCRIPT tag.  This allows
one to use the Tags framework to render standard HTML almost the same way one would
use standard HTML.

###Generate Dynamic HTML from Javascript Descriptions

The same code that is accessed through XML descriptions can be accessed through 
descriptions coded as Javascript structures. This is a convenient mode for generating
dynamic HTML because it can be embedded in Javascript event handlers.
 
This lets one use the right tool for the job. Use HTML-like
input with implied handling to represent static HTML and use Javascript structures with
explicit handling to represent dynamic HTML.

###Object Namespace

A Tag object that is given an 'id' attribute can be referenced from the Tags.ns namespace
using the 'id' value. The 'id' also represents a dotted path to a reference to the object.
Each reference in the path must exist now or some time in the future for the path to be
valid. A path that is not complete at the time the object is instantiated but is completed
at some future time is called a forward reference. An object with an 'id' attribute of
'aaa.bbb.ccc' could actually be referenced as Tags.ns['aaa.bbb.ccc'] or as Tags.ns.aaa.bbb.ccc.
The former reference would be valid immediately, but the later reference would be valid
only after objects with 'id' values 'aaa' and 'aaa.bbb' were instantiated if it were a
forward reference.

An attribute of an object may be set to reference another object from the Tags.ns namespace
by prefixing the attribute name with 'ref-'. Thus, a tag containing an attribute called
`ref-xxx='aaa.bbb.ccc'` would be initialized with an attribute called 'xxx' which is
a reference to the object with 'id' attribute of 'aaa.bbb.ccc'. Forward references are allowed
and will become valid after the referenced object is instantiated.

###Inversion of Control (IoC)

The Tags.ns namespace, the ability to control the path to objects through their 'id'
attribute and the ability to specify a reference to an object within XML makes it possible
to control object instantiation and create links between the instantiated objects in much 
the same way that an XML IoC file is used in Java with Spring. This approach makes the
resulting code easier to understand and more configurable.

##Examples

Here are some examples that shows the Tags framework in action ...

* [Form-to-Table example](examples/form-to-table/index.html) ( 
  [HTML](showsource.html?source=examples/form-to-table/index.html), 
  [Javascript](showsource.html?source=examples/form-to-table/app.js) and 
  [CSS](showsource.html?source=examples/form-to-table/app.css) )
  
  This is the introductory example referenced above.
  
* [TodoMVC Example](examples/todoMvc/index.html) ( 
  [HTML](showsource.html?source=examples/todoMvc/index.html), 
  [Javascript](showsource.html?source=examples/todoMvc/app.js) and 
  [CSS](showsource.html?source=examples/todoMvc/app.css) )
 
  This is an implementation of the Todo-MVC Web application that is implemented using many different 
  MVC frameworks and documented at [TodoMVC](http://todomvc.com/).
  
* [Holy Grail Example](examples/holyGrail/index.html) (
  [HTML](showsource.html?source=examples/holyGrail/index.html),
  [Layout Javascript](showsource.html?source=examples/holyGrail/layout.js),
  [Layout CSS](showsource.html?source=examples/holyGrail/layout.css) and
  [App CSS](showsource.html?source=examples/holyGrail/app.css) )
  
  This demonstrates an experimental Layout library that implements Border layout
  and Tabs Layout.
  
  The problem is based on work described at [HolyGrail](http://en.wikipedia.org/wiki/Holy_Grail_%28web_design%29).
  This example shows how a complex problem can be abstracted out to leave the application with
  a simple and intuitive interface.
  
* [PhoneCat Example](examples/phonecat/index.html) ( 
  [HTML](showsource.html?source=examples/phonecat/index.html), 
  [Javascript](showsource.html?source=examples/phonecat/app.js) and
  [CSS](showsource.html?source=examples/phonecat/app.css) )

  This is a Phone Catalog example that is featured in a [tutorial for Angular.js](https://docs.angularjs.org/tutorial/) and 
  a [tutorial for Backbone.js](http://blog.42floors.com/coded-angular-tutorial-app-backbone-took-260-code/). It may be useful to compare the Tags approach to that
  used for Angular and Backbone.
  
  See the [HTML](showsource.html?source=examples/phonecat/index.html) for some notes
  about why one might choose between the Tags framework and some other modern MVC framework.
  
