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

var PubSub = {
    subscribe : function(event, handler) {
        var handlers = this._handlers || (this._handlers = {});
        (this._handlers[event] || (this._handlers[event] = [])).push(handler);
        return this;
    },
    
    publish : function(event, handler) {
        var args = Array.prototype.slice.call(arguments, 0);
        var event = args.shift();
        var list, handlers ,i, l;
        if (!(handlers = this._handlers)) return this;
        if (!(list = this._handlers[event])) return this;
        
        for (i = 0, l = list.length; i < l; i++) {
            list[i].apply(this, args);
        }
        return this;
    }
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
    claim : function() {
        if (this.status === "������") return false;
        this.status = "������";
        return true;
    },
    upload : function() { 
        if (this.status === "�����") return true;
        this.status = "�����";
        return true;
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

var Notifier = {
    info : function(message) {
        $("#info").html(message);
        $("#info").dialog();
    },
    warn : function(message) {
        $("#warn").html(message);
        $("#warn").dialog({
            modal : true
        });
    },
    error : function(message) {
        $("#error").html(message);
        $("#error").dialog({
            modal : true
        });
    }
};

var TaskListView = new Class;
TaskListView.include(PubSub);
TaskListView.include(Notifier);
TaskListView.include({
    init : function(table) {
        this.table = table; 
    },
    refreshRow : function(row, task) {
        var nameLink = row.children('#name').children("a");
        nameLink.html(task.bookName);
        nameLink.attr("href", task.bookUrl);
        
        row.children("#pages").html(task.pages);
        row.children("#status").html(task.status);
        row.children("#owner").html(task.owner);
    },
    addRow : function(task) {
        var newRow = $("#task-row-template").clone();
        newRow.attr("id", task.id);
        
        this.refreshRow(newRow, task);
        
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
        claimButton.click(function(){ 
            var event = $(this).attr("id");
            var rowId = $(this).parent().parent().attr("id");
            self.publish(event, rowId);
        });
        uploadButton.click(function() {
            var event = $(this).attr("id");
            var rowId = $(this).parent().parent().attr("id");
            self.publish(event, rowId);
        });
        
        newRow.appendTo($(this.table)[0]);
        return task.id;
    },
    updateTask : function(rowId, task) {
        var id = "#" + rowId;
        var row = $(this.table).find(id);
        
        this.refreshRow(row, task);
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
    init: function(view) { 
        this.view = view; 
        this.taskMap = null;
        this.view.subscribe("claim", $.proxy(this.onClaim, this));
        this.view.subscribe("upload", $.proxy(this.onUpload, this));
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
    onClaim : function(rowId) {
        var map = this.taskMap;
        var task = map[rowId];
        if (typeof task == undefined) return;
        
        var result = task.claim();
        if (result) {
            this.view.updateTask(rowId, task);
            this.view.info("��ȡ�ɹ�");
        } else {
            this.view.warn("��ȡʧ�ܣ�������");
        }
    },
    onUpload : function(rowId) {
        var map = this.taskMap;
        var task = map[rowId];
        if (typeof task == undefined) return;
        
        var result = task.upload();
        if (result) {
            this.view.updateTask(rowId, task);
            this.view.info("�ϴ����");
        } else {
            this.view.warn("�ϴ�ʧ�ܣ�������");
        }
    }
});
