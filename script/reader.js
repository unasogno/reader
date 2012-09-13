var Class = function(parent) {
  var klass = function() {
    this.init.apply(this, arguments);
  };

  if (parent) {
    var subclass = function() {};
    subclass.prototype = parent.prototype;
    klass.prototype = new subclass;
  };

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
    
    for (var i in obj) {
      klass.fn[i] = obj[i];
    }
    if (included) included(klass);
  };

  return klass;
};

var Task = new Class;

Task.extend({
    loadTasks : function(serviceUrl) {
        return new Array(
            new Task("大数据", "http://t.cn/zlPvabt", "1-10", "新建", "无人认领"),
            new Task("数学之美", "http://t.cn/zlPvabc", "21-30", "新建", "无人认领")
        );
    }
});

Task.include({
    init : function(bookName, bookUrl, pages, status, owner) {
        this.bookName = bookName;
        this.bookUrl = bookUrl;
        this.pages = pages;
        this.status = status;
        this.owner = owner;
    }
});

var TaskListView = new Class;
TaskListView.include({
    init : function(table) { this.table = table; },
    update : function(tasks) { 
        this.reset();
        var tbody = $(this.table)[0];
        for (var i in tasks) {
            var row = tbody.insertRow(tbody.rows.length);
            
            var name = row.insertCell(0);
            var a = document.createElement("a");
            a.href = tasks[i].bookUrl;
            a.innerHTML = tasks[i].bookName;
            name.appendChild(a);
            
            var pages = row.insertCell(1);
            pages.innerHTML = tasks[i].pages;
            
            var status = row.insertCell(2);
            status.innerHTML = tasks[i].status;
            
            var owner = row.insertCell(3);
            owner.innerHTML = tasks[i].owner;
            
            var operations = row.insertCell(4);
            operations.innerHTML = "n/a";
        }
    },
    reset : function() {
        var tbody = $(this.table)[0];
        var rowCount = tbody.rows.length;
        for (var i = rowCount - 1; i >= 1; i--) {
            tbody.deleteRow(i);
        }
    }
});

var TaskListController = new Class;
TaskListController.include({
    init: function(view) { this.view = view; },
    load : function(tasks) { this.view.update(tasks); }
});
