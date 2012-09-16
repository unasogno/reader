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
            new Task({
                id: 1, bookName: "������", bookUrl: "http://t.cn/zlPvabt", 
                pages: "1-10", status: "������", owner: "��"
            }),
            new Task({
                id: 2, bookName: "��ѧ֮��", bookUrl: "http://t.cn/zlPvabc", 
                pages: "21-30", status: "������", owner: "ĳ��"
            }),
            new Task({
                id: 3, bookName: "������", bookUrl: "http://t.cn/zlPvabt", 
                pages: "1-10", status: "������", owner: "��"
            }),
            new Task({
                id: 4, bookName: "��ѧ֮��", bookUrl: "http://t.cn/zlPvabc", 
                pages: "21-30", status: "������", owner: "ĳ��"
            }),
            new Task({
                id: 5, bookName: "����Զȥ�ļ�԰", bookUrl: "http://t.cn/zlh4ksy",
                pages: "11-20", status: "������", owner: "��"
            })
        );
    }
});

Task.include({
    init : function(fields) {
        this.id = fields.id;
        this.bookName = fields.bookName;
        this.bookUrl = fields.bookUrl;
        this.pages = fields.pages;
        this.status = fields.status;
        this.owner = fields.owner;
    },
    claim : function() { alert("����ɹ�"); },
    upload : function() { alert("�ϴ����"); },
    operations : function() {
        switch(this.status) {
            case "������":
                return { "����" : this.claim };
            case "������":
                return { "�ϴ�" : this.upload };
            case "�����":
            default:
                return [];
        }
    }
});

var TaskOperationView = new Class;
TaskOperationView.extend({
    icon : function(name) {
        return {
            "����" : "ui-icon-flag",
            "�ϴ�" : "ui-icon-circle-arrow-n"
        }[name];
    }
});

TaskOperationView.include({
    init : function(container) { 
        this.container = container;
    },
    update : function(task) { 
        this.reset();
        for (var name in task.operations()){
            var button = document.createElement("button");
            var id = task.id + "_" + name;
            var icon = this.parent.icon(name);
            button.setAttribute("id", id);
            this.container.appendChild(button);
            
            var selector = "#" + id;
            $(selector).button({
                icons : { primary : icon }, 
                text : name
            });
            
            var operation = task.operations()[name];
            $(selector).click(function(){
                operation();
            });
            
            $(selector).css({ height: "26px", width: "30px" });
        }
    },
    reset : function() {
        this.container.innerHTML = "";
    }
});

var TaskListView = new Class;
TaskListView.include({
    init : function(table, OperationView) { 
        this.table = table; 
        this.OperationView = OperationView;
        this.childViews = [];
    },
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
            var childView = new this.OperationView(operations);
            this.childViews.push(childView);
            childView.update(tasks[i]);
        }
    },
    reset : function() {
        var tbody = $(this.table)[0];
        var rowCount = tbody.rows.length;
        for (var i = rowCount - 1; i >= 1; i--) {
            tbody.deleteRow(i);
        }
        this.childViews = [];
    }
});

var TaskListController = new Class;
TaskListController.include({
    init: function(view) { this.view = view; },
    load : function(tasks) { 
        this.view.update(tasks);
    }
});
