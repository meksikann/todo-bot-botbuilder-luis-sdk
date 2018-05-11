function getFormatedTodos(todos) {
    let todosResponse = '';

    todos.forEach(todo => {
        let item = todo.isDone ? `- ~~${todo.title}~~<br/>` : `- ${todo.title}<br/>`;

        todosResponse += item;
    });

    return todosResponse;
}

function getNumberedTodos(todos) {
    let todosResponse = '';

    todos.forEach((todo, index) => {
        let item = `${index + 1}) ${todo.title}<br/>`;

        todosResponse += item;
    });

    return todosResponse;
}

export { getFormatedTodos, getNumberedTodos };
