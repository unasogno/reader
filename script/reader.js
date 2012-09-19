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
    loadTasks : function(serviceUrls) {
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
    validateOperation : function(operation) {
        switch(this.status) {
            case "������":
                return "claim" == operation;
            case "������":
                return "upload" == operation;
            case "�����":
            default:
                return false;
        }
    },
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

var TaskListView = new Class;
TaskListView.include({
    init : function(table) {
        this.table = table; 
    },
    addRow : function(task) {
        var newRow = $("#task-row-template").clone();
        newRow.attr("id", task.id);
        
        var nameLink = newRow.children('#name').children("a");
        nameLink.html(task.bookName);
        nameLink.attr("href", task.bookUrl);
        
        newRow.children("#pages").html(task.pages);
        newRow.children("#status").html(task.status);
        newRow.children("#owner").html(task.owner);
        
        var claimButton = newRow.children("#operation").children("#claim");
        claimButton.button({
            icons : { primary : "ui-icon-flag" }, 
            text : false
        });
        claimButton.css({ height: "26px", width: "30px" });
        
        var uploadButton = newRow.children("#operation").children("#upload");
        uploadButton.button({
            icons : { primary : "ui-icon-circle-arrow-n" }, 
            text : false
        });
        uploadButton.css({ height: "26px", width: "30px" });
        
        var self = this;
        // claimButton.click();
        uploadButton.click(function() {
            var operation = $(this).attr("id");
            var rowId = $(this).parent().parent().attr("id");
            self.trigger(operation, rowId);
        });
        
        newRow.appendTo($(this.table)[0]);
        return task.id;
    },
    reset : function() {
        var tbody = $(this.table)[0];
        var rowCount = tbody.rows.length;
        for (var i = rowCount - 1; i >= 1; i--) {
            tbody.deleteRow(i);
        }
    },
    addEventListener : function(event, handler) {
        $(this).bind(event, handler);
    },
    removeEventListener : function(event, handler) {
        $(this).unbind(event, handler);
    },
    trigger : function(event, parameters) {
        $(this).trigger(event, parameters);
    }
});

var TaskListController = new Class;
TaskListController.include({
    init: function(view) { 
        this.view = view; 
        this.view.addEventListener("upload", this.onUpload);
    },
    load : function(tasks) { 
        this.view.update(tasks);
    },
    showTasks : function(tasks) {
        this.view.reset();
        this.taskMap = {};
        for (var i in tasks) {
            var task = tasks[i];
            var rowId = this.view.addRow(task);
            this.taskMap[rowId] = task;
        }
    },
    onUpload : function(rowId) {
        var task = this.taskMap[rowId];
        if (typeof task == undefined) return;
        alert("uploaded");
        /*
        if (!task.validateOperation(operation)) {
            this.view.error(operation + "������ʱ����ִ��");
            return;
        }
        */
    }
});
