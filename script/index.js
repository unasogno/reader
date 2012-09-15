$(document).ready(function() {
  $("#load").click(function() {
    var view = new TaskListView("#tasks", TaskOperationView);
    var controller = new TaskListController(view);
    var tasks = Task.loadTasks("url:None");
    controller.load(tasks);
  });
  
  $("#reset").click(function() {
    var tbody = $("#tasks")[0];
    var rowCount = tbody.rows.length;
    for (var i = rowCount - 1; i >= 1; i--) {
        tbody.deleteRow(i);
    }
  });
});