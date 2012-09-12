var Class = function(parent) {
  var klass = function() {
    this.init.apply(this, arguments);
  };

  if (parent) {
    var subclass = function() {};
    subclass.prototype = parent.prototype;
    klass.prototype = new subclass;
  }

  klass.prototype.init = function() {};

  klass.fn = klass.prototype;
  klass.fn.parent = klass;
  klass._super = klass.__proto__;

  klass.extend = function(obj) {
    var extended = obj.extended;
    for (var i in obj) {
      klass[i] = obj[i];
    }
    if (extended) extended(klass);
  };

  klass.include = function(obj) {
    var included = obj.included;
    for (var i n obj) {
      klass.fn[i] = obj[i];
    }
    if (included) included(klass);
  };

  return klass;
}

$(document).ready(function() {
  $("#load").click(function(viewContainer) {
    var view = new TaskListView(viewContainer);
    var controller = new TaskListController(view);
    var tasks = Task.loadTasks();
    controller.load(tasks);
  }); 
});
