var app = angular.module("taskManagerApp", [])

app.controller("TaskController", ($scope, $http) => {
  $scope.tasks = []
  $scope.categories = ["Work", "Personal", "Shopping"]
  $scope.newTask = { title: "", description: "", category: "", status: "pending" }
  $scope.newCategory = ""

  // Fetch tasks
  $http
    .get("http://localhost/task_manager/api/tasks.php")
    .then((response) => {
      $scope.tasks = response.data
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error)
    })

  // Create a new task
  $scope.createTask = () => {
    if (!$scope.newTask.title) {
      alert("Title is required!")
      return
    }

    $http
      .post("http://localhost/task_manager/api/tasks.php", $scope.newTask)
      .then((response) => {
        // Add the new task to the list
        $scope.tasks.push({
          id: response.data.id,
          title: $scope.newTask.title,
          description: $scope.newTask.description,
          category: $scope.newTask.category,
          status: "pending",
        })

        // Reset the form
        $scope.newTask = { title: "", description: "", category: "", status: "pending" }
      })
      .catch((error) => {
        console.error("Error creating task:", error)
      })
  }

  // Add a new category
  $scope.addCategory = () => {
    if ($scope.newCategory && !$scope.categories.includes($scope.newCategory)) {
      $scope.categories.push($scope.newCategory)
      $scope.newCategory = ""
    }
  }

  // Drag and drop setup
  $(() => {
    $(".column")
      .sortable({
        connectWith: ".column",
        update: (event, ui) => {
          var taskId = ui.item.attr("data-task-id")
          var newStatus = ui.item.parent().attr("id")

          $http
            .put("http://localhost/task_manager/api/tasks.php", { id: taskId, status: newStatus })
            .then(() => {
              // Update the task status in the AngularJS model
              $scope.tasks.forEach((task) => {
                if (task.id == taskId) {
                  task.status = newStatus

                  // Update the task actions based on the new status
                  if (newStatus === "pending") {
                    ui.item
                      .find(".task-actions")
                      .html(
                        '<button ng-click="completeTask(' +
                          task.id +
                          ')" class="complete-btn"><i class="fas fa-check"></i></button>' +
                          '<button ng-click="deleteTask(' +
                          task.id +
                          ')" class="delete-btn"><i class="fas fa-trash"></i></button>',
                      )
                  } else {
                    ui.item
                      .find(".task-actions")
                      .html(
                        '<button ng-click="reopenTask(' +
                          task.id +
                          ')" class="reopen-btn"><i class="fas fa-undo"></i></button>' +
                          '<button ng-click="deleteTask(' +
                          task.id +
                          ')" class="delete-btn"><i class="fas fa-trash"></i></button>',
                      )
                  }
                  $scope.$apply()
                }
              })
            })
            .catch((error) => {
              console.error("Error updating task status:", error)
              // Revert the drag if there's an error
              ui.sender.sortable("cancel")
            })
        },
      })
      .disableSelection()
  })

  // Complete a task
  $scope.completeTask = (id) => {
    $http
      .put("http://localhost/task_manager/api/tasks.php", { id: id, status: "completed" })
      .then(() => {
        $scope.tasks.forEach((task) => {
          if (task.id === id) {
            task.status = "completed"
            // Move the task to the completed column
            $("#completed").append($('[data-task-id="' + id + '"]'))
            // Update the task actions
            $('[data-task-id="' + id + '"]')
              .find(".task-actions")
              .html(
                '<button ng-click="reopenTask(' +
                  id +
                  ')" class="reopen-btn"><i class="fas fa-undo"></i></button>' +
                  '<button ng-click="deleteTask(' +
                  id +
                  ')" class="delete-btn"><i class="fas fa-trash"></i></button>',
              )
            $scope.$apply()
          }
        })
      })
      .catch((error) => {
        console.error("Error completing task:", error)
      })
  }

  // Reopen a task
  $scope.reopenTask = (id) => {
    $http
      .put("http://localhost/task_manager/api/tasks.php", { id: id, status: "pending" })
      .then(() => {
        $scope.tasks.forEach((task) => {
          if (task.id === id) {
            task.status = "pending"
            // Move the task to the pending column
            $("#pending").append($('[data-task-id="' + id + '"]'))
            // Update the task actions
            $('[data-task-id="' + id + '"]')
              .find(".task-actions")
              .html(
                '<button ng-click="completeTask(' +
                  id +
                  ')" class="complete-btn"><i class="fas fa-check"></i></button>' +
                  '<button ng-click="deleteTask(' +
                  id +
                  ')" class="delete-btn"><i class="fas fa-trash"></i></button>',
              )
            $scope.$apply()
          }
        })
      })
      .catch((error) => {
        console.error("Error reopening task:", error)
      })
  }

  // Delete a task
  $scope.deleteTask = (id) => {
    $http
      .delete("http://localhost/task_manager/api/tasks.php?id=" + id)
      .then(() => {
        $scope.tasks = $scope.tasks.filter((task) => task.id !== id)
      })
      .catch((error) => {
        console.error("Error deleting task:", error)
      })
  }
})

