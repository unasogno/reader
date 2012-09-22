var ButtonStyle = { height: "26px", width: "32px" };

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

var User = new Class;
User.extend({
    getCurrentUser : function() {
        return "某人";
    }
});

var TaskStatus = {
    open : "待认领",
    claimed : "已认领",
    done : "已完成"
};

var Task = new Class;

Task.extend({
    loadTasks : function(serviceUrls) {
        return new Array(
            new Task({
                id: 1, bookName: "大数据", bookUrl: "http://t.cn/zlPvabt", 
                pages: "1-10", status: "待认领", owner: "无"
            }),
            new Task({
                id: 2, bookName: "数学之美", bookUrl: "http://t.cn/zlPvabc", 
                pages: "21-30", status: "已认领", owner: "某人"
            }),
            new Task({
                id: 3, bookName: "大数据", bookUrl: "http://t.cn/zlPvabt", 
                pages: "1-10", status: "待认领", owner: "无"
            }),
            new Task({
                id: 4, bookName: "数学之美", bookUrl: "http://t.cn/zlPvabc", 
                pages: "21-30", status: "已认领", owner: "某人"
            }),
            new Task({
                id: 5, bookName: "我们远去的家园", bookUrl: "http://t.cn/zlh4ksy",
                pages: "11-20", status: "待认领", owner: "无"
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
    claim : function(user) {
        if (this.status === TaskStatus.claimed) return false;
        this.owner = user;
        this.status = TaskStatus.claimed;
        return true;
    },
    upload : function(data) { 
        if (this.status === TaskStatus.done) return true;
        this.status = TaskStatus.done;
        return true;
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

TaskListView.extend({
    events : { 
        claim : "claim", 
        uploading : "uploading", 
        uploaded : "uploaded"
    }
});

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
        claimButton.css(ButtonStyle);
        
        var uploadButton = newRow.children("#operation").children("#upload");
        uploadButton.button({
            icons : { primary : "ui-icon-circle-arrow-n" }, 
            text : false
        });
        uploadButton.css(ButtonStyle);
        
        var self = this;
        claimButton.click(function(){
            var rowId = $(this).parent().parent().attr("id");
            self.publish(TaskListView.events.claim, rowId);
        });
        uploadButton.click(function() {
            var rowId = $(this).parent().parent().attr("id");
            var args = { rowId : rowId, cancel : false };
            self.publish(TaskListView.events.uploading, args);
            if (args.cancel) {
                self.info("操作取消");
                return;
            }
            $("#upload-form").dialog({ 
                modal : true,
                close : function() {
                    self.publish("uploaded", { rowId : rowId } );
                }
            });
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
        this.view.subscribe(
            TaskListView.events.claim, $.proxy(this.onClaim, this));
        this.view.subscribe(
            TaskListView.events.uploaded, $.proxy(this.onUploaded, this));
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
        
        var user = User.getCurrentUser();
        var result = task.claim(user);
        if (result) {
            this.view.updateTask(rowId, task);
            this.view.info("领取成功");
        } else {
            this.view.warn("领取失败，请重试");
        }
    },
    onUploaded : function(args) {
        var map = this.taskMap;
        var task = map[args.rowId];
        if (typeof task == undefined) return;
        
        var result = task.upload();
        if (result) {
            this.view.updateTask(args.rowId, task);
            this.view.info("上传完成");
        } else {
            this.view.warn("上传失败，请重试");
        }
    }
});
