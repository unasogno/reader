$(document).ready(function() {

  $("#refresh").button({
    icons : { primary : "ui-icon-refresh" }, 
    text : true
  }).css(ButtonStyle).click(function() {
    var view = new TaskListView("#tasks");
    var controller = new TaskListController(view);
    var tasks = Task.loadTasks("url:None");
    controller.showTasks(tasks);
  });
  
  $("#reset").button({
    icons : { primary : "ui-icon-power" }, 
    text : true
  }).css(ButtonStyle).click(function() {
    var tbody = $("#tasks")[0];
    var rowCount = tbody.rows.length;
    for (var i = rowCount - 1; i >= 1; i--) {
        tbody.deleteRow(i);
    }
  });
  
  $("#template").hide();
  $("#notifier").hide();
  $("#upload-form").hide();
});