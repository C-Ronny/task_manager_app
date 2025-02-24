<?php
include './db_connect.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Read all tasks
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM tasks";
    $result = $conn->query($sql);
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    echo json_encode($tasks);
}

// Create a task
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $title = $conn->real_escape_string($data['title']);
    $description = $conn->real_escape_string($data['description']);
    $category = $conn->real_escape_string($data['category']);
    $status = $conn->real_escape_string($data['status']);

    $sql = "INSERT INTO tasks (title, description, category, status) VALUES ('$title', '$description', '$category', '$status')";
    if ($conn->query($sql) === TRUE) {
        $taskId = $conn->insert_id; // Get the ID of the newly created task
        echo json_encode(['id' => $taskId, 'message' => 'Task created']);
    } else {
        echo json_encode(['error' => $conn->error]);
    }
}

// Update a task (e.g., mark as completed)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $status = $conn->real_escape_string($data['status']);

    $sql = "UPDATE tasks SET status='$status' WHERE id=$id";
    if ($conn->query($sql)) {
        echo json_encode(['message' => 'Task updated']);
    } else {
        echo json_encode(['error' => $conn->error]);
    }
}

// Delete a task
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $sql = "DELETE FROM tasks WHERE id=$id";
    if ($conn->query($sql)) {
        echo json_encode(['message' => 'Task deleted']);
    } else {
        echo json_encode(['error' => $conn->error]);
    }
}
?>