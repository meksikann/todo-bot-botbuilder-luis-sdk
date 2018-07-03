import mongojs from 'mongoist';
import config from '../config';

let db = config.db;

async function addTask(todo) {
    try {
        const result = await db.todos.save(todo);

        return result;
    } catch (err) {
        throw err;
    }
}

async function markAsDone(taskId) {
    try {
        const result = await db.collection('todos').update({'_id': mongojs.ObjectId(taskId)}, {$set: {'isDone': true}});

        return result;
    } catch (err) {
        throw err;
    }
}

async function removeTask(taskId) {
    try {
        const result = await db.collection('todos').update({'_id': mongojs.ObjectId(taskId)}, {$set: {'isRemoved': true}});

        return result;
    } catch (err) {
        throw err;
    }
}

async function getAllTasks(userId) {
    const findQuery = {'userId': userId, 'isRemoved': false};

    try {
        let todos = await db.collection('todos').findAsCursor(findQuery).toArray();

        return todos;
    } catch (err) {
        throw err;
    }
}

async function getActiveTasks(userId) {
    try {
        const findQuery = {'userId': userId, 'isRemoved': false, 'isDone': false};

        let todos = await db.collection('todos').findAsCursor(findQuery).toArray();

        return todos;
    } catch (err) {
        throw err;
    }
}

async function removeAllTasks (userId) {
    try {
        const findQuery = {'userId': userId};

        const result = await db.collection('todos').update(findQuery, {$set: {'isRemoved': true}},{multi: true});

        return result;
    } catch (err) {
        throw err;
    }
}

export {addTask, markAsDone, removeTask, getActiveTasks, getAllTasks, removeAllTasks}